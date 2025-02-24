import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  MessageSquare,
  Github,
  Twitter,
  MapPin,
  Clock,
} from "lucide-react";
import MainLayout from "@/components/layout/main-layout";

const ContactPage: FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl font-bold">联系我们</h1>
            <p className="text-xl text-muted-foreground">
              我们随时准备为您提供帮助和支持
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 联系方式卡片 */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">联系方式</h2>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <Mail className="w-5 h-5 mt-1 text-primary" />
                      <div>
                        <h3 className="font-medium">电子邮件</h3>
                        <p className="text-sm text-muted-foreground">
                          support@puzzlechallenge.com
                        </p>
                        <p className="text-sm text-muted-foreground">
                          business@puzzlechallenge.com（商务合作）
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <MessageSquare className="w-5 h-5 mt-1 text-primary" />
                      <div>
                        <h3 className="font-medium">社交媒体</h3>
                        <div className="flex gap-4 mt-2">
                          <Button variant="outline" size="sm" className="gap-2">
                            <Github className="h-4 w-4" />
                            GitHub
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Twitter className="h-4 w-4" />
                            Twitter
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Clock className="w-5 h-5 mt-1 text-primary" />
                      <div>
                        <h3 className="font-medium">服务时间</h3>
                        <p className="text-sm text-muted-foreground">
                          周一至周五: 9:00 - 18:00
                        </p>
                        <p className="text-sm text-muted-foreground">
                          周末和节假日: 10:00 - 16:00
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <MapPin className="w-5 h-5 mt-1 text-primary" />
                      <div>
                        <h3 className="font-medium">公司地址</h3>
                        <p className="text-sm text-muted-foreground">
                          中国上海市浦东新区张江高科技园区
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">常见问题</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">如何重置密码？</h3>
                      <p className="text-sm text-muted-foreground">
                        点击登录页面的&quot;忘记密码&quot;链接，按照提示操作即可。
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">如何举报不当内容？</h3>
                      <p className="text-sm text-muted-foreground">
                        在内容右上角点击举报按钮，选择原因提交即可。
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">遇到技术问题怎么办？</h3>
                      <p className="text-sm text-muted-foreground">
                        请提供详细的问题描述和截图，发送至技术支持邮箱。
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 联系表单 */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-6">发送消息</h2>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">姓名</Label>
                    <Input id="name" placeholder="请输入您的姓名" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">电子邮件</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="请输入您的电子邮件"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">问题类型</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="请选择问题类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">技术支持</SelectItem>
                        <SelectItem value="account">账号相关</SelectItem>
                        <SelectItem value="business">商务合作</SelectItem>
                        <SelectItem value="feedback">意见反馈</SelectItem>
                        <SelectItem value="other">其他问题</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">消息内容</Label>
                    <Textarea
                      id="message"
                      placeholder="请详细描述您的问题或建议"
                      className="min-h-[150px]"
                    />
                  </div>

                  <Button className="w-full">发送消息</Button>

                  <p className="text-xs text-muted-foreground text-center">
                    我们会在 24 小时内回复您的消息
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ContactPage;
