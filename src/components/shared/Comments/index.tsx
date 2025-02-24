"use client";

import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Heart, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistance } from "date-fns";
import { zhCN } from "date-fns/locale";

interface Comment {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  likes: number;
  timestamp: string;
  replies?: Comment[];
}

interface CommentsProps {
  postId: number;
  comments: Comment[];
  count: number;
  currentUser: {
    name: string;
    avatar: string;
  };
  inline?: boolean;
}

export const Comments: FC<CommentsProps> = ({
  postId,
  comments,
  count,
  currentUser,
  inline = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);

  const handleSubmitComment = () => {
    // TODO: 实现评论提交逻辑
    console.log({ postId, content: newComment, replyTo });
    setNewComment("");
    setReplyTo(null);
  };

  const CommentItem: FC<{ comment: Comment; level?: number }> = ({
    comment,
    level = 0,
  }) => (
    <div className={`space-y-4 ${level > 0 ? "ml-12" : ""}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user.avatar} />
          <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{comment.user.name}</span>
              <span className="text-sm text-muted-foreground">
                {formatDistance(new Date(comment.timestamp), new Date(), {
                  addSuffix: true,
                  locale: zhCN,
                })}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setReplyTo(comment.id)}>
                  回复
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  举报
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm">{comment.content}</p>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-1 h-8">
              <Heart className="w-4 h-4" />
              <span className="text-xs">{comment.likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 h-8"
              onClick={() => setReplyTo(comment.id)}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs">回复</span>
            </Button>
          </div>
        </div>
      </div>

      {comment.replies?.map((reply) => (
        <CommentItem key={reply.id} comment={reply} level={level + 1} />
      ))}

      {replyTo === comment.id && (
        <div className="flex gap-3 ml-12">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder={`回复 @${comment.user.name}`}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReplyTo(null)}
              >
                取消
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
              >
                回复
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const CommentInput = () => (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={currentUser.avatar} />
        <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <Textarea
          placeholder="写下你的评论..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[60px]"
        />
        <div className="flex justify-end">
          <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
            发布评论
          </Button>
        </div>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className="space-y-6">
        <CommentInput />
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <MessageSquare className="w-4 h-4" />
          {count}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>评论 ({count})</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-6 pr-4 -mr-4">
          <CommentInput />
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
