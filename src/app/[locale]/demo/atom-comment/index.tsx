"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  Heart,
  MoreVertical,
  MessageSquare,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Atom, AtomComment } from "@/services/types";
import * as client from "@/services/client";

export default function AtomCommentDemo() {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<AtomComment[]>([]);
  const [selectedComment, setSelectedComment] = useState<AtomComment | null>(
    null
  );
  const [commentContent, setCommentContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [atomId, setAtomId] = useState(1); // 默认原子ID，实际应用中可能需要从URL或props获取

  // 加载评论列表
  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await client.atomCommentService.getComments(atomId, {
        page: currentPage,
        pageSize: 10,
      });

      setComments(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("加载评论失败:", error);
      toast.error("加载评论失败");
    } finally {
      setLoading(false);
    }
  }, [atomId, currentPage]);

  // 创建评论
  const createComment = async () => {
    if (!commentContent.trim()) {
      toast.error("评论内容不能为空");
      return;
    }

    try {
      setLoading(true);
      await client.atomCommentService.createComment(atomId, commentContent);

      toast.success("评论发布成功");
      setCommentContent("");
      loadComments();
    } catch (error) {
      console.error("发布评论失败:", error);
      toast.error("发布评论失败");
    } finally {
      setLoading(false);
    }
  };

  // 回复评论
  const replyToComment = async () => {
    if (!selectedComment) {
      toast.error("未选择要回复的评论");
      return;
    }

    if (!replyContent.trim()) {
      toast.error("回复内容不能为空");
      return;
    }

    try {
      setLoading(true);
      await client.atomCommentService.replyToComment(
        atomId,
        selectedComment.id,
        replyContent
      );

      toast.success("回复发布成功");
      setReplyContent("");
      setIsReplyDialogOpen(false);
      loadComments();
    } catch (error) {
      console.error("回复评论失败:", error);
      toast.error("回复评论失败");
    } finally {
      setLoading(false);
    }
  };

  // 编辑评论
  const editComment = async () => {
    if (!selectedComment) {
      toast.error("未选择要编辑的评论");
      return;
    }

    if (!editContent.trim()) {
      toast.error("评论内容不能为空");
      return;
    }

    try {
      setLoading(true);
      await client.atomCommentService.updateComment(
        atomId,
        selectedComment.id,
        editContent
      );

      toast.success("评论更新成功");
      setEditContent("");
      setIsEditDialogOpen(false);
      loadComments();
    } catch (error) {
      console.error("更新评论失败:", error);
      toast.error("更新评论失败");
    } finally {
      setLoading(false);
    }
  };

  // 删除评论
  const deleteComment = async (commentId: number) => {
    try {
      setLoading(true);
      await client.atomCommentService.deleteComment(atomId, commentId);

      toast.success("评论删除成功");
      loadComments();
    } catch (error) {
      console.error("删除评论失败:", error);
      toast.error("删除评论失败");
    } finally {
      setLoading(false);
    }
  };

  // 点赞评论
  const likeComment = async (commentId: number) => {
    try {
      const comment = comments.find((c) => c.id === commentId);
      if (!comment) return;

      setLoading(true);

      if (comment.isLiked) {
        await client.atomCommentService.unlikeComment(atomId, commentId);
        toast.success("取消点赞成功");
      } else {
        await client.atomCommentService.likeComment(atomId, commentId);
        toast.success("点赞成功");
      }

      loadComments();
    } catch (error) {
      console.error("点赞操作失败:", error);
      toast.error("点赞操作失败");
    } finally {
      setLoading(false);
    }
  };

  // 打开回复对话框
  const openReplyDialog = (comment: AtomComment) => {
    setSelectedComment(comment);
    setReplyContent("");
    setIsReplyDialogOpen(true);
  };

  // 打开编辑对话框
  const openEditDialog = (comment: AtomComment) => {
    setSelectedComment(comment);
    setEditContent(comment.content);
    setIsEditDialogOpen(true);
  };

  // 初始加载和页面变化时加载评论
  useEffect(() => {
    loadComments();
  }, [currentPage, atomId, loadComments]);

  // 渲染评论项
  const renderComment = (comment: AtomComment) => (
    <div key={comment.id} className="space-y-2 p-4 border rounded-lg">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={comment.user.avatar || ""} />
            <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{comment.user.name}</div>
            <div className="text-sm text-gray-500">
              {new Date(comment.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openReplyDialog(comment)}>
              回复
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEditDialog(comment)}>
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => deleteComment(comment.id)}
            >
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="text-gray-700">{comment.content}</div>

      <div className="flex items-center gap-4 pt-2">
        <Button
          variant="ghost"
          size="sm"
          className={comment.isLiked ? "text-red-500" : ""}
          onClick={() => likeComment(comment.id)}
        >
          <Heart
            className={`h-4 w-4 mr-1 ${comment.isLiked ? "fill-red-500" : ""}`}
          />
          {comment.likesCount || 0}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => openReplyDialog(comment)}
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          {comment.repliesCount || 0}
        </Button>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-6 mt-4 space-y-4 border-l-2">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={reply.user.avatar || ""} />
                  <AvatarFallback>{reply.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="font-medium text-sm">{reply.user.name}</div>
                <div className="text-xs text-gray-500">
                  {new Date(reply.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="text-sm text-gray-700">{reply.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>原子评论</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Input
          placeholder="请输入原子ID"
          value={atomId}
          onChange={(e) => setAtomId(Number(e.target.value))}
        />
        {/* 评论输入框 */}
        <div className="flex gap-4">
          <Avatar>
            <AvatarFallback>用户</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="写下你的评论..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
            />
            <div className="flex justify-end">
              <Button onClick={createComment} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                发布评论
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* 评论列表 */}
        <div className="space-y-4">
          {loading && comments.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无评论，快来发表第一条评论吧！
            </div>
          ) : (
            <>
              {comments.map(renderComment)}

              {/* 分页控制 */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1 || loading}
                  >
                    上一页
                  </Button>
                  <span className="text-sm">
                    第 {currentPage} 页，共 {totalPages} 页
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages || loading}
                  >
                    下一页
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* 编辑评论对话框 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑评论</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="编辑你的评论..."
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                取消
              </Button>
              <Button onClick={editComment} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 回复评论对话框 */}
        <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>回复评论</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {selectedComment && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="font-medium text-sm">
                    {selectedComment.user.name} 说：
                  </div>
                  <div className="text-gray-700">{selectedComment.content}</div>
                </div>
              )}
              <Textarea
                placeholder="写下你的回复..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsReplyDialogOpen(false)}
              >
                取消
              </Button>
              <Button onClick={replyToComment} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                回复
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        请遵守社区规范，文明发言，共建和谐讨论环境
      </CardFooter>
    </Card>
  );
}
