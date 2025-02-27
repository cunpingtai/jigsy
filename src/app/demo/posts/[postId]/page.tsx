"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
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
  MessageSquare,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  ArrowLeft,
  Send,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";
import * as client from "@/services/client";
import { Post, PostComment, CommentReply } from "@/services/types";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = parseInt(params.postId as string);

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [editCommentContent, setEditCommentContent] = useState("");
  const [selectedComment, setSelectedComment] = useState<PostComment | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsTotalPages, setCommentsTotalPages] = useState(1);
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<PostComment | null>(null);
  const isLiked = useMemo(() => post?.isLiked || false, [post?.isLiked]);
  // 加载文章详情
  const loadPostDetail = async () => {
    try {
      setLoading(true);
      const response = await client.postService.getPost(postId);
      setPost(response);
      setLikesCount(response.likesCount || 0);
    } catch (error) {
      console.error("加载文章详情失败:", error);
      toast.error("加载文章详情失败");
      router.push("/demo/posts");
    } finally {
      setLoading(false);
    }
  };

  // 加载文章评论
  const loadComments = async () => {
    try {
      const response = await client.postService.getPostComments(postId, {
        page: commentsPage,
        pageSize: 10,
      });
      setComments(response.data);
      setCommentsTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("加载评论失败:", error);
      toast.error("加载评论失败");
    }
  };

  // 创建评论
  const createComment = async () => {
    if (!commentContent.trim()) {
      toast.error("评论内容不能为空");
      return;
    }

    try {
      setLoading(true);
      await client.postService.createPostComment(postId, commentContent);
      toast.success("评论发布成功");
      setCommentContent("");
      loadComments();
      loadPostDetail(); // 刷新评论计数
    } catch (error) {
      console.error("发布评论失败:", error);
      toast.error("发布评论失败");
    } finally {
      setLoading(false);
    }
  };

  // 更新评论
  const updateComment = async () => {
    if (!selectedComment) return;

    if (!editCommentContent.trim()) {
      toast.error("评论内容不能为空");
      return;
    }

    try {
      setLoading(true);
      await client.postService.updatePostComment(
        selectedComment.id,
        editCommentContent
      );
      toast.success("评论更新成功");
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
    if (!confirm("确定要删除这条评论吗？")) return;

    try {
      setLoading(true);
      await client.postService.deletePostComment(commentId);
      toast.success("评论删除成功");
      loadComments();
      loadPostDetail(); // 刷新评论计数
    } catch (error) {
      console.error("删除评论失败:", error);
      toast.error("删除评论失败");
    } finally {
      setLoading(false);
    }
  };

  // 点赞/取消点赞文章
  const toggleLike = async () => {
    try {
      if (isLiked) {
        await client.postService.unlikePost(postId);
        setLikesCount((prev) => prev - 1);
        toast.success("已取消点赞");
      } else {
        await client.postService.likePost(postId);
        setLikesCount((prev) => prev + 1);
        toast.success("点赞成功");
      }
    } catch (error) {
      console.error("操作失败:", error);
      toast.error("操作失败");
    }
  };

  // 点赞/取消点赞评论
  const toggleCommentLike = async (commentId: number) => {
    try {
      const comment = comments.find((c) => c.id === commentId);
      if (!comment) return;

      if (comment.isLiked) {
        await client.postService.unlikePostComment(commentId);
        setComments(
          comments.map((c) =>
            c.id === commentId
              ? { ...c, isLiked: false, likesCount: c.likesCount - 1 }
              : c
          )
        );
      } else {
        await client.postService.likePostComment(commentId);
        setComments(
          comments.map((c) =>
            c.id === commentId
              ? { ...c, isLiked: true, likesCount: c.likesCount + 1 }
              : c
          )
        );
      }
    } catch (error) {
      console.error("操作失败:", error);
      toast.error("操作失败");
    }
  };

  // 编辑文章
  const editPost = () => {
    router.push(`/demo/posts/edit/${postId}`);
  };

  // 删除文章
  const deletePost = async () => {
    if (!confirm("确定要删除这篇文章吗？此操作不可恢复。")) return;

    try {
      setLoading(true);
      await client.postService.deletePost(postId);
      toast.success("文章删除成功");
      router.push("/demo/posts");
    } catch (error) {
      console.error("删除文章失败:", error);
      toast.error("删除文章失败");
    } finally {
      setLoading(false);
    }
  };

  // 返回文章列表
  const goBack = () => {
    router.push("/demo/posts");
  };

  // 打开编辑评论对话框
  const openEditCommentDialog = (comment: PostComment) => {
    setSelectedComment(comment);
    setEditCommentContent(comment.content);
    setIsEditDialogOpen(true);
  };

  // 创建评论回复
  const createReply = async (commentId: number) => {
    if (!replyContent.trim()) {
      toast.error("回复内容不能为空");
      return;
    }

    try {
      setLoading(true);
      await client.postService.createCommentReply(commentId, replyContent);
      toast.success("回复发布成功");
      setReplyContent("");
      setReplyingTo(null);
      loadComments();
    } catch (error) {
      console.error("发布回复失败:", error);
      toast.error("发布回复失败");
    } finally {
      setLoading(false);
    }
  };

  // 删除评论回复
  const deleteReply = async (replyId: number) => {
    if (!confirm("确定要删除这条回复吗？")) return;

    try {
      setLoading(true);
      await client.postService.deletePostComment(replyId);
      toast.success("回复删除成功");
      loadComments();
    } catch (error) {
      console.error("删除回复失败:", error);
      toast.error("删除回复失败");
    } finally {
      setLoading(false);
    }
  };

  // 开始回复评论
  const startReply = (comment: PostComment) => {
    setReplyingTo(comment);
    setReplyContent("");
  };

  // 取消回复
  const cancelReply = () => {
    setReplyingTo(null);
    setReplyContent("");
  };

  useEffect(() => {
    if (isNaN(postId)) {
      router.push("/demo/posts");
      return;
    }

    loadPostDetail();
  }, [postId]);

  useEffect(() => {
    if (post) {
      loadComments();
    }
  }, [post, commentsPage]);

  if (loading && !post) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p>文章不存在或已被删除</p>
        <Button onClick={goBack} className="mt-4">
          返回文章列表
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" onClick={goBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        返回文章列表
      </Button>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">{post.title}</CardTitle>
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={post.user.avatar} alt={post.user.name} />
                    <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{post.user.name}</span>
                </div>
                <div>{new Date(post.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={editPost}>
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500"
                onClick={deletePost}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {post.coverImage && (
            <div className="mb-6 rounded-md overflow-hidden h-64 w-full">
              <img
                src={post.coverImage}
                alt={post.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/800x400?text=图片加载失败";
                }}
              />
            </div>
          )}

          <div className="prose max-w-none">
            {post.content.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              <span>{post.viewsCount} 浏览</span>
            </div>
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{post.commentsCount} 评论</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={isLiked ? "text-red-500" : ""}
              onClick={toggleLike}
            >
              <Heart
                className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`}
              />
              <span>{likesCount} 点赞</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>评论区</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback>用户</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="写下你的评论..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="mb-2"
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

            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                暂无评论，快来发表第一条评论吧！
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage
                              src={comment.user.avatar}
                              alt={comment.user.name}
                            />
                            <AvatarFallback>
                              {comment.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {comment.user.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleCommentLike(comment.id)}
                            className={comment.isLiked ? "text-red-500" : ""}
                          >
                            <ThumbsUp
                              className={`h-4 w-4 ${
                                comment.isLiked ? "fill-current" : ""
                              }`}
                            />
                          </Button>
                          <span className="text-sm mr-2">
                            {comment.likesCount}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startReply(comment)}
                            className="mr-2"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            回复
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openEditCommentDialog(comment)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                编辑评论
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteComment(comment.id)}
                                className="text-red-500"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                删除评论
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="mt-2">{comment.content}</div>

                      {/* 回复输入框 */}
                      {replyingTo && replyingTo.id === comment.id && (
                        <div className="mt-4 ml-8 flex space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>用户</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <Textarea
                              placeholder={`回复 ${comment.user.name}...`}
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              className="mb-2 text-sm"
                            />
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelReply}
                              >
                                取消
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => createReply(comment.id)}
                                disabled={loading}
                              >
                                {loading ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                  <Send className="h-4 w-4 mr-1" />
                                )}
                                发布回复
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 显示评论回复 */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 ml-8 space-y-3">
                          {comment.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md"
                            >
                              <div className="flex justify-between">
                                <div className="flex items-center">
                                  <Avatar className="h-6 w-6 mr-2">
                                    <AvatarImage
                                      src={reply.user.avatar}
                                      alt={reply.user.name}
                                    />
                                    <AvatarFallback>
                                      {reply.user.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium text-sm">
                                      {reply.user.name}
                                      <span className="text-gray-500 ml-1">
                                        回复{" "}
                                        <span className="font-medium">
                                          {comment.user.name}
                                        </span>
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(
                                        reply.createdAt
                                      ).toLocaleString()}
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
                                    <DropdownMenuItem
                                      onClick={() => startReply(comment)}
                                    >
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      回复
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => deleteReply(reply.id)}
                                      className="text-red-500"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      删除回复
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <div className="mt-1 text-sm">
                                {reply.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {commentsTotalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCommentsPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={commentsPage === 1 || loading}
                >
                  上一页
                </Button>
                <span className="text-sm">
                  第 {commentsPage} 页，共 {commentsTotalPages} 页
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCommentsPage((prev) =>
                      Math.min(prev + 1, commentsTotalPages)
                    )
                  }
                  disabled={commentsPage === commentsTotalPages || loading}
                >
                  下一页
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 编辑评论对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑评论</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="编辑你的评论..."
              value={editCommentContent}
              onChange={(e) => setEditCommentContent(e.target.value)}
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
            <Button onClick={updateComment} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
