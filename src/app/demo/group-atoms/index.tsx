"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { FolderOpen } from "lucide-react";

interface GroupData {
  id: number;
  name: string;
  description: string | null;
  categoryId: number;
  category: {
    id: number;
    name: string;
  };
  atomsCount: number;
  atoms: Array<{
    id: number;
    title: string;
    coverImage: string | null;
    status: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function GroupDemo() {
  const searchParams = useSearchParams();
  const groupName = searchParams.get("name") || "";
  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupName) {
      setError("请提供分组名称");
      setLoading(false);
      return;
    }

    const fetchGroupData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/group/${encodeURIComponent(groupName)}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "获取分组数据失败");
        }

        const data = await response.json();
        setGroupData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取分组数据失败");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupName]);

  if (loading) {
    return <GroupSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <FolderOpen className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">出错了</h2>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (!groupData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <FolderOpen className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">未找到分组</h2>
        <p className="text-gray-500">
          找不到名为 &quot;{groupName}&quot; 的分组
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Link href={`/category/${groupData.category.name}`}>
            <Badge variant="outline" className="hover:bg-gray-100">
              {groupData.category.name}
            </Badge>
          </Link>
        </div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FolderOpen className="h-6 w-6" />
          {groupData.name}
        </h1>
        {groupData.description && (
          <p className="mt-2 text-gray-600">{groupData.description}</p>
        )}
        <div className="mt-4">
          <Badge variant="outline" className="text-sm">
            {groupData.atomsCount} 个原子
          </Badge>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold">原子列表</h2>
      </div>

      {groupData.atoms.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupData.atoms.map((atom) => (
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
                  <CardTitle className="line-clamp-2">{atom.title}</CardTitle>
                  <CardDescription>
                    <Badge
                      variant={
                        atom.status === "PUBLISHED" ? "default" : "secondary"
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
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg">
      <FolderOpen className="w-12 h-12 text-gray-400 mb-4" />
      <h3 className="text-xl font-medium text-gray-700 mb-2">没有原子</h3>
      <p className="text-gray-500 text-center max-w-md">
        该分组下暂时没有原子内容
      </p>
    </div>
  );
}

function GroupSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 animate-pulse">
      <div className="mb-8">
        <div className="h-6 w-24 bg-gray-200 rounded mb-2"></div>
        <div className="h-10 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-full max-w-md bg-gray-200 rounded mb-4"></div>
        <div className="h-6 w-20 bg-gray-200 rounded mt-4"></div>
      </div>

      <div className="mb-6">
        <div className="h-8 w-32 bg-gray-200 rounded"></div>
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
