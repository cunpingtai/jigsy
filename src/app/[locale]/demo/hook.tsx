"use client";

// import { UserButton, UserProfile } from "@clerk/nextjs";
// import { auth, currentUser } from "@clerk/nextjs/server";
// import SyncUser from "./sync-user";
import User from "./user";
import Category from "./category";
import Group from "./group";
import GroupsCategories from "./groups-categories";
import Atom from "./atom";
import Tags from "./tags";
import { Toaster } from "sonner";
import FeatureAtom from "./feature-atom";
import AtomComment from "./atom-comment";
import Tag from "./tag";
import GroupDemo from "./group-atoms";
import { Suspense } from "react";

export default function Demo({ locale }: { locale: string }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col gap-4">
        <GroupDemo />
        <Tag />
        <Toaster />
        {/* <p>Welcome, {user?.emailAddresses[0]?.emailAddress}!</p> */}
        <AtomComment />
        <Tags locale={locale} />
        {/* <SyncUser user={user!} /> */}
        <User />
        <Category locale={locale} />
        <Group locale={locale} />
        <GroupsCategories locale={locale} />
        <Atom />
        <FeatureAtom />
        {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}
        {/* <UserProfile />
      <UserButton /> */}
      </div>
    </Suspense>
  );
}

// 支持未登录用户访问
// 使用 clerk 登录后，获取 clerk 用户信息，通过用户信息获取数据时，先从数据库 用户表判断用户是否存在，不存在则新增用户信息，存在则更新用户信息
// 未登录用户支持访问首页，发现页，登录页，注册页，社区页，拼图详情页，拼图游戏页
// 登录用户支持操作数据（点赞，评论，收藏，关注，分享，发布），支持访问拼图生成页
