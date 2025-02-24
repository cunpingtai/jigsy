import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";
import MainLayout from "@/components/layout/main-layout";

const PrivacyPolicyPage: FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">隐私政策</h1>
            <p className="text-xl text-muted-foreground">
              我们如何保护和处理您的个人信息
            </p>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              本隐私政策最后更新于 2024 年 1 月 1
              日。我们建议您定期查看本政策，以了解我们如何保护您的信息。
            </AlertDescription>
          </Alert>

          <Card>
            <CardContent className="p-6 space-y-6">
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">信息收集</h2>
                <div className="space-y-2">
                  <h3 className="font-medium">我们收集的信息：</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>账号信息（用户名、电子邮件、密码）</li>
                    <li>个人资料（头像、简介）</li>
                    <li>游戏数据（游戏记录、成就）</li>
                    <li>设备信息（浏览器类型、IP地址）</li>
                    <li>使用数据（访问时间、停留时长）</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">信息使用</h2>
                <div className="space-y-2">
                  <h3 className="font-medium">我们如何使用您的信息：</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>提供和改进服务</li>
                    <li>个性化用户体验</li>
                    <li>发送服务通知</li>
                    <li>防止欺诈和滥用</li>
                    <li>进行数据分析</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">信息共享</h2>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    我们不会出售您的个人信息。仅在以下情况下共享信息：
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>获得您的明确同意</li>
                    <li>遵守法律要求</li>
                    <li>保护用户权益</li>
                    <li>与服务提供商合作</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">数据安全</h2>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    我们采取以下措施保护您的信息：
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>数据加密传输</li>
                    <li>安全存储机制</li>
                    <li>访问控制措施</li>
                    <li>定期安全审计</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">用户权利</h2>
                <div className="space-y-2">
                  <p className="text-muted-foreground">您拥有以下权利：</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>访问个人信息</li>
                    <li>更正错误信息</li>
                    <li>删除个人数据</li>
                    <li>退出数据收集</li>
                    <li>投诉与建议</li>
                  </ul>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default PrivacyPolicyPage;
