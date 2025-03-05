"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { Tag } from "lucide-react";
import * as client from "@/services/client";
import { Tag as TagType } from "@/services/types";

interface TagData {
  id: number;
  name: string;
  description: string | null;
  atomsCount: number;
  atoms: Array<{
    id: number;
    title: string;
    coverImage: string | null;
    status: string;
  }>;
  postsCount: number;
  posts: Array<{
    id: number;
    title: string;
    status: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function TagDemo() {
  const searchParams = useSearchParams();
  const tagName = searchParams.get("name") || "";
  const [tagData, setTagData] = useState<TagType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tagName) {
      setError("请提供标签名称");
      setLoading(false);
      return;
    }

    const fetchTagData = async () => {
      try {
        setLoading(true);
        const response = await client.tagService.getTagByName(tagName);

        setTagData(response);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取标签数据失败");
      } finally {
        setLoading(false);
      }
    };

    fetchTagData();
  }, [tagName]);

  if (loading) {
    return <TagSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <Tag className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">出错了</h2>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (!tagData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <Tag className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">未找到标签</h2>
        <p className="text-gray-500">找不到名为 &quot;{tagName}&quot; 的标签</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Tag className="h-6 w-6" />
          {tagData.name}
        </h1>
        {tagData.description && (
          <p className="mt-2 text-gray-600">{tagData.description}</p>
        )}
        <div className="mt-4 flex gap-4">
          <Badge variant="outline" className="text-sm">
            {tagData.atomsCount} 个原子
          </Badge>
          <Badge variant="outline" className="text-sm">
            {tagData.postsCount} 篇文章
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="atoms" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="atoms">原子 ({tagData.atomsCount})</TabsTrigger>
          <TabsTrigger value="posts">文章 ({tagData.postsCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="atoms" className="space-y-6">
          {tagData.data.length === 0 ? (
            <EmptyState type="atom" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tagData.data.map((atom) => (
                <Link href={`/atom/${atom.id}`} key={atom.id}>
                  <Card className="h-full hover:shadow-md transition-shadow">
                    {atom.coverImage && (
                      <div className="relative w-full h-40 overflow-hidden rounded-t-lg">
                        <Image
                          src={atom.coverImage}
                          alt={atom.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className={atom.coverImage ? "pt-4" : ""}>
                      <CardTitle className="line-clamp-2">
                        {atom.title}
                      </CardTitle>
                      <CardDescription>
                        <Badge
                          variant={
                            atom.status === "PUBLISHED"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {atom.status === "PUBLISHED" ? "已发布" : "草稿"}
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-6">
          {tagData.posts.length === 0 ? (
            <EmptyState type="post" />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {tagData.posts.map((post) => (
                <Link href={`/post/${post.id}`} key={post.id}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>{post.title}</CardTitle>
                      <CardDescription>
                        <Badge
                          variant={
                            post.status === "PUBLISHED"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {post.status === "PUBLISHED" ? "已发布" : "草稿"}
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ type }: { type: "atom" | "post" }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg">
      <Tag className="w-12 h-12 text-gray-400 mb-4" />
      <h3 className="text-xl font-medium text-gray-700 mb-2">
        没有{type === "atom" ? "原子" : "文章"}
      </h3>
      <p className="text-gray-500 text-center max-w-md">
        该标签下暂时没有{type === "atom" ? "原子" : "文章"}内容
      </p>
    </div>
  );
}

function TagSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 animate-pulse">
      <div className="mb-8">
        <div className="h-10 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-full max-w-md bg-gray-200 rounded mb-4"></div>
        <div className="flex gap-4 mt-4">
          <div className="h-6 w-20 bg-gray-200 rounded"></div>
          <div className="h-6 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>

      <div className="mb-6">
        <div className="h-10 w-64 bg-gray-200 rounded"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-lg overflow-hidden">
            <div className="h-40 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-6 w-full bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
