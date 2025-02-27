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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Star, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import * as client from "@/services/client";
import { AtomFeatured } from "@/services/types";

// 原子类型
interface Atom {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  isFeatured: boolean;
}

export default function FeatureAtomDemo() {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [featuredAtoms, setFeaturedAtoms] = useState<AtomFeatured[]>([]);
  const [atoms, setAtoms] = useState<Atom[]>([]);
  const [selectedAtom, setSelectedAtom] = useState<Atom | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [reason, setReason] = useState("");
  const [order, setOrder] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 加载精选原子列表
  const loadFeaturedAtoms = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const response = await client.featureService.getFeaturedAtoms({
        page,
        pageSize: 10,
      });

      setFeaturedAtoms(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("加载精选原子失败:", error);
      toast.error("加载精选原子失败");
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载原子列表
  const loadAtoms = async () => {
    try {
      setLoading(true);
      const response = await client.atomService.getAtoms({
        page: 1,
        pageSize: 20,
        title: searchTerm,
      });
      setAtoms(response.data);
    } catch (error) {
      console.error("加载原子列表失败:", error);
      toast.error("加载原子列表失败");
    } finally {
      setLoading(false);
    }
  };

  // 设置原子为精选
  const featureAtom = async () => {
    if (!selectedAtom) {
      toast.error("请先选择一个原子");
      return;
    }

    try {
      setLoading(true);
      await client.atomService.addAtomToFeatured(
        selectedAtom.id,
        reason,
        order
      );

      toast.success("设置精选原子成功");
      setIsDialogOpen(false);
      setSelectedAtom(null);
      setReason("");
      setOrder(0);
      loadFeaturedAtoms(currentPage);
    } catch (error) {
      console.error("设置精选原子失败:", error);
      toast.error(error instanceof Error ? error.message : "设置精选原子失败");
    } finally {
      setLoading(false);
    }
  };

  // 取消原子精选
  const unfeatureAtom = async (atomId: number) => {
    try {
      setLoading(true);
      await client.atomService.removeAtomFromFeatured(atomId);

      toast.success("取消精选原子成功");
      loadFeaturedAtoms(currentPage);
    } catch (error) {
      console.error("取消精选原子失败:", error);
      toast.error(error instanceof Error ? error.message : "取消精选原子失败");
    } finally {
      setLoading(false);
    }
  };

  // 搜索原子
  const searchAtoms = () => {
    loadAtoms();
  };

  // 选择原子并打开对话框
  const selectAtom = (atom: Atom) => {
    setSelectedAtom(atom);
    setIsDialogOpen(true);
  };

  // 初始加载
  useEffect(() => {
    loadFeaturedAtoms(currentPage);
  }, [currentPage, loadFeaturedAtoms]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">原子精选管理</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="featured">
          <TabsList className="mb-4">
            <TabsTrigger value="featured">精选原子列表</TabsTrigger>
            <TabsTrigger value="add">添加精选原子</TabsTrigger>
          </TabsList>

          <TabsContent value="featured">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">精选原子</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadFeaturedAtoms(currentPage)}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  刷新
                </Button>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>标题</TableHead>
                      <TableHead>精选原因</TableHead>
                      <TableHead>排序权重</TableHead>
                      <TableHead>精选时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : featuredAtoms.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          暂无精选原子
                        </TableCell>
                      </TableRow>
                    ) : (
                      featuredAtoms.map((featured) => (
                        <TableRow key={featured.id}>
                          <TableCell>{featured.atom.id}</TableCell>
                          <TableCell>{featured.atom.title}</TableCell>
                          <TableCell>{featured.reason || "-"}</TableCell>
                          <TableCell>
                            {new Date(featured.featuredAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => unfeatureAtom(featured.atom.id)}
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              取消精选
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* 分页控制 */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
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
            </div>
          </TabsContent>

          <TabsContent value="add">
            <div className="space-y-4">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label htmlFor="search">搜索原子</Label>
                  <Input
                    id="search"
                    placeholder="输入原子标题或描述"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={searchAtoms} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  搜索
                </Button>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>标题</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : atoms.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          {searchTerm ? "没有找到匹配的原子" : "请搜索原子"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      atoms.map((atom) => (
                        <TableRow key={atom.id}>
                          <TableCell>{atom.id}</TableCell>
                          <TableCell>{atom.title}</TableCell>
                          <TableCell>
                            {new Date(atom.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={loading || atom.isFeatured}
                              onClick={() => selectAtom(atom)}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              设为精选
                            </Button>
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

        {/* 设置精选对话框 */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>设置精选原子</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="selected-atom">已选择原子</Label>
                <Input
                  id="selected-atom"
                  value={selectedAtom?.title || ""}
                  readOnly
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="reason">精选原因</Label>
                <Textarea
                  id="reason"
                  placeholder="请输入将此原子设为精选的原因"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="order">排序权重</Label>
                <Input
                  id="order"
                  type="number"
                  placeholder="数字越大排序越靠前"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={featureAtom} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                确认设置
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        精选原子将在首页和相关页面优先展示，请谨慎选择高质量内容
      </CardFooter>
    </Card>
  );
}
