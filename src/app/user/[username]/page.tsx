import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Clock,
  Heart,
  Share2,
  Grid,
  Star,
  Activity,
} from "lucide-react";
import Image from "next/image";
import MainLayout from "@/components/layout/main-layout";

// 模拟用户数据
const userData = {
  username: "PuzzleMaster",
  avatar: "https://placehold.co/40x40",
  joinDate: "2024-01",
  level: 42,
  exp: 8750,
  puzzlesCreated: 156,
  puzzlesCompleted: 328,
  followers: 1234,
  following: 567,
  achievements: [
    { name: "拼图大师", description: "完成1000个拼图", icon: Trophy },
    { name: "创作达人", description: "创建100个拼图", icon: Star },
    { name: "速度之王", description: "30秒内完成拼图", icon: Clock },
  ],
};

const UserProfilePage: FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* 用户基本信息 */}
          <Card className="overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10" />
            <CardContent className="relative pt-0">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* 头像 */}
                <div className="relative -mt-16">
                  <div className="rounded-full overflow-hidden border-4 border-background w-32 h-32">
                    <Image
                      src={userData.avatar}
                      alt={userData.username}
                      width={128}
                      height={128}
                    />
                  </div>
                </div>

                {/* 用户信息 */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                    <div>
                      <h1 className="text-3xl font-bold">
                        {userData.username}
                      </h1>
                      <p className="text-muted-foreground">
                        加入时间：{userData.joinDate}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button className="gap-2">
                        <Heart className="w-4 h-4" />
                        关注
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Share2 className="w-4 h-4" />
                        分享
                      </Button>
                    </div>
                  </div>

                  {/* 统计数据 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold">{userData.level}</div>
                      <div className="text-sm text-muted-foreground">等级</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold">
                        {userData.puzzlesCreated}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        创建拼图
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold">
                        {userData.puzzlesCompleted}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        完成拼图
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold">
                        {userData.followers}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        关注者
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 详细内容标签页 */}
          <Tabs defaultValue="puzzles" className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full md:w-auto">
              <TabsTrigger value="puzzles" className="gap-2">
                <Grid className="w-4 h-4" />
                <span className="hidden md:inline">拼图作品</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="gap-2">
                <Trophy className="w-4 h-4" />
                <span className="hidden md:inline">成就</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <Activity className="w-4 h-4" />
                <span className="hidden md:inline">动态</span>
              </TabsTrigger>
              <TabsTrigger value="collections" className="gap-2">
                <Star className="w-4 h-4" />
                <span className="hidden md:inline">收藏</span>
              </TabsTrigger>
            </TabsList>

            {/* 拼图作品 */}
            <TabsContent value="puzzles">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="hover-card">
                    <CardContent className="p-4 space-y-2">
                      <div className="aspect-video bg-muted rounded-lg" />
                      <h3 className="font-medium">示例拼图 {i + 1}</h3>
                      <p className="text-sm text-muted-foreground">
                        创建于 2024-01-{String(i + 1).padStart(2, "0")}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* 成就 */}
            <TabsContent value="achievements">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userData.achievements.map((achievement, i) => (
                  <Card key={i} className="hover-card">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        <achievement.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* 动态 */}
            <TabsContent value="activity">
              <Card>
                <CardContent className="p-6 space-y-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex gap-4 pb-6 border-b last:border-0"
                    >
                      <div className="p-2 rounded-full bg-muted">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium">完成了一个拼图</p>
                        <p className="text-sm text-muted-foreground">2小时前</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 收藏 */}
            <TabsContent value="collections">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="hover-card">
                    <CardContent className="p-4 space-y-2">
                      <div className="aspect-video bg-muted rounded-lg" />
                      <h3 className="font-medium">收藏拼图 {i + 1}</h3>
                      <p className="text-sm text-muted-foreground">
                        收藏于 2024-01-{String(i + 1).padStart(2, "0")}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserProfilePage;
