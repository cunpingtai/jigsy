/* eslint-disable @next/next/no-img-element */
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
import { Textarea } from "@/components/ui/textarea";
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
import { StandardAtomStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

export default function AtomDemo() {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("create");

  // 原子创建表单
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("https://picsum.photos/800/600");
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [tilesX, setTilesX] = useState("3");
  const [tilesY, setTilesY] = useState("3");
  const [width, setWidth] = useState("800");
  const [height, setHeight] = useState("600");
  const [seed, setSeed] = useState("12345");
  const [tabSize, setTabSize] = useState("30");
  const [jitter, setJitter] = useState("0.5");
  const [lineColor, setLineColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState("2");
  const [background, setBackground] = useState("#FFFFFF");
  const [distributionStrategy, setDistributionStrategy] =
    useState("SURROUNDING");

  // 原子查询
  const [atomId, setAtomId] = useState("");
  const [recordId, setRecordId] = useState("");
  const [atomDetails, setAtomDetails] = useState<any>(null);
  const [atomLoading, setAtomLoading] = useState(false);

  // 原子列表
  const [atoms, setAtoms] = useState<any[]>([]);
  const [atomsLoading, setAtomsLoading] = useState(false);

  // 分类和分组列表
  const [categories, setCategories] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [gameRecords, setGameRecords] = useState<any[]>([]);

  // 加载分类和分组
  useEffect(() => {
    const fetchCategoriesAndGroups = async () => {
      try {
        const categoriesResponse = await client.categoryService.getCategories();
        setCategories(categoriesResponse.data || []);
      } catch (err: any) {
        console.error("获取分类和分组失败:", err);
      }
    };

    fetchCategoriesAndGroups();
  }, []);

  const fetchGameRecords = useCallback(async () => {
    const data = await client.atomService.getAtomGameRecords(parseInt(atomId));
    setGameRecords(data.data || []);
  }, [atomId]);

  // 加载游戏记录
  useEffect(() => {
    if (!atomId) return;
    fetchGameRecords();
  }, [atomId, fetchGameRecords]);

  // 加载分类和分组
  useEffect(() => {
    if (!categoryId) return;
    const fetchCategoriesAndGroups = async () => {
      setGroups([]);

      try {
        const groupsResponse = await client.groupService.getGroupsByCategory(
          parseInt(categoryId)
        );
        setGroups(groupsResponse.data || []);
      } catch (err: any) {
        console.error("获取分类和分组失败:", err);
      }
    };

    fetchCategoriesAndGroups();
  }, [categoryId]);

  // 创建原子
  const handleCreateAtom = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const atomData = {
        title,
        content,
        coverImage,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        groupId: groupId ? parseInt(groupId) : undefined,
        tilesX: parseInt(tilesX),
        tilesY: parseInt(tilesY),
        width: parseInt(width),
        height: parseInt(height),
        distributionStrategy,
        seed: parseInt(seed),
        tabSize: parseInt(tabSize),
        jitter: parseFloat(jitter),
        lineColor,
        lineWidth: parseInt(lineWidth),
        background,
      };

      const data = await client.atomService.createAtom(atomData);

      setSuccess("原子创建成功");

      // 重置表单
      setTitle("");
      setContent("");
      // 其他字段保持不变，方便连续创建
    } catch (err: any) {
      setError(err.message || "创建原子失败");
      console.error("创建原子错误:", err);
    } finally {
      setLoading(false);
    }
  };

  // 获取原子详情
  const handleGetAtom = async () => {
    if (!atomId) {
      setError("请输入原子ID");
      return;
    }

    setAtomLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await client.atomService.getAtomById(parseInt(atomId));

      if (!response) {
        throw new Error("原子不存在");
      }

      setAtomDetails(response);
      setSuccess("获取原子成功");
    } catch (err: any) {
      setError(err.message || "获取原子失败");
      console.error("获取原子错误:", err);
    } finally {
      setAtomLoading(false);
    }
  };

  // 获取原子列表
  const fetchAtoms = async () => {
    setAtomsLoading(true);
    setError("");

    try {
      const response = await client.atomService.getUserAtoms();
      setAtoms(response.data || []);
      setSuccess("获取原子列表成功");
    } catch (err: any) {
      setError(err.message || "获取原子列表失败");
      console.error("获取原子列表错误:", err);
    } finally {
      setAtomsLoading(false);
    }
  };

  // 记录原子访问
  const handleRecordVisit = async (id: number) => {
    try {
      const data = await client.atomService.recordAtomVisit(id);
      setSuccess(`记录原子 ${data.id} 访问成功`);

      handleGetAtom();
    } catch (err: any) {
      setError(err.message || "记录访问失败");
    }
  };
  // 点赞原子
  const handleLikeAtom = async (id: number) => {
    try {
      if (atomDetails?.isLiked) {
        await client.atomService.unlikeAtom(id);
        setSuccess(`取消点赞原子 ${id} 成功`);
      } else {
        const data = await client.atomService.likeAtom(id);
        setSuccess(`点赞原子 ${data.id} 成功`);
      }

      handleGetAtom();
    } catch (err: any) {
      setError(err.message || "点赞失败");
    }
  };

  // 收藏原子
  const handleFavoriteAtom = async (id: number) => {
    try {
      if (atomDetails?.isFavorited) {
        await client.atomService.unfavoriteAtom(id);
        setSuccess(`取消收藏原子 ${id} 成功`);
      } else {
        const data = await client.atomService.favoriteAtom(id);
        setSuccess(`收藏原子 ${data.id} 成功`);
      }

      handleGetAtom();
    } catch (err: any) {
      setError(err.message || "点赞失败");
    }
  };

  // 开始游戏
  const handleStartGame = async (id: number) => {
    try {
      const data = await client.atomService.startAtomGame(id, {
        userId: 1,
      });
      setSuccess(`开始游戏原子 ${data.record.id} 成功`);
      setRecordId(data.record.id.toString());

      handleGetAtom();
      fetchGameRecords();
    } catch (err: any) {
      setError(err.message || "开始游戏失败");
    }
  };

  // 结束游戏
  const handleEndGame = async (id: number) => {
    try {
      const data = await client.atomService.completeAtomGame(
        id,
        parseInt(recordId),
        {
          duration: 100,
          moves: 10,
          completed: true,
          score: 100,
        }
      );
      setSuccess(`结束游戏原子 ${data.record.id} 成功`);
      fetchGameRecords();
    } catch (err: any) {
      setError(err.message || "结束游戏失败");
    }
  };

  // 更新原子状态
  const handleUpdateAtomStatus = async (
    id: number,
    status: StandardAtomStatus
  ) => {
    try {
      const newStatus = status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
      const data = await client.atomService.updateAtomStatus(id, newStatus);
      setSuccess(`更新原子状态成功`);
      handleGetAtom();
    } catch (err: any) {
      setError(err.message || "更新原子状态失败");
    }
  };

  // 加载原子列表
  useEffect(() => {
    if (activeTab === "list") {
      fetchAtoms();
    }
  }, [activeTab]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>原子 API 演示</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create">创建原子</TabsTrigger>
            <TabsTrigger value="get">获取原子</TabsTrigger>
            <TabsTrigger value="list">原子列表</TabsTrigger>
            <TabsTrigger value="game">游戏记录</TabsTrigger>
          </TabsList>

          {/* 创建原子表单 */}
          <TabsContent value="create">
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">标题</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="输入原子标题"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coverImage">封面图片</Label>
                  <Input
                    id="coverImage"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="输入封面图片URL"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">内容</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="输入原子内容"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryId">分类</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
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
                <div className="space-y-2">
                  <Label htmlFor="groupId">分组</Label>
                  <Select value={groupId} onValueChange={setGroupId}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择分组" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tilesX">横向切片数</Label>
                  <Input
                    id="tilesX"
                    value={tilesX}
                    onChange={(e) => setTilesX(e.target.value)}
                    placeholder="横向切片数"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tilesY">纵向切片数</Label>
                  <Input
                    id="tilesY"
                    value={tilesY}
                    onChange={(e) => setTilesY(e.target.value)}
                    placeholder="纵向切片数"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="distributionStrategy">分布策略</Label>
                  <Select
                    value={distributionStrategy}
                    onValueChange={setDistributionStrategy}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择分布策略" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SURROUNDING">环绕</SelectItem>
                      <SelectItem value="RANDOM">随机</SelectItem>
                      <SelectItem value="GRID">网格</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">宽度</Label>
                  <Input
                    id="width"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    placeholder="画布宽度"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">高度</Label>
                  <Input
                    id="height"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="画布高度"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seed">随机种子</Label>
                  <Input
                    id="seed"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder="随机种子"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tabSize">卡扣尺寸</Label>
                  <Input
                    id="tabSize"
                    value={tabSize}
                    onChange={(e) => setTabSize(e.target.value)}
                    placeholder="卡扣尺寸"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jitter">抖动程度</Label>
                  <Input
                    id="jitter"
                    value={jitter}
                    onChange={(e) => setJitter(e.target.value)}
                    placeholder="抖动程度"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lineColor">线条颜色</Label>
                  <Input
                    id="lineColor"
                    type="color"
                    value={lineColor}
                    onChange={(e) => setLineColor(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lineWidth">线条宽度</Label>
                  <Input
                    id="lineWidth"
                    value={lineWidth}
                    onChange={(e) => setLineWidth(e.target.value)}
                    placeholder="线条宽度"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="background">背景颜色</Label>
                  <Input
                    id="background"
                    type="color"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                  />
                </div>
              </div>

              {error && <div className="text-red-500">{error}</div>}
              {success && <div className="text-green-500">{success}</div>}

              <Button
                onClick={handleCreateAtom}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    创建中...
                  </>
                ) : (
                  "创建原子"
                )}
              </Button>
            </div>
          </TabsContent>

          {/* 获取原子详情 */}
          <TabsContent value="get">
            <div className="space-y-4 mt-4">
              <div className="flex space-x-4">
                <div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="atomId">原子ID</Label>
                    <Input
                      id="atomId"
                      value={atomId}
                      onChange={(e) => setAtomId(e.target.value)}
                      placeholder="输入原子ID"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="atomId">原子标题</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="输入原子标题"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleGetAtom} disabled={atomLoading}>
                    {atomLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        获取中...
                      </>
                    ) : (
                      "获取原子"
                    )}
                  </Button>
                </div>
              </div>

              {error && <div className="text-red-500">{error}</div>}
              {success && <div className="text-green-500">{success}</div>}

              {atomDetails && (
                <div className="mt-4 border rounded-md p-4">
                  <h3 className="text-lg font-semibold mb-2">
                    {atomDetails.title}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Badge>{atomDetails.status}</Badge>
                    </div>
                    <div>
                      <img
                        src={atomDetails.coverImage}
                        alt={atomDetails.title}
                        className="w-full h-48 object-cover rounded-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <p>
                        <span className="font-semibold">ID:</span>{" "}
                        {atomDetails.id}
                      </p>
                      <p>
                        <span className="font-semibold">标题:</span>{" "}
                        {atomDetails.title}
                      </p>
                      <p>
                        <span className="font-semibold">创建者:</span>{" "}
                        {atomDetails.user?.name || "未知"}
                      </p>
                      <p>
                        <span className="font-semibold">分类:</span>{" "}
                        {atomDetails.category?.name || "无"}
                      </p>
                      <p>
                        <span className="font-semibold">分组:</span>{" "}
                        {atomDetails.group?.name || "无"}
                      </p>
                      <p>
                        <span className="font-semibold">状态:</span>{" "}
                        {atomDetails.status}
                      </p>
                      <p>
                        <span className="font-semibold">查看次数:</span>{" "}
                        {atomDetails.viewCount || 0}
                      </p>
                      <p>
                        <span className="font-semibold">点赞数:</span>{" "}
                        {atomDetails.likesCount || 0}
                      </p>
                      <p>
                        <span className="font-semibold">收藏数:</span>{" "}
                        {atomDetails.favoritesCount || 0}
                      </p>
                      <p>
                        <span className="font-semibold">创建时间:</span>{" "}
                        {new Date(atomDetails.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">内容:</h4>
                    <p className="whitespace-pre-wrap">{atomDetails.content}</p>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">配置:</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {atomDetails.config &&
                        Object.entries(atomDetails.config).map(
                          ([key, value]: [string, any]) => (
                            <div key={key} className="border rounded p-2">
                              <span className="font-semibold">{key}:</span>{" "}
                              {value}
                            </div>
                          )
                        )}
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    {/* 更新状态 */}
                    <Button
                      size="sm"
                      onClick={() =>
                        handleUpdateAtomStatus(
                          atomDetails.id,
                          atomDetails.status
                        )
                      }
                    >
                      更新状态
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRecordVisit(atomDetails.id)}
                    >
                      记录访问
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleLikeAtom(atomDetails.id)}
                    >
                      {atomDetails.isLiked ? "取消点赞" : "点赞"}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleFavoriteAtom(atomDetails.id)}
                    >
                      {atomDetails.isFavorited ? "取消收藏" : "收藏"}
                    </Button>
                    {!recordId ? (
                      <Button
                        size="sm"
                        onClick={() => handleStartGame(atomDetails.id)}
                      >
                        开始游戏
                      </Button>
                    ) : null}
                    {recordId ? (
                      <Button
                        size="sm"
                        onClick={() => handleEndGame(atomDetails.id)}
                      >
                        结束游戏
                      </Button>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* 原子列表 */}
          <TabsContent value="list">
            <div className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">原子列表</h3>
                <Button onClick={fetchAtoms} disabled={atomsLoading} size="sm">
                  {atomsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      加载中...
                    </>
                  ) : (
                    "刷新列表"
                  )}
                </Button>
              </div>

              {error && <div className="text-red-500">{error}</div>}
              {success && <div className="text-green-500">{success}</div>}

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>标题</TableHead>
                      <TableHead>分类</TableHead>
                      <TableHead>分组</TableHead>
                      <TableHead>查看次数</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {atomsLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : atoms.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          暂无数据
                        </TableCell>
                      </TableRow>
                    ) : (
                      atoms.map((atom) => (
                        <TableRow key={atom.id}>
                          <TableCell>{atom.id}</TableCell>
                          <TableCell>{atom.title}</TableCell>
                          <TableCell>{atom.category?.name || "无"}</TableCell>
                          <TableCell>{atom.group?.name || "无"}</TableCell>
                          <TableCell>{atom.viewCount || 0}</TableCell>
                          <TableCell>
                            <Badge>{atom.status}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(atom.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setAtomId(atom.id.toString());
                                  setActiveTab("get");
                                  handleGetAtom();
                                }}
                              >
                                详情
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

          {/* 游戏记录 */}
          <TabsContent value="game">
            <div className="space-y-4 mt-4">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>原子ID</TableHead>
                      <TableHead>用户ID</TableHead>
                      <TableHead>创建时间</TableHead>

                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gameRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.id}</TableCell>
                        <TableCell>{record.atomId}</TableCell>
                        <TableCell>{record.userId}</TableCell>
                        <TableCell>{record.createdAt}</TableCell>
                        <TableCell>
                          {record.completed ? "完成" : "进行中"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        此组件用于演示原子相关API，包括创建、查询、点赞、收藏、游戏等功能
      </CardFooter>
    </Card>
  );
}
