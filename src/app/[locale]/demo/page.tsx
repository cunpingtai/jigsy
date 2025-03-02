import { getCurrentUser } from "../../api/util";
import { redirect } from "next/navigation";
import Hook from "./hook";

export default async function Demo({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return redirect("/en/explore");
  }

  return <Hook locale={locale} />;
}

// 支持未登录用户访问
// 使用 clerk 登录后，获取 clerk 用户信息，通过用户信息获取数据时，先从数据库 用户表判断用户是否存在，不存在则新增用户信息，存在则更新用户信息
// 未登录用户支持访问首页，发现页，登录页，注册页，社区页，拼图详情页，拼图游戏页
// 登录用户支持操作数据（点赞，评论，收藏，关注，分享，发布），支持访问拼图生成页
