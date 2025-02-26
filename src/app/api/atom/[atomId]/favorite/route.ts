import { currentUserId } from "@/app/api/util";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 添加收藏
export async function POST(
  req: Request,
  { params }: { params: { atomId: string } }
) {
  try {
    const atomId = params.atomId;

    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 验证原子是否存在
    const atom = await prisma.standardAtom.findUnique({
      where: { id: parseInt(atomId) },
      select: { id: true },
    });

    if (!atom) {
      return NextResponse.json({ error: "原子不存在" }, { status: 404 });
    }

    // 验证用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // 检查是否已收藏
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId,
        atomId: parseInt(atomId),
      },
    });

    if (existingFavorite) {
      return NextResponse.json({ error: "已经收藏过该原子" }, { status: 400 });
    }

    // 创建收藏
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        atomId: parseInt(atomId),
      },
    });

    // 获取收藏数
    const favoritesCount = await prisma.favorite.count({
      where: { atomId: parseInt(atomId) },
    });

    return NextResponse.json({
      message: "收藏成功",
      favorite,
      favoritesCount,
    });
  } catch (error) {
    console.error("收藏原子失败:", error);
    return NextResponse.json({ error: "收藏原子失败" }, { status: 500 });
  }
}

// 取消收藏
export async function DELETE(
  req: Request,
  { params }: { params: { atomId: string } }
) {
  try {
    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const atomId = params.atomId;
    // 验证收藏是否存在
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId,
        atomId: parseInt(atomId),
      },
    });

    if (!existingFavorite) {
      return NextResponse.json({ error: "未收藏该原子" }, { status: 404 });
    }

    // 删除收藏
    await prisma.favorite.delete({
      where: {
        id: existingFavorite.id,
      },
    });

    // 获取收藏数
    const favoritesCount = await prisma.favorite.count({
      where: { atomId: parseInt(atomId) },
    });

    return NextResponse.json({
      message: "取消收藏成功",
      favoritesCount,
    });
  } catch (error) {
    console.error("取消收藏失败:", error);
    return NextResponse.json({ error: "取消收藏失败" }, { status: 500 });
  }
}
