"use client";

import { PuzzleGame } from "@/components/puzzle/PuzzleGame";

// 示例数据
const puzzleData = {
  id: 1,
  title: "星空下的樱花",
  image:
    "https://images.unsplash.com/photo-1738402431249-c463ce6c407b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  pieces: 1000,
  difficulty: "medium",
};

export default function PuzzlePlayPage() {
  return (
    <div className="min-h-screen">
      <PuzzleGame puzzle={puzzleData} />
    </div>
  );
}
