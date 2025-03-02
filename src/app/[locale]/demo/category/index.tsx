"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import * as client from "@/services/client";
import { CreateCategoryParams } from "@/services";

interface CategoryData {
  id: number;
  name: string;
  description?: string;
  groupsCount?: number;
  atomsCount?: number;
  groups?: any[];
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryUpdateParams {
  name?: string;
  description?: string;
  language?: string;
}

export default function CategoryDebugComponent({ locale }: { locale: string }) {
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [updateData, setUpdateData] = useState<CategoryUpdateParams | null>(
    null
  );
  const [newCategory, setNewCategory] = useState<CategoryUpdateParams>({
    name: "",
    description: "",
    language: locale,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 获取分类信息
  const fetchCategoryData = async () => {
    if (!categoryId && !categoryName) {
      setError("请输入分类 ID 或名称");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let data;
      if (categoryId) {
        data = await client.categoryService.getCategoryById(
          parseInt(categoryId)
        );
      } else if (categoryName) {
        data = await client.categoryService.getCategoryByName(categoryName);
      }

      setCategoryData(data!);

      // 初始化更新表单数据
      setUpdateData({
        name: data!.name || "",
        description: data!.description || "",
      });

      setSuccess("获取分类成功");
    } catch (err: any) {
      setError(err.message || "获取分类失败");
      console.error("获取分类错误:", err);
    } finally {
      setLoading(false);
    }
  };

  // 更新分类信息
  const updateCategoryData = async () => {
    if (!categoryId) {
      setError("请输入分类 ID");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await client.categoryService.updateCategoryById(
        parseInt(categoryId),
        updateData!
      );
      setCategoryData(data!);
      setSuccess("更新分类成功");
    } catch (err: any) {
      setError(err.message || "更新分类失败");
      console.error("更新分类错误:", err);
    } finally {
      setLoading(false);
    }
  };

  // 创建新分类
  const createCategory = async () => {
    if (!newCategory.name) {
      setError("分类名称不能为空");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await client.categoryService.createCategory(
        newCategory as CreateCategoryParams
      );
      setCategoryData(data);
      setSuccess("创建分类成功");

      // 重置表单
      setNewCategory({
        name: "",
        description: "",
      });
    } catch (err: any) {
      setError(err.message || "创建分类失败");
      console.error("创建分类错误:", err);
    } finally {
      setLoading(false);
    }
  };

  // 删除分类
  const deleteCategory = async () => {
    if (!categoryId) {
      setError("请输入分类 ID 或名称");
      return;
    }

    if (!confirm("确定要删除此分类吗？此操作不可撤销。")) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await client.categoryService.deleteCategoryById(parseInt(categoryId));

      setCategoryData(null);
      setUpdateData(null);
      setSuccess("删除分类成功");
    } catch (err: any) {
      setError(err.message || "删除分类失败");
      console.error("删除分类错误:", err);
    } finally {
      setLoading(false);
    }
  };

  // 处理表单字段变化
  const handleUpdateChange = (
    field: keyof CategoryUpdateParams,
    value: string
  ) => {
    setUpdateData(
      (prev) => ({ ...prev, [field]: value } as CategoryUpdateParams)
    );
  };

  // 处理新分类表单字段变化
  const handleNewCategoryChange = (
    field: keyof CategoryUpdateParams,
    value: string
  ) => {
    setNewCategory((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>分类调试工具</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="query">
          <TabsList className="mb-4">
            <TabsTrigger value="query">查询分类</TabsTrigger>
            <TabsTrigger value="create">创建分类</TabsTrigger>
          </TabsList>

          <TabsContent value="query">
            <div className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="categoryId">分类 ID</Label>
                  <Input
                    id="categoryId"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    placeholder="输入分类 ID"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="categoryName">或分类名称</Label>
                  <Input
                    id="categoryName"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="输入分类名称"
                  />
                </div>
                <Button onClick={fetchCategoryData} disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  获取分类
                </Button>
              </div>

              {error && <div className="text-red-500 mb-4">{error}</div>}
              {success && <div className="text-green-500 mb-4">{success}</div>}

              {categoryData && (
                <Tabs defaultValue="info">
                  <TabsList className="mb-4">
                    <TabsTrigger value="info">分类信息</TabsTrigger>
                    <TabsTrigger value="update">更新分类</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info">
                    <div className="bg-slate-50 p-4 rounded-md">
                      <pre className="whitespace-pre-wrap overflow-auto max-h-96">
                        {JSON.stringify(categoryData, null, 2)}
                      </pre>
                    </div>
                    <Button
                      onClick={deleteCategory}
                      variant="destructive"
                      className="mt-4"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      删除分类
                    </Button>
                  </TabsContent>

                  <TabsContent value="update">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">名称</Label>
                        <Input
                          id="name"
                          value={updateData?.name || ""}
                          onChange={(e) =>
                            handleUpdateChange("name", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">描述</Label>
                        <Input
                          id="description"
                          value={updateData?.description || ""}
                          onChange={(e) =>
                            handleUpdateChange("description", e.target.value)
                          }
                        />
                      </div>

                      <Button
                        onClick={updateCategoryData}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        更新分类信息
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </TabsContent>

          <TabsContent value="create">
            <div className="space-y-4">
              <div>
                <Label htmlFor="newName">分类名称</Label>
                <Input
                  id="newName"
                  value={newCategory.name}
                  onChange={(e) =>
                    handleNewCategoryChange("name", e.target.value)
                  }
                  placeholder="输入新分类名称"
                />
              </div>

              <div>
                <Label htmlFor="newDescription">分类描述</Label>
                <Input
                  id="newDescription"
                  value={newCategory.description || ""}
                  onChange={(e) =>
                    handleNewCategoryChange("description", e.target.value)
                  }
                  placeholder="输入分类描述"
                />
              </div>

              <Button
                onClick={createCategory}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                创建新分类
              </Button>

              {error && <div className="text-red-500 mt-4">{error}</div>}
              {success && <div className="text-green-500 mt-4">{success}</div>}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        此组件仅用于调试目的，可以创建、获取、更新和删除分类信息
      </CardFooter>
    </Card>
  );
}
