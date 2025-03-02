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
import { UpdateUserParams } from "@/services";
import * as client from "@/services/client";

export default function UserDebugComponent() {
  const [userId, setUserId] = useState("");
  const [userData, setUserData] = useState<UpdateUserParams | null>(null);
  const [updateData, setUpdateData] = useState<UpdateUserParams | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 获取用户信息
  const fetchUserData = async () => {
    if (!userId) {
      setError("请输入用户 ID");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await client.userService.getUserById(userId);

      setUserData(data);
      // 初始化更新表单数据
      setUpdateData({
        name: data.name || "",
        email: data.email || "",
        avatar: data.avatar || "",
      });
      setSuccess("获取用户成功");
    } catch (err: any) {
      setError(err.message || "获取用户失败");
      console.error("获取用户错误:", err);
    } finally {
      setLoading(false);
    }
  };

  // 更新用户信息
  const updateUserData = async () => {
    if (!userId) {
      setError("请输入用户 ID");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await client.userService.updateUserById(userId, updateData!);

      setUserData(data);

      setSuccess("更新用户成功");
    } catch (err: any) {
      setError(err.message || "更新用户失败");
      console.error("更新用户错误:", err);
    } finally {
      setLoading(false);
    }
  };

  // 处理表单字段变化
  const handleUpdateChange = (field: keyof UpdateUserParams, value: string) => {
    setUpdateData((prev) => ({ ...prev, [field]: value } as UpdateUserParams));
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>用户调试工具</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="userId">用户 ID</Label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="输入用户 ID"
            />
          </div>
          <Button onClick={fetchUserData} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            获取用户
          </Button>
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}
        {success && <div className="text-green-500 mb-4">{success}</div>}

        {userData && (
          <Tabs defaultValue="info">
            <TabsList className="mb-4">
              <TabsTrigger value="info">用户信息</TabsTrigger>
              <TabsTrigger value="update">更新用户</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <div className="bg-slate-50 p-4 rounded-md">
                <pre className="whitespace-pre-wrap overflow-auto max-h-96">
                  {JSON.stringify(userData, null, 2)}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="update">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">姓名</Label>
                  <Input
                    id="name"
                    value={updateData?.name || ""}
                    onChange={(e) => handleUpdateChange("name", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    value={updateData?.email || ""}
                    onChange={(e) =>
                      handleUpdateChange("email", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="avatar">头像 URL</Label>
                  <Input
                    id="avatar"
                    value={updateData?.avatar || ""}
                    onChange={(e) =>
                      handleUpdateChange("avatar", e.target.value)
                    }
                  />
                </div>

                <Button
                  onClick={updateUserData}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  更新用户信息
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        此组件仅用于调试目的，可以获取和更新用户信息
      </CardFooter>
    </Card>
  );
}
