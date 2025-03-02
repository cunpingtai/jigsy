"use client";

import { useState, useEffect } from "react";
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
import { CreateGroupParams, Category } from "@/services/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GroupData {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  category?: Category;
  atomsCount?: number;
  atoms?: any[];
  createdAt?: string;
  updatedAt?: string;
}

interface GroupUpdateParams {
  name?: string;
  description?: string;
  categoryId?: number;
  language?: string;
}

export default function GroupDebugComponent({ locale }: { locale: string }) {
  const [groupId, setGroupId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [updateData, setUpdateData] = useState<GroupUpdateParams | null>(null);
  const [newGroup, setNewGroup] = useState<GroupUpdateParams>({
    name: "",
    description: "",
    categoryId: undefined,
    language: locale,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // 加载分类列表
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await client.categoryService.getCategories({
          language: locale,
        });
        setCategories(response.data || []);
      } catch (err: any) {
        console.error("获取分类列表错误:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [locale]);

  // 获取分组信息
  const fetchGroupData = async () => {
    if (!groupId && !groupName) {
      setError("请输入分组 ID 或名称");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let data;
      if (groupId) {
        data = await client.groupService.getGroupById(parseInt(groupId));
      } else if (groupName) {
        data = await client.groupService.getGroupByName(groupName);
      }

      setGroupData(data!);

      // 初始化更新表单数据
      setUpdateData({
        name: data!.name || "",
        description: data!.description || "",
        categoryId: data!.categoryId,
      });

      setSuccess("获取分组成功");
    } catch (err: any) {
      setError(err.message || "获取分组失败");
      console.error("获取分组错误:", err);
    } finally {
      setLoading(false);
    }
  };

  // 更新分组信息
  const updateGroupData = async () => {
    if (!groupId) {
      setError("请输入分组 ID");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await client.groupService.updateGroupById(
        parseInt(groupId),
        updateData!
      );

      setGroupData(data!);
      setSuccess("更新分组成功");
    } catch (err: any) {
      setError(err.message || "更新分组失败");
      console.error("更新分组错误:", err);
    } finally {
      setLoading(false);
    }
  };

  // 创建新分组
  const createGroup = async () => {
    if (!newGroup.name) {
      setError("分组名称不能为空");
      return;
    }

    if (!newGroup.categoryId) {
      setError("请选择所属分类");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await client.groupService.createGroup(
        newGroup as CreateGroupParams
      );
      setGroupData(data);
      setSuccess("创建分组成功");

      // 重置表单
      setNewGroup({
        name: "",
        description: "",
        categoryId: undefined,
      });
    } catch (err: any) {
      setError(err.message || "创建分组失败");
      console.error("创建分组错误:", err);
    } finally {
      setLoading(false);
    }
  };

  // 删除分组
  const deleteGroup = async () => {
    if (!groupId && !groupName) {
      setError("请输入分组 ID 或名称");
      return;
    }

    if (!confirm("确定要删除此分组吗？此操作不可撤销。")) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await client.groupService.deleteGroupById(parseInt(groupId));

      setGroupData(null);
      setUpdateData(null);
      setSuccess("删除分组成功");
    } catch (err: any) {
      setError(err.message || "删除分组失败");
      console.error("删除分组错误:", err);
    } finally {
      setLoading(false);
    }
  };

  // 处理表单字段变化
  const handleUpdateChange = (
    field: keyof GroupUpdateParams,
    value: string | number
  ) => {
    setUpdateData((prev) => ({ ...prev, [field]: value } as GroupUpdateParams));
  };

  // 处理新分组表单字段变化
  const handleNewGroupChange = (
    field: keyof GroupUpdateParams,
    value: string | number
  ) => {
    setNewGroup((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>分组调试工具</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="query">
          <TabsList className="mb-4">
            <TabsTrigger value="query">查询分组</TabsTrigger>
            <TabsTrigger value="create">创建分组</TabsTrigger>
          </TabsList>

          <TabsContent value="query">
            <div className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="groupId">分组 ID</Label>
                  <Input
                    id="groupId"
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    placeholder="输入分组 ID"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="groupName">或分组名称</Label>
                  <Input
                    id="groupName"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="输入分组名称"
                  />
                </div>
                <Button onClick={fetchGroupData} disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  获取分组
                </Button>
              </div>

              {error && <div className="text-red-500 mb-4">{error}</div>}
              {success && <div className="text-green-500 mb-4">{success}</div>}

              {groupData && (
                <Tabs defaultValue="info">
                  <TabsList className="mb-4">
                    <TabsTrigger value="info">分组信息</TabsTrigger>
                    <TabsTrigger value="update">更新分组</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info">
                    <div className="bg-slate-50 p-4 rounded-md">
                      <pre className="whitespace-pre-wrap overflow-auto max-h-96">
                        {JSON.stringify(groupData, null, 2)}
                      </pre>
                    </div>
                    <Button
                      onClick={deleteGroup}
                      variant="destructive"
                      className="mt-4"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      删除分组
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

                      <div>
                        <Label htmlFor="categoryId">所属分类</Label>
                        <Select
                          value={updateData?.categoryId?.toString()}
                          onValueChange={(value) =>
                            handleUpdateChange("categoryId", parseInt(value))
                          }
                        >
                          <SelectTrigger id="categoryId">
                            <SelectValue placeholder="选择分类" />
                          </SelectTrigger>
                          <SelectContent>
                            {loadingCategories ? (
                              <SelectItem value="loading" disabled>
                                加载中...
                              </SelectItem>
                            ) : (
                              categories.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id.toString()}
                                >
                                  {category.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={updateGroupData}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        更新分组信息
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
                <Label htmlFor="newName">分组名称</Label>
                <Input
                  id="newName"
                  value={newGroup.name}
                  onChange={(e) => handleNewGroupChange("name", e.target.value)}
                  placeholder="输入新分组名称"
                />
              </div>

              <div>
                <Label htmlFor="newDescription">分组描述</Label>
                <Input
                  id="newDescription"
                  value={newGroup.description || ""}
                  onChange={(e) =>
                    handleNewGroupChange("description", e.target.value)
                  }
                  placeholder="输入分组描述"
                />
              </div>

              <div>
                <Label htmlFor="newCategoryId">所属分类</Label>
                <Select
                  value={newGroup.categoryId?.toString()}
                  onValueChange={(value) =>
                    handleNewGroupChange("categoryId", parseInt(value))
                  }
                >
                  <SelectTrigger id="newCategoryId">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingCategories ? (
                      <SelectItem value="loading" disabled>
                        加载中...
                      </SelectItem>
                    ) : (
                      categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={createGroup}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                创建新分组
              </Button>

              {error && <div className="text-red-500 mt-4">{error}</div>}
              {success && <div className="text-green-500 mt-4">{success}</div>}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        此组件仅用于调试目的，可以创建、获取、更新和删除分组信息
      </CardFooter>
    </Card>
  );
}
