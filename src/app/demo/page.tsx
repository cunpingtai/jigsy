import { UserButton, UserProfile } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import SyncUser from "./sync-user";
import User from "./user";
import Category from "./category";
import Group from "./group";
import GroupsCategories from "./groups-categories";
import Atom from "./atom";
import Tag from "./tag";

export default async function Demo() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Sign in to view this page</div>;
  }

  const user = await currentUser();

  return (
    <div className="flex flex-col gap-4">
      <p>Welcome, {user?.emailAddresses[0]?.emailAddress}!</p>
      <Tag />
      <SyncUser user={user!} />
      <User />
      <Category />
      <Group />
      <GroupsCategories />
      <Atom />
      {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}
      {/* <UserProfile />
      <UserButton /> */}
    </div>
  );
}

// 支持未登录用户访问
// 使用 clerk 登录后，获取 clerk 用户信息，通过用户信息获取数据时，先从数据库 用户表判断用户是否存在，不存在则新增用户信息，存在则更新用户信息
// 未登录用户支持访问首页，发现页，登录页，注册页，社区页，拼图详情页，拼图游戏页
// 登录用户支持操作数据（点赞，评论，收藏，关注，分享，发布），支持访问拼图生成页
