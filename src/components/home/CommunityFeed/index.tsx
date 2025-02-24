"use client";
import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, Share2 } from "lucide-react";
import { Comments } from "@/components/shared/Comments";
import Image from "next/image";

const feedItems = [
  {
    id: 1,
    user: {
      name: "李艺术",
      avatar: "https://placehold.co/600x400",
    },
    type: "completed", // completed, created, achieved
    content: "完成了一个超难的拼图！",
    puzzle: {
      title: "星空夜景",
      image: "https://placehold.co/600x400",
      timeSpent: "2小时30分",
    },
    likes: 124,
    comments: [
      {
        id: 1,
        user: {
          name: "张三",
          avatar: "https://placehold.co/600x400",
        },
        content: "太厉害了！",
        likes: 5,
        timestamp: "2024-03-20T10:30:00",
        replies: [],
      },
      // ... 更多评论
    ],
    commentsCount: 18,
    timestamp: "2小时前",
  },
  // ... 更多动态
];

// 模拟当前用户
const currentUser = {
  name: "当前用户",
  avatar: "https://placehold.co/600x400",
};

interface CommunityFeedProps {
  limit?: number;
  showAll?: boolean;
}

export const CommunityFeed: FC<CommunityFeedProps> = ({
  limit = 5,
  showAll = false,
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">社区动态</h2>
      <div className="space-y-4">
        {feedItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarImage src={item.user.avatar} />
                  <AvatarFallback>{item.user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{item.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.timestamp}
                  </p>
                </div>
              </div>

              <p className="mb-4">{item.content}</p>

              {item.puzzle && (
                <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={item.puzzle.image}
                    alt={item.puzzle.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white font-medium">
                      {item.puzzle.title}
                    </p>
                    <p className="text-white/80 text-sm">
                      用时：{item.puzzle.timeSpent}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Heart className="w-4 h-4" />
                  {item.likes}
                </Button>

                {/* 评论按钮和对话框 */}
                <Comments
                  postId={item.id}
                  comments={item.comments}
                  count={item.commentsCount}
                  currentUser={currentUser}
                />

                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
