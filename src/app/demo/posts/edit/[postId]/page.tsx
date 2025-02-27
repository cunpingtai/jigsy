"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, X, Search } from "lucide-react";
import { toast } from "sonner";
import * as client from "@/services/client";
import { Post, Tag } from "@/services/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = Number(params.postId);

  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  // 标签相关状态
  const [tagSearch, setTagSearch] = useState("");
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // 加载文章详情
  const loadPost = async () => {
    try {
      setLoading(true);
      const response = await client.postService.getPost(postId);
      setPost(response);
      setTitle(response.title);
      setContent(response.content);
      setCoverImage(response.coverImage || "");

      // 如果文章有标签，设置为已选标签
      if (response.tags && response.tags.length > 0) {
        setSelectedTags(response.tags);
      }
    } catch (error) {
      console.error("加载文章失败:", error);
      toast.error("加载文章失败");
      router.push("/demo/posts");
    } finally {
      setLoading(false);
    }
  };

  // 搜索标签
  const searchTags = async (query: string) => {
    try {
      setSearchLoading(true);
      let tags: Tag[] = [];

      if (query.trim() === "") {
        // 如果搜索为空，获取所有标签（限制20个）
        tags = await client.tagService.getTags();
      } else {
        // 否则搜索匹配的标签
        tags = await client.tagService.searchTags(query);
      }

      // 过滤掉已选择的标签
      const filteredTags = tags
        .filter(
          (tag) => !selectedTags.some((selected) => selected.id === tag.id)
        )
        .slice(0, 20); // 限制最多显示20个标签

      setAvailableTags(filteredTags);
    } catch (error) {
      console.error("搜索标签失败:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  // 选择标签
  const selectTag = (tag: Tag) => {
    setSelectedTags([...selectedTags, tag]);
    setAvailableTags(availableTags.filter((t) => t.id !== tag.id));
    setTagSearch("");
  };

  // 移除标签
  const removeTag = (tagId: number) => {
    const tagToRemove = selectedTags.find((tag) => tag.id === tagId);
    if (tagToRemove) {
      setSelectedTags(selectedTags.filter((tag) => tag.id !== tagId));

      // 如果当前搜索结果中应该包含这个标签，则添加回可用标签列表
      if (
        tagToRemove.name.toLowerCase().includes(tagSearch.toLowerCase()) ||
        tagSearch === ""
      ) {
        setAvailableTags([...availableTags, tagToRemove]);
      }
    }
  };

  // 更新文章
  const updatePost = async () => {
    if (!title.trim()) {
      toast.error("标题不能为空");
      return;
    }

    if (!content.trim()) {
      toast.error("内容不能为空");
      return;
    }

    try {
      setLoading(true);

      // 使用选中的标签ID
      const tagIds = selectedTags.map((tag) => tag.id);

      await client.postService.updatePost(postId, {
        title,
        content,
        coverImage: coverImage || undefined,
        tags: tagIds.length > 0 ? tagIds : undefined,
      });

      toast.success("文章更新成功");
      router.push(`/demo/posts/${postId}`);
    } catch (error) {
      console.error("更新文章失败:", error);
      toast.error("更新文章失败");
    } finally {
      setLoading(false);
    }
  };

  // 返回文章列表
  const goBack = () => {
    router.push(`/demo/posts/${postId}`);
  };

  useEffect(() => {
    if (postId) {
      loadPost();
      // 初始加载标签列表
      searchTags("");
    }
  }, [postId]);

  // 当搜索词变化时，搜索标签
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      searchTags(tagSearch);
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [tagSearch]);

  if (loading && !post) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" onClick={goBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        返回文章详情
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>编辑文章</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                placeholder="请输入文章标题"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">内容</Label>
              <Textarea
                id="content"
                placeholder="请输入文章内容"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">封面图片URL</Label>
              <Input
                id="coverImage"
                placeholder="请输入封面图片URL"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
              />
              {coverImage && (
                <div className="mt-2 rounded-md overflow-hidden h-40 w-full">
                  <img
                    src={coverImage}
                    alt="封面预览"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/400x200?text=图片加载失败";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">标签</Label>

              {/* 已选标签展示区域 */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => removeTag(tag.id)}
                        className="rounded-full hover:bg-gray-200 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* 标签搜索输入框 */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="tagSearch"
                  placeholder="搜索或添加标签"
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* 标签搜索结果 */}
              {availableTags.length > 0 && (
                <div className="border rounded-md mt-1 shadow-sm">
                  <ScrollArea className="h-[200px]">
                    <div className="p-2">
                      {searchLoading ? (
                        <div className="flex justify-center p-4">
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {availableTags.map((tag) => (
                            <div key={tag.id}>
                              <button
                                type="button"
                                className="w-full text-left px-2 py-1.5 hover:bg-gray-100 rounded-md flex justify-between items-center"
                                onClick={() => selectTag(tag)}
                              >
                                <span>{tag.name}</span>
                                <span className="text-xs text-gray-500">
                                  {tag.atomsCount} 篇文章
                                </span>
                              </button>
                              {tag !==
                                availableTags[availableTags.length - 1] && (
                                <Separator className="my-1" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <p className="text-xs text-gray-500">
                搜索并选择标签，或点击标签添加
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={goBack}>
            取消
          </Button>
          <Button onClick={updatePost} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            更新文章
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
