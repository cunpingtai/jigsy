"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Heart,
  MessageSquare,
  Eye,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import * as client from "@/services/client";
import { Post } from "@/services/types";

export default function PostsDemo() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [activeTab, setActiveTab] = useState("all");

  // 加载文章列表
  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await client.postService.getPosts({
        page: currentPage,
        pageSize: 10,
        keyword: searchTerm,
        sortBy,
        order,
      });

      setPosts(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("加载文章失败:", error);
      toast.error("加载文章失败");
    } finally {
      setLoading(false);
    }
  };

  // 加载精选文章
  const loadFeaturedPosts = async () => {
    try {
      setLoading(true);
      const response = await client.postService.getFeaturedPosts({
        page: 1,
        pageSize: 5,
      });

      setFeaturedPosts(response.data.map((item: any) => item.post));
    } catch (error) {
      console.error("加载精选文章失败:", error);
      toast.error("加载精选文章失败");
    } finally {
      setLoading(false);
    }
  };

  // 删除文章
  const deletePost = async (postId: number) => {
    if (!confirm("确定要删除这篇文章吗？此操作不可恢复。")) {
      return;
    }

    try {
      setLoading(true);
      await client.postService.deletePost(postId);
      toast.success("文章删除成功");
      loadPosts();
      if (activeTab === "featured") {
        loadFeaturedPosts();
      }
    } catch (error) {
      console.error("删除文章失败:", error);
      toast.error("删除文章失败");
    } finally {
      setLoading(false);
    }
  };

  // 搜索文章
  const searchPosts = () => {
    setCurrentPage(1);
    loadPosts();
  };

  // 重置搜索
  const resetSearch = () => {
    setSearchTerm("");
    setSortBy("createdAt");
    setOrder("desc");
    setCurrentPage(1);
    loadPosts();
  };

  // 切换标签页
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "featured") {
      loadFeaturedPosts();
    } else {
      loadPosts();
    }
  };

  // 创建新文章
  const createNewPost = () => {
    router.push("/demo/posts/create");
  };

  // 编辑文章
  const editPost = (postId: number) => {
    router.push(`/demo/posts/edit/${postId}`);
  };

  // 查看文章详情
  const viewPostDetail = (postId: number) => {
    router.push(`/demo/posts/${postId}`);
  };

  useEffect(() => {
    loadPosts();
  }, [currentPage]);

  // 添加文章到精选
  const addPostToFeatured = async (postId: number) => {
    await client.postService.addPostToFeatured(postId);
    toast.success("文章已添加到精选");
    loadFeaturedPosts();
  };

  // 渲染文章列表项
  const renderPostItem = (post: Post) => (
    <Card key={post.id} className="mb-4 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {post.coverImage && (
          <div className="w-full md:w-1/4 h-48 md:h-auto">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold mb-2">{post.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={post.user.avatar} />
                  <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{post.user.name}</span>
                <span>•</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                {post.isFeatured && (
                  <Badge className="bg-yellow-500">精选</Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={() => addPostToFeatured(post.id)}
              >
                <Heart className="h-4 w-4 mr-1" />
                {post.isFeatured ? "取消精选" : "精选"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => editPost(post.id)}
              >
                <Edit className="h-4 w-4 mr-1" />
                编辑
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deletePost(post.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                删除
              </Button>
            </div>
          </div>
          <p className="text-gray-600 mb-4 line-clamp-2">{post.content}</p>
          <div className="flex justify-between items-center">
            <div className="flex gap-4 text-gray-500">
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {post.viewsCount}
              </div>
              <div
                className="flex items-center"
                style={{ color: post.isLiked ? "red" : "" }}
              >
                <Heart className="h-4 w-4 mr-1" />
                {post.likesCount}
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                {post.commentsCount}
              </div>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => viewPostDetail(post.id)}
            >
              查看详情
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">文章管理</h1>
        <Button onClick={createNewPost}>
          <Plus className="h-4 w-4 mr-2" />
          创建新文章
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">所有文章</TabsTrigger>
          <TabsTrigger value="featured">精选文章</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>搜索文章</CardTitle>
              <CardDescription>使用以下选项筛选文章列表</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">关键词</Label>
                  <Input
                    id="search"
                    placeholder="搜索标题或内容"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sortBy">排序字段</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger id="sortBy">
                      <SelectValue placeholder="排序字段" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">创建时间</SelectItem>
                      <SelectItem value="updatedAt">更新时间</SelectItem>
                      <SelectItem value="viewsCount">浏览量</SelectItem>
                      <SelectItem value="likesCount">点赞数</SelectItem>
                      <SelectItem value="commentsCount">评论数</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">排序方式</Label>
                  <Select value={order} onValueChange={setOrder}>
                    <SelectTrigger id="order">
                      <SelectValue placeholder="排序方式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">降序</SelectItem>
                      <SelectItem value="asc">升序</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={resetSearch}>
                重置
              </Button>
              <Button onClick={searchPosts}>搜索</Button>
            </CardFooter>
          </Card>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                暂无文章，请创建新文章或调整搜索条件
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">{posts.map(renderPostItem)}</div>

              {/* 分页控制 */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                  <Button
                    variant="outline"
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
        </TabsContent>

        <TabsContent value="featured">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : featuredPosts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">暂无精选文章</p>
            </div>
          ) : (
            <div className="space-y-4">{featuredPosts.map(renderPostItem)}</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
