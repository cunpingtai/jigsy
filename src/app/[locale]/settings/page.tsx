import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Bell,
  Shield,
  Palette,
  Mail,
  Key,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import MainLayout from "@/components/layout/main-layout";
import { getCurrentUser } from "../../api/util";
import { redirect } from "next/navigation";

const SettingsPage: FC = async () => {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return redirect("/en/explore");
  }
  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">账号设置</h1>
            <p className="text-muted-foreground">
              管理您的账号信息、通知和隐私设置
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto">
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                <span>个人资料</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="w-4 h-4" />
                <span>通知设置</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="gap-2">
                <Shield className="w-4 h-4" />
                <span>隐私设置</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-2">
                <Palette className="w-4 h-4" />
                <span>偏好设置</span>
              </TabsTrigger>
            </TabsList>

            {/* 个人资料 */}
            <TabsContent value="profile">
              <Card>
                <CardContent className="p-6 space-y-8">
                  {/* 头像设置 */}
                  <div className="space-y-4">
                    <Label>头像</Label>
                    <div className="flex items-center gap-6">
                      <Image
                        src="https://placehold.co/100x100"
                        alt="avatar"
                        width={100}
                        height={100}
                        className="rounded-full"
                      />
                      <Button variant="outline" className="gap-2">
                        <Upload className="w-4 h-4" />
                        更换头像
                      </Button>
                    </div>
                  </div>

                  {/* 基本信息 */}
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">用户名</Label>
                      <Input id="username" defaultValue="PuzzleMaster" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">电子邮件</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue="user@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">个人简介</Label>
                      <Textarea
                        id="bio"
                        placeholder="介绍一下自己..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>

                  <Button>保存更改</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 通知设置 */}
            <TabsContent value="notifications">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>电子邮件通知</Label>
                        <p className="text-sm text-muted-foreground">
                          接收重要更新和活动通知
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>新关注者通知</Label>
                        <p className="text-sm text-muted-foreground">
                          有新用户关注您时通知
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>拼图评论通知</Label>
                        <p className="text-sm text-muted-foreground">
                          收到新评论时通知
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>系统通知</Label>
                        <p className="text-sm text-muted-foreground">
                          接收系统更新和维护通知
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 隐私设置 */}
            <TabsContent value="privacy">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>公开个人资料</Label>
                        <p className="text-sm text-muted-foreground">
                          允许其他用户查看您的个人资料
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>显示在线状态</Label>
                        <p className="text-sm text-muted-foreground">
                          向其他用户显示您的在线状态
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>允许被搜索</Label>
                        <p className="text-sm text-muted-foreground">
                          允许其他用户通过用户名找到您
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t">
                    <h3 className="font-medium">账号安全</h3>
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full gap-2">
                        <Key className="w-4 h-4" />
                        修改密码
                      </Button>
                      <Button variant="outline" className="w-full gap-2">
                        <Mail className="w-4 h-4" />
                        验证邮箱
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 偏好设置 */}
            <TabsContent value="preferences">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>深色模式</Label>
                        <p className="text-sm text-muted-foreground">
                          切换深色/浅色主题
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>自动播放</Label>
                        <p className="text-sm text-muted-foreground">
                          自动播放拼图预览动画
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>声音效果</Label>
                        <p className="text-sm text-muted-foreground">
                          启用交互音效
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t">
                    <h3 className="font-medium text-destructive">危险区域</h3>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      删除账号
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      删除账号后，所有数据将被永久删除且无法恢复
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
