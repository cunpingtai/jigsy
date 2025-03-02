import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Twitter } from "lucide-react";
import MainLayout from "@/components/layout/main-layout";

const AboutPage: FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">关于拼图游戏</h1>
            <p className="text-xl text-muted-foreground">
              一个充满创意的在线拼图社区
            </p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold">我们的故事</h2>
              <p className="text-muted-foreground leading-relaxed">
                拼图游戏诞生于2024年，我们致力于为用户提供一个独特的在线拼图体验平台。在这里，你不仅可以享受传统的拼图乐趣，还能创造属于自己的拼图作品，与全球拼图爱好者分享交流。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold">我们的使命</h2>
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  • 为用户提供高质量的拼图游戏体验
                </p>
                <p className="text-muted-foreground">
                  • 促进全球拼图爱好者的交流与分享
                </p>
                <p className="text-muted-foreground">
                  • 激发用户的创造力和想象力
                </p>
                <p className="text-muted-foreground">
                  • 打造一个友善、积极的在线社区
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold">技术特点</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">现代技术栈</h3>
                  <p className="text-sm text-muted-foreground">
                    采用 Next.js、React、TypeScript
                    等现代技术，确保最佳性能和用户体验
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">响应式设计</h3>
                  <p className="text-sm text-muted-foreground">
                    完美支持各种设备，从手机到桌面电脑都能享受流畅体验
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">实时互动</h3>
                  <p className="text-sm text-muted-foreground">
                    支持实时多人协作，让拼图变得更有趣
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">创新功能</h3>
                  <p className="text-sm text-muted-foreground">
                    支持多种拼图创建方式，激发创造力
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold">联系我们</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  我们非常重视用户的反馈和建议。如果你有任何问题或想法，欢迎通过以下方式联系我们：
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" className="gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AboutPage;
