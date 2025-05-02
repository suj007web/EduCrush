"use client"

import { useState } from "react"
import { useSprings, animated, to as interpolate } from "@react-spring/web"
import { useDrag } from "@use-gesture/react"
import { Check, X } from "lucide-react"

// Sample flashcard data
const flashcards = [
  {
    id: 1,
    question: "What is the capital of France?",
    answer: "Paris",
  },
  {
    id: 2,
    question: "What is the largest planet in our solar system?",
    answer: "Jupiter",
  },
  {
    id: 3,
    question: "What is the chemical symbol for gold?",
    answer: "Au",
  },
  {
    id: 4,
    question: "Who wrote 'Romeo and Juliet'?",
    answer: "William Shakespeare",
  },
  {
    id: 5,
    question: "What is the square root of 144?",
    answer: "12",
  },
]

// These two are just helpers, they curate spring data, values that are later being interpolated into css
const to = (i: number) => ({
  x: 0,
  y: i * -4,
  scale: 1,
  rot: -10 + Math.random() * 20,
  delay: i * 100,
})

const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 })

// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r: number, s: number) =>
  `perspective(1500px) rotateX(10deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`

export function FlashcardDeck() {
  const [gone] = useState(() => new Set()) // The set flags all the cards that are flicked out
  const [swipeStates, setSwipeStates] = useState<Record<number, "left" | "right" | null>>({})
  const [flipped, setFlipped] = useState<Record<number, boolean>>({})

  // Create a bunch of springs using the helpers above
  const [props, api] = useSprings(flashcards.length, (i) => ({
    ...to(i),
    from: from(i),
  }))

  // Create a gesture, we're interested in down-state, delta (current-pos - click-pos), direction and velocity
  const bind = useDrag(({ args: [index], active, movement: [mx], direction: [xDir], velocity: [vx] }) => {
    const trigger = vx > 0.2 // If you flick hard enough it should trigger the card to fly out
    if (!active && trigger) {
      gone.add(index) // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
      const direction = xDir < 0 ? "left" : "right"
      setSwipeStates((prev) => ({ ...prev, [index]: direction }))
    }
    api.start((i) => {
      if (index !== i) return // We're only interested in changing spring-data for the current spring
      const isGone = gone.has(index)
      // When a card is gone it flys out left or right, otherwise goes back to zero
      const x = isGone ? (200 + window.innerWidth) * xDir : active ? mx : 0
      // How much the card tilts, flicking it harder makes it rotate faster
      const rot = mx / 100 + (isGone ? xDir * 10 * vx : 0)
      // Active cards lift up a bit
      const scale = active ? 1.1 : 1
      return {
        x,
        rot,
        scale,
        delay: undefined,
        config: { friction: 50, tension: active ? 800 : isGone ? 200 : 500 },
      }
    })

    if (!active && gone.size === flashcards.length) {
      // All cards have been swiped, reset
      setTimeout(() => {
        gone.clear()
        setSwipeStates({})
        setFlipped({})
        api.start((i) => to(i))
      }, 600)
    }
  })

  const handleFlip = (index: number) => {
    setFlipped((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  return (
    <div className="relative h-[500px] w-full">
      {props.map(({ x, y, rot, scale }, i) => (
        <animated.div className="absolute w-full h-[400px] will-change-transform" key={i} style={{ x, y }}>
          {/* This is the card itself, we're binding our gesture to it (and inject its index so we know which is which) */}
          <animated.div
            {...bind(i)}
            className="relative touch-none bg-white rounded-xl shadow-xl w-full h-full cursor-grab flex items-center justify-center p-6 border border-gray-200"
            style={{
              transform: interpolate([rot, scale], trans),
              backgroundImage: `linear-gradient(to bottom, #ffffff, ${swipeStates[i] === "right" ? "#f0fff4" : swipeStates[i] === "left" ? "#fff5f5" : "#ffffff"})`,
            }}
            onClick={() => handleFlip(i)}
          >
            <div className="absolute top-4 right-4 text-sm font-medium text-gray-500">
              {i + 1}/{flashcards.length}
            </div>

            <div className="text-center">
              {flipped[i] ? (
                <div className="text-xl font-medium">{flashcards[i].answer}</div>
              ) : (
                <div className="text-xl font-medium">{flashcards[i].question}</div>
              )}
              <div className="mt-4 text-sm text-gray-500">Tap to flip • Swipe to answer</div>
            </div>

            {/* Swipe indicators */}
            <animated.div
              className="absolute inset-0 flex items-center justify-center"
              style={{ opacity: x.to({ output: [0, 1], map: Math.abs, range: [0, 50] }) }}
            >
              {x.to((x) =>
                x > 0 ? (
                  <div className="bg-green-500 bg-opacity-20 rounded-full p-4">
                    <Check className="h-12 w-12 text-green-500" />
                  </div>
                ) : (
                  <div className="bg-red-500 bg-opacity-20 rounded-full p-4">
                    <X className="h-12 w-12 text-red-500" />
                  </div>
                ),
              )}
            </animated.div>
          </animated.div>
        </animated.div>
      ))}

      {/* Swipe state display */}
      <div className="mt-8 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium mb-2">Swipe States:</h3>
        <div className="space-y-2">
          {Object.entries(swipeStates).map(([key, value]) => (
            <div key={key} className="flex items-center">
              <span className="font-medium">Card {Number.parseInt(key) + 1}:</span>
              <span className={`ml-2 ${value === "right" ? "text-green-500" : "text-red-500"}`}>
                {value === "right" ? "Right ✓" : "Left ✗"}
              </span>
            </div>
          ))}
          {Object.keys(swipeStates).length === 0 && <div className="text-gray-500">No cards swiped yet</div>}
        </div>
      </div>
    </div>
  )
}
