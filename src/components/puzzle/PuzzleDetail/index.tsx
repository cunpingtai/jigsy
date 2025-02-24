/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Comments } from "@/components/shared/Comments";
import {
  Heart,
  Share2,
  Clock,
  Puzzle,
  Users,
  Trophy,
  BookmarkPlus,
  Play,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export type PuzzleType = {
  id: number;
  title: string;
  description: string;
  image: string;
  creator: {
    name: string;
    avatar: string;
  };
  stats: {
    pieces: number;
    difficulty: "easy" | "medium" | "hard" | "expert";
    completions: number;
    avgTime: string;
    bestTime: string;
    likes: number;
  };
  progress?: {
    completed: number;
    total: number;
    lastPlayed: string;
  };
  comments: {
    id: number;
    user: {
      name: string;
      avatar: string;
    };
    content: string;
    likes: number;
    timestamp: string;
    replies?: any[];
  }[];
  commentsCount: number;
};

interface PuzzleDetailProps {
  puzzle: PuzzleType;
  currentUser: {
    name: string;
    avatar: string;
  };
}

const difficultyColors = {
  easy: "bg-green-500",
  medium: "bg-yellow-500",
  hard: "bg-orange-500",
  expert: "bg-red-500",
};

const difficultyLabels = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
  expert: "专家",
};

export const PuzzleDetail: FC<PuzzleDetailProps> = ({
  puzzle,
  currentUser,
}) => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：拼图预览和基本信息 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
                <Image
                  src={puzzle.image}
                  alt={puzzle.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{puzzle.title}</h1>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={puzzle.creator.avatar} />
                      <AvatarFallback>{puzzle.creator.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{puzzle.creator.name}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <BookmarkPlus className="w-4 h-4" />
                    收藏
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    分享
                  </Button>
                </div>
              </div>

              <p className="text-muted-foreground mb-6">{puzzle.description}</p>

              <div className="flex flex-wrap gap-4 mb-6">
                <Badge variant="secondary" className="gap-1">
                  <Puzzle className="w-4 h-4" />
                  {puzzle.stats.pieces} 片
                </Badge>
                <Badge
                  variant="secondary"
                  className={`gap-1 ${
                    difficultyColors[puzzle.stats.difficulty]
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  {difficultyLabels[puzzle.stats.difficulty]}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Users className="w-4 h-4" />
                  {puzzle.stats.completions} 人完成
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Clock className="w-4 h-4" />
                  平均用时 {puzzle.stats.avgTime}
                </Badge>
              </div>

              <div className="flex gap-4">
                <Button size="lg" className="gap-2 flex-1">
                  <Link
                    className="gap-2 flex-1 flex items-center justify-center"
                    href={`/puzzle/${puzzle.id}/play`}
                  >
                    <Play className="w-5 h-5" />
                    开始拼图
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="gap-2">
                  <Heart className="w-5 h-5" />
                  {puzzle.stats.likes}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 评论区 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">评论区</h2>
                <span className="text-muted-foreground">
                  {puzzle.commentsCount} 条评论
                </span>
              </div>

              <Comments
                postId={puzzle.id}
                comments={puzzle.comments}
                count={puzzle.commentsCount}
                currentUser={currentUser}
                inline={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* 右侧：进度和统计信息 */}
        <div className="space-y-6">
          {/* 进度卡片 */}
          {puzzle.progress && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">我的进度</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>完成进度</span>
                      <span>
                        {Math.round(
                          (puzzle.progress.completed / puzzle.progress.total) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (puzzle.progress.completed / puzzle.progress.total) *
                        100
                      }
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    上次游玩：{puzzle.progress.lastPlayed}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 统计信息卡片 */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">拼图统计</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">最快完成</span>
                  <span className="font-medium">{puzzle.stats.bestTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">平均用时</span>
                  <span className="font-medium">{puzzle.stats.avgTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">完成人数</span>
                  <span className="font-medium">
                    {puzzle.stats.completions}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">总点赞数</span>
                  <span className="font-medium">{puzzle.stats.likes}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
