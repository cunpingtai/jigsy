"use client";

import { PuzzleGame } from "@/components/puzzle/PuzzleGame";

// 示例数据
const puzzleData = {
  id: 1,
  title: "星空下的樱花",
  image: "https://cdn.mos.cms.futurecdn.net/Y8oFodGLyPJZRtKjyFjBLN-1200-80.jpg",
  pieces: 4,
  difficulty: "medium",
};

export default function PuzzlePlayPage() {
  return (
    <div className="min-h-screen">
      <PuzzleGame puzzle={puzzleData} />
    </div>
  );
}
