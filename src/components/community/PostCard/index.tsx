/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, Share } from "lucide-react";
import { Comments } from "@/components/shared/Comments";
import Image from "next/image";

interface PostCardProps {
  post: {
    id: number;
    user: {
      name: string;
      avatar: string;
    };
    content: string;
    images?: string[];
    likes: number;
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
    timestamp: string;
  };
  currentUser: {
    name: string;
    avatar: string;
  };
}

export const PostCard: FC<PostCardProps> = ({ post, currentUser }) => {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {/* 用户信息 */}
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post.user.avatar} />
            <AvatarFallback>{post.user.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{post.user.name}</p>
            <p className="text-sm text-muted-foreground">{post.timestamp}</p>
          </div>
        </div>

        {/* 帖子内容 */}
        <p>{post.content}</p>

        {/* 图片展示 */}
        {post.images && post.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {post.images.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden"
              >
                <Image src={image} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t pt-4">
        <div className="flex items-center gap-4 w-full">
          <Button variant="ghost" size="sm" className="gap-2">
            <Heart className="w-4 h-4" />
            {post.likes}
          </Button>

          {/* 评论组件 */}
          <Comments
            postId={post.id}
            comments={post.comments}
            count={post.commentsCount}
            currentUser={currentUser}
          />

          <Button variant="ghost" size="sm" className="gap-2">
            <Share className="w-4 h-4" />
            分享
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
