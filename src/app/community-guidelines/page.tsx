import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import MainLayout from "@/components/layout/main-layout";

const CommunityGuidelinesPage: FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">社区规则</h1>
            <p className="text-xl text-muted-foreground">
              共同维护一个友善、健康的社区环境
            </p>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              这些规则旨在确保所有用户都能在我们的平台上获得积极、愉快的体验。违反这些规则可能导致账号被限制或禁用。
            </AlertDescription>
          </Alert>

          <Card>
            <CardContent className="p-6 space-y-6">
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">基本准则</h2>
                <div className="space-y-2">
                  <p className="text-muted-foreground">1. 尊重他人，保持友善</p>
                  <p className="text-muted-foreground">2. 遵守法律法规</p>
                  <p className="text-muted-foreground">3. 维护社区秩序</p>
                  <p className="text-muted-foreground">4. 保护个人隐私</p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">内容规范</h2>
                <div className="space-y-2">
                  <h3 className="font-medium">禁止发布：</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>违法或不当内容</li>
                    <li>侵犯他人知识产权的内容</li>
                    <li>垃圾广告或营销信息</li>
                    <li>虚假或误导性信息</li>
                    <li>令人反感或不适的内容</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">互动规范</h2>
                <div className="space-y-2">
                  <h3 className="font-medium">应当：</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>友善对待其他用户</li>
                    <li>尊重不同观点</li>
                    <li>提供建设性的反馈</li>
                    <li>举报违规内容</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">创作规范</h2>
                <div className="space-y-2">
                  <h3 className="font-medium">拼图创作要求：</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>确保拥有内容的使用权</li>
                    <li>适当标注内容来源</li>
                    <li>遵守版权规定</li>
                    <li>合理使用标签</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">处罚机制</h2>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    违反社区规则可能导致：
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>内容被删除</li>
                    <li>账号功能限制</li>
                    <li>临时封禁</li>
                    <li>永久封禁</li>
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

export default CommunityGuidelinesPage;
