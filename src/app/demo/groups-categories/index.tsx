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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import * as client from "@/services/client";
import { Category, Group } from "@/services/types";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function ListDebugComponent() {
  // 分类列表状态
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryPageSize, setCategoryPageSize] = useState(10);
  const [categoryTotal, setCategoryTotal] = useState(0);
  const [categoryTotalPages, setCategoryTotalPages] = useState(0);
  const [categorySearch, setCategorySearch] = useState("");
  const [categorySortBy, setCategorySortBy] = useState<string>("name");
  const [categorySortOrder, setCategorySortOrder] = useState<"asc" | "desc">(
    "asc"
  );
  const [loadingCategories, setLoadingCategories] = useState(false);

  // 分组列表状态
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [loadingGroups, setLoadingGroups] = useState(false);

  // 错误和成功消息
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 加载分类列表
  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    setError("");

    try {
      const response = await client.categoryService.getCategories({
        page: categoryPage,
        pageSize: categoryPageSize,
        search: categorySearch,
        sortBy: categorySortBy,
        order: categorySortOrder,
      });

      setCategories(response.data || []);
      setCategoryTotal(response.pagination?.total || 0);
      setCategoryTotalPages(response.pagination?.totalPages || 0);
      setSuccess("获取分类列表成功");
    } catch (err: any) {
      setError(err.message || "获取分类列表失败");
      console.error("获取分类列表错误:", err);
    } finally {
      setLoadingCategories(false);
    }
  }, [
    categoryPage,
    categoryPageSize,
    categorySearch,
    categorySortBy,
    categorySortOrder,
  ]);

  // 加载分组列表
  const fetchGroups = async () => {
    if (!selectedCategoryId && selectedCategoryId !== "") {
      return;
    }

    setLoadingGroups(true);
    setError("");

    try {
      const params: any = {};
      if (selectedCategoryId && selectedCategoryId !== "all") {
        params.categoryId = parseInt(selectedCategoryId);
      }

      const response = await client.groupService.getGroups(params);
      setGroups(response.data || []);
      setSuccess("获取分组列表成功");
    } catch (err: any) {
      setError(err.message || "获取分组列表失败");
      console.error("获取分组列表错误:", err);
    } finally {
      setLoadingGroups(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchCategories();
  }, [
    categoryPage,
    categoryPageSize,
    categorySortBy,
    categorySortOrder,
    fetchCategories,
  ]);

  // 处理分类搜索
  const handleCategorySearch = () => {
    setCategoryPage(1); // 重置到第一页
    fetchCategories();
  };

  // 处理分类排序变更
  const handleSortChange = (field: string) => {
    if (categorySortBy === field) {
      // 如果已经按此字段排序，则切换排序方向
      setCategorySortOrder(categorySortOrder === "asc" ? "desc" : "asc");
    } else {
      // 否则，更改排序字段并设置为升序
      setCategorySortBy(field);
      setCategorySortOrder("asc");
    }
  };

  // 渲染排序指示器
  const renderSortIndicator = (field: string) => {
    if (categorySortBy !== field) return null;
    return categorySortOrder === "asc" ? " ↑" : " ↓";
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>数据列表查询工具</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="categories">
          <TabsList className="mb-4">
            <TabsTrigger value="categories">分类列表</TabsTrigger>
            <TabsTrigger value="groups">分组列表</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <div className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="categorySearch">搜索分类</Label>
                  <Input
                    id="categorySearch"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="输入分类名称或描述"
                  />
                </div>
                <Button
                  onClick={handleCategorySearch}
                  disabled={loadingCategories}
                >
                  {loadingCategories ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  搜索
                </Button>
              </div>

              {error && <div className="text-red-500 mb-4">{error}</div>}
              {success && <div className="text-green-500 mb-4">{success}</div>}

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSortChange("name")}
                      >
                        名称{renderSortIndicator("name")}
                      </TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSortChange("groupsCount")}
                      >
                        分组数{renderSortIndicator("groupsCount")}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSortChange("atomsCount")}
                      >
                        原子数{renderSortIndicator("atomsCount")}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSortChange("createdAt")}
                      >
                        创建时间{renderSortIndicator("createdAt")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingCategories ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          <span className="mt-2 block">加载中...</span>
                        </TableCell>
                      </TableRow>
                    ) : categories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          没有找到分类数据
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>{category.id}</TableCell>
                          <TableCell className="font-medium">
                            {category.name}
                          </TableCell>
                          <TableCell>{category.description || "-"}</TableCell>
                          <TableCell>{category.groupsCount || 0}</TableCell>
                          <TableCell>{category.atomsCount || 0}</TableCell>
                          <TableCell>
                            {new Date(category.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  共 {categoryTotal} 条记录，每页 {categoryPageSize} 条
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCategoryPage(Math.max(1, categoryPage - 1))
                        }
                        className={
                          categoryPage <= 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {Array.from(
                      { length: Math.min(5, categoryTotalPages) },
                      (_, i) => {
                        let pageNum;
                        if (categoryTotalPages <= 5) {
                          pageNum = i + 1;
                        } else if (categoryPage <= 3) {
                          pageNum = i + 1;
                        } else if (categoryPage >= categoryTotalPages - 2) {
                          pageNum = categoryTotalPages - 4 + i;
                        } else {
                          pageNum = categoryPage - 2 + i;
                        }

                        return (
                          <PaginationItem key={i}>
                            <PaginationLink
                              onClick={() => setCategoryPage(pageNum)}
                              isActive={categoryPage === pageNum}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                    )}

                    {categoryTotalPages > 5 &&
                      categoryPage < categoryTotalPages - 2 && (
                        <>
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink
                              onClick={() =>
                                setCategoryPage(categoryTotalPages)
                              }
                            >
                              {categoryTotalPages}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCategoryPage(
                            Math.min(categoryTotalPages, categoryPage + 1)
                          )
                        }
                        className={
                          categoryPage >= categoryTotalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>

                <Select
                  value={categoryPageSize.toString()}
                  onValueChange={(value) => {
                    setCategoryPageSize(parseInt(value));
                    setCategoryPage(1); // 重置到第一页
                  }}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="每页条数" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5条/页</SelectItem>
                    <SelectItem value="10">10条/页</SelectItem>
                    <SelectItem value="20">20条/页</SelectItem>
                    <SelectItem value="50">50条/页</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="groups">
            <div className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="categorySelect">选择分类</Label>
                  <Select
                    value={selectedCategoryId}
                    onValueChange={setSelectedCategoryId}
                  >
                    <SelectTrigger id="categorySelect">
                      <SelectValue placeholder="选择分类（可选）" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部分类</SelectItem>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={fetchGroups} disabled={loadingGroups}>
                  {loadingGroups ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  查询分组
                </Button>
              </div>

              {error && <div className="text-red-500 mb-4">{error}</div>}
              {success && <div className="text-green-500 mb-4">{success}</div>}

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>名称</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>所属分类</TableHead>
                      <TableHead>原子数</TableHead>
                      <TableHead>创建时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingGroups ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          <span className="mt-2 block">加载中...</span>
                        </TableCell>
                      </TableRow>
                    ) : groups.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          没有找到分组数据
                        </TableCell>
                      </TableRow>
                    ) : (
                      groups.map((group) => (
                        <TableRow key={group.id}>
                          <TableCell>{group.id}</TableCell>
                          <TableCell className="font-medium">
                            {group.name}
                          </TableCell>
                          <TableCell>{group.description || "-"}</TableCell>
                          <TableCell>{group.category?.name || "-"}</TableCell>
                          <TableCell>{group.atomsCount || 0}</TableCell>
                          <TableCell>
                            {new Date(group.createdAt).toLocaleString()}
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
        此组件用于查询分类和分组列表，分类支持分页和排序，分组支持按分类筛选
      </CardFooter>
    </Card>
  );
}
