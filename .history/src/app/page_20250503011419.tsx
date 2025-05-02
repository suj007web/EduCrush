import { FlashcardDeck } from "@/components/flashcard-deck";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
    <h1 className="text-3xl font-bold mb-8 text-center">Flashcard Swiper</h1>
    <div className="w-full max-w-md">
      <FlashcardDeck />
    </div>
  </main>
  );
}
