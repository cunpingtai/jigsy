"use client";

import MainLayout from "@/components/layout/main-layout";
import { PuzzleDetail, PuzzleType } from "@/components/puzzle/PuzzleDetail";

const demoPuzzle: PuzzleType = {
  id: 1,
  title: "星空下的樱花",
  description:
    "这是一幅美丽的夜空下盛开的樱花图画，包含了丰富的色彩层次和细节。适合有一定拼图经验的玩家挑战。",
  image: "https://placehold.co/1200x800",
  creator: {
    name: "艺术创作者",
    avatar: "https://github.com/shadcn.png",
  },
  stats: {
    pieces: 1000,
    difficulty: "medium",
    completions: 1234,
    avgTime: "2小时30分",
    bestTime: "1小时15分",
    likes: 2891,
  },
  progress: {
    completed: 750,
    total: 1000,
    lastPlayed: "2024-03-20 15:30",
  },
  comments: [
    {
      id: 1,
      user: {
        name: "拼图爱好者",
        avatar: "https://github.com/shadcn.png",
      },
      content: "非常美丽的拼图，色彩搭配很和谐！",
      likes: 15,
      timestamp: "2024-03-20T10:30:00",
      replies: [],
    },
    // ... 更多评论
  ],
  commentsCount: 25,
};

const currentUser = {
  name: "当前用户",
  avatar: "https://github.com/shadcn.png",
};

export default function PuzzlePage() {
  return (
    <MainLayout>
      <PuzzleDetail puzzle={demoPuzzle} currentUser={currentUser} />
    </MainLayout>
  );
}
