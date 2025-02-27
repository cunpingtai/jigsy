"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import * as client from "@/services/client";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tag } from "@/services/types";

export default function TagDemo() {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("create");

  // 标签列表
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);

  // 创建标签表单
  const [tagName, setTagName] = useState("");
  const [tagDescription, setTagDescription] = useState("");

  // 更新标签表单
  const [updateTagId, setUpdateTagId] = useState("");
  const [updateTagName, setUpdateTagName] = useState("");
  const [updateTagDescription, setUpdateTagDescription] = useState("");

  // 查询标签表单
  const [searchTagId, setSearchTagId] = useState("");
  const [searchTagName, setSearchTagName] = useState("");
  const [searchResult, setSearchResult] = useState<Tag | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // 加载标签列表
  const fetchTags = async () => {
    setTagsLoading(true);
    try {
      const response = await client.tagService.getTags();
      setTags(response || []);
    } catch (err: any) {
      setError(err.message || "获取标签列表失败");
      console.error("获取标签列表错误:", err);
    } finally {
      setTagsLoading(false);
    }
  };

  // 创建标签
  const handleCreateTag = async () => {
    if (!tagName) {
      setError("标签名称不能为空");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await client.tagService.createTag({
        name: tagName,
        description: tagDescription,
      });

      setSuccess("标签创建成功");
      setTagName("");
      setTagDescription("");
      fetchTags(); // 刷新标签列表
    } catch (err: any) {
      setError(err.message || "创建标签失败");
      console.error("创建标签错误:", err);
    } finally {
      setLoading(false);
    }
  };

  // 更新标签
  const handleUpdateTag = async () => {
    if (!updateTagId) {
      setError("请选择要更新的标签");
      return;
    }

    if (!updateTagName) {
      setError("标签名称不能为空");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await client.tagService.updateTag(
        parseInt(updateTagId),
        {
          name: updateTagName,
          description: updateTagDescription,
        }
      );

      setSuccess("标签更新成功");
      fetchTags(); // 刷新标签列表
    } catch (err: any) {
      setError(err.message || "更新标签失败");
      console.error("更新标签错误:", err);
    } finally {
      setLoading(false);
    }
  };

  // 删除标签
  const handleDeleteTag = async (id: number) => {
    if (!confirm("确定要删除这个标签吗？")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await client.tagService.deleteTag(id);
      setSuccess("标签删除成功");
      fetchTags(); // 刷新标签列表
    } catch (err: any) {
      setError(err.message || "删除标签失败");
      console.error("删除标签错误:", err);
    }
  };

  // 查询标签
  const handleSearchTag = async () => {
    if (!searchTagId && !searchTagName) {
      setError("请输入标签ID或名称");
      return;
    }

    setSearchLoading(true);
    setError("");
    setSuccess("");
    setSearchResult(null);

    try {
      let response;
      if (searchTagId) {
        response = await client.tagService.getTag(parseInt(searchTagId));
      } else {
        response = await client.tagService.getTagByName(searchTagName);
      }

      setSearchResult(response);
      setSuccess("标签查询成功");
    } catch (err: any) {
      setError(err.message || "查询标签失败");
      console.error("查询标签错误:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  // 选择标签进行编辑
  const selectTagForEdit = (tag: Tag) => {
    setUpdateTagId(tag.id.toString());
    setUpdateTagName(tag.name);
    setUpdateTagDescription(tag.description || "");
    setActiveTab("update");
  };

  // 初始加载
  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>标签管理</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="create">创建标签</TabsTrigger>
            <TabsTrigger value="update">更新标签</TabsTrigger>
            <TabsTrigger value="search">查询标签</TabsTrigger>
            <TabsTrigger value="list">标签列表</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tagName">标签名称</Label>
                <Input
                  id="tagName"
                  placeholder="输入标签名称"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagDescription">标签描述</Label>
                <Textarea
                  id="tagDescription"
                  placeholder="输入标签描述（可选）"
                  value={tagDescription}
                  onChange={(e) => setTagDescription(e.target.value)}
                />
              </div>

              <Button
                onClick={handleCreateTag}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    创建中...
                  </>
                ) : (
                  "创建标签"
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="update">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="updateTagId">选择标签</Label>
                <select
                  id="updateTagId"
                  className="w-full p-2 border rounded"
                  value={updateTagId}
                  onChange={(e) => {
                    setUpdateTagId(e.target.value);
                    const selectedTag = tags.find(
                      (t) => t.id.toString() === e.target.value
                    );
                    if (selectedTag) {
                      setUpdateTagName(selectedTag.name);
                      setUpdateTagDescription(selectedTag.description || "");
                    }
                  }}
                >
                  <option value="">-- 选择标签 --</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="updateTagName">标签名称</Label>
                <Input
                  id="updateTagName"
                  placeholder="输入新的标签名称"
                  value={updateTagName}
                  onChange={(e) => setUpdateTagName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="updateTagDescription">标签描述</Label>
                <Textarea
                  id="updateTagDescription"
                  placeholder="输入新的标签描述（可选）"
                  value={updateTagDescription}
                  onChange={(e) => setUpdateTagDescription(e.target.value)}
                />
              </div>

              <Button
                onClick={handleUpdateTag}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    更新中...
                  </>
                ) : (
                  "更新标签"
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="search">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="searchTagId">标签ID</Label>
                  <Input
                    id="searchTagId"
                    placeholder="输入标签ID"
                    value={searchTagId}
                    onChange={(e) => setSearchTagId(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="searchTagName">标签名称</Label>
                  <Input
                    id="searchTagName"
                    placeholder="输入标签名称"
                    value={searchTagName}
                    onChange={(e) => setSearchTagName(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={handleSearchTag}
                disabled={searchLoading}
                className="w-full"
              >
                {searchLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    查询中...
                  </>
                ) : (
                  "查询标签"
                )}
              </Button>

              {searchResult && (
                <div className="mt-4 p-4 border rounded">
                  <h3 className="text-lg font-medium">查询结果</h3>
                  <div className="mt-2 space-y-2">
                    <p>
                      <span className="font-medium">ID:</span> {searchResult.id}
                    </p>
                    <p>
                      <span className="font-medium">名称:</span>{" "}
                      {searchResult.name}
                    </p>
                    <p>
                      <span className="font-medium">描述:</span>{" "}
                      {searchResult.description || "无"}
                    </p>
                    <p>
                      <span className="font-medium">原子数量:</span>{" "}
                      {searchResult.atomsCount || 0}
                    </p>
                    <p>
                      <span className="font-medium">创建时间:</span>{" "}
                      {new Date(searchResult.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => selectTagForEdit(searchResult)}
                    >
                      编辑
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteTag(searchResult.id)}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="list">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">标签列表</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchTags}
                  disabled={tagsLoading}
                >
                  {tagsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      刷新中
                    </>
                  ) : (
                    "刷新"
                  )}
                </Button>
              </div>

              <div className="border rounded overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>名称</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>原子数量</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tagsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : tags.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          暂无数据
                        </TableCell>
                      </TableRow>
                    ) : (
                      tags.map((tag) => (
                        <TableRow key={tag.id}>
                          <TableCell>{tag.id}</TableCell>
                          <TableCell>{tag.name}</TableCell>
                          <TableCell>
                            {tag.description || (
                              <span className="text-gray-400">无</span>
                            )}
                          </TableCell>
                          <TableCell>{tag.atomsCount || 0}</TableCell>
                          <TableCell>
                            {new Date(tag.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => selectTagForEdit(tag)}
                              >
                                编辑
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteTag(tag.id)}
                              >
                                删除
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        此组件用于演示标签相关API，包括创建、更新、查询和删除标签
      </CardFooter>
    </Card>
  );
}
