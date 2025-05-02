"use client"

import { useState } from "react"
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion"
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

export function FlashcardDeck() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState<Record<number, boolean>>({})
  const [swipeStates, setSwipeStates] = useState<Record<number, "left" | "right" | null>>({})

  const handleFlip = (index: number) => {
    setFlipped((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const handleSwipe = (direction: "left" | "right") => {
    setSwipeStates((prev) => ({ ...prev, [currentIndex]: direction }))

    // Move to the next card
    if (currentIndex < flashcards.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
      }, 300)
    } else {
      // All cards have been swiped
      setTimeout(() => {
        setCurrentIndex(0)
        setSwipeStates({})
        setFlipped({})
      }, 600)
    }
  }

  // Reset function for when all cards are done
  const resetDeck = () => {
    setCurrentIndex(0)
    setSwipeStates({})
    setFlipped({})
  }

  return (
    <div className="relative h-[500px] w-full">
      <div className="relative h-[400px] w-full">
        {/* Show the current card and the next card for a stacking effect */}
        <AnimatePresence>
          {[...flashcards].slice(currentIndex, currentIndex + 2).map((card, i) => {
            const index = currentIndex + i
            return (
              <Flashcard
                key={card.id}
                card={card}
                index={index}
                isTop={i === 0}
                flipped={!!flipped[index]}
                onFlip={() => handleFlip(index)}
                onSwipe={handleSwipe}
                zIndex={flashcards.length - i}
              />
            )
          })}
        </AnimatePresence>

        {/* Show message when all cards are done */}
        {currentIndex >= flashcards.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-xl shadow-xl"
          >
            <p className="text-xl font-medium mb-4">All cards completed!</p>
            <button
              onClick={resetDeck}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Start Over
            </button>
          </motion.div>
        )}
      </div>

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

interface FlashcardProps {
  card: (typeof flashcards)[0]
  index: number
  isTop: boolean
  flipped: boolean
  onFlip: () => void
  onSwipe: (direction: "left" | "right") => void
  zIndex: number
}

function Flashcard({ card, index, isTop, flipped, onFlip, onSwipe, zIndex }: FlashcardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-30, 30])
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5])

  // Transform x value to background color
  const background = useTransform(
    x,
    [-200, 0, 200],
    ["rgba(255, 245, 245, 0.5)", "rgba(255, 255, 255, 1)", "rgba(240, 255, 244, 0.5)"],
  )

  // Indicator opacity based on drag distance
  const leftIndicatorOpacity = useTransform(x, [-100, 0], [1, 0])
  const rightIndicatorOpacity = useTransform(x, [0, 100], [0, 1])

  const handleDragEnd = (_ : any, info  : any) => {
    const threshold = 100
    if (info.offset.x > threshold) {
      onSwipe("right")
    } else if (info.offset.x < -threshold) {
      onSwipe("left")
    }
  }

  return (
   
    </motion.div>
  )
}
