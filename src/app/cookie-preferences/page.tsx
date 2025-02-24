import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MainLayout from "@/components/layout/main-layout";

const CookiePreferencesPage: FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Cookie 设置</h1>
            <p className="text-xl text-muted-foreground">
              管理网站 Cookie 使用偏好
            </p>
          </div>

          <Alert>
            <Cookie className="h-4 w-4" />
            <AlertDescription>
              我们使用 Cookie
              来改善您的浏览体验、显示个性化内容和广告、分析网站流量并了解访客来源。
            </AlertDescription>
          </Alert>

          <Card>
            <CardContent className="p-6 space-y-6">
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">必要 Cookie</h2>
                    <p className="text-sm text-muted-foreground">
                      这些 Cookie 对网站的正常运行是必需的，无法关闭
                    </p>
                  </div>
                  <Switch checked disabled />
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">功能性 Cookie</h2>
                    <p className="text-sm text-muted-foreground">
                      用于记住您的偏好设置和个性化选项
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">分析 Cookie</h2>
                    <p className="text-sm text-muted-foreground">
                      帮助我们了解访客如何使用网站
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">营销 Cookie</h2>
                    <p className="text-sm text-muted-foreground">
                      用于向您展示相关广告
                    </p>
                  </div>
                  <Switch />
                </div>
              </section>

              <div className="pt-6 border-t space-y-4">
                <div className="flex justify-between">
                  <Button variant="outline">拒绝所有</Button>
                  <Button>保存设置</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  点击&quot;保存设置&quot;即表示您同意我们根据您的选择使用
                  Cookie。您可以随时更改这些设置。
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold">Cookie 使用说明</h2>
              <div className="space-y-4">
                <section>
                  <h3 className="font-medium">什么是 Cookie？</h3>
                  <p className="text-sm text-muted-foreground">
                    Cookie
                    是存储在您设备上的小型文本文件。它们被广泛用于使网站正常运行或更高效地运行，并为网站所有者提供信息。
                  </p>
                </section>

                <section>
                  <h3 className="font-medium">我们如何使用 Cookie？</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>记住您的登录状态</li>
                    <li>记住您的偏好设置</li>
                    <li>提供个性化体验</li>
                    <li>分析网站使用情况</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-medium">如何管理 Cookie？</h3>
                  <p className="text-sm text-muted-foreground">
                    除了使用上述控制面板外，您还可以通过浏览器设置来管理
                    Cookie。请注意，禁用某些 Cookie 可能会影响网站的功能。
                  </p>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default CookiePreferencesPage;
