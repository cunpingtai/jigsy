import { FC } from "react";
import { PuzzleCard } from "../PuzzleCard";

interface PuzzleGridProps {
  puzzles?: Array<{
    id: string;
    title: string;
    author: string;
    image: string;
    likes: number;
    difficulty: string;
    category?: string;
    subCategory?: string;
  }>;
}

// 示例数据
const mockPuzzles = [
  {
    id: "1",
    title: "春日樱花",
    author: "张三",
    image: "https://placehold.co/600x400",
    likes: 128,
    difficulty: "中等",
    category: "nature",
    subCategory: "花卉",
  },
  // ... 更多拼图数据
];

export const PuzzleGrid: FC<PuzzleGridProps> = ({ puzzles = mockPuzzles }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {puzzles.map((puzzle) => (
        <PuzzleCard key={puzzle.id} puzzle={puzzle} />
      ))}
    </div>
  );
};
