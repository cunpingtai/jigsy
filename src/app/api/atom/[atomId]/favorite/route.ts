import { currentUserId } from "@/app/api/util";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 添加收藏
export async function POST(
  req: Request,
  { params }: { params: Promise<{ atomId: string }> }
) {
  try {
    const { atomId } = await params;
    const atomIdInt = parseInt(atomId);

    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 使用事务处理所有数据库操作
    const result = await prisma.$transaction(async (tx) => {
      // 同时验证原子和用户是否存在
      const [atom, user] = await Promise.all([
        tx.standardAtom.findUnique({
          where: { id: atomIdInt },
          select: { id: true },
        }),
        tx.user.findUnique({
          where: { id: userId },
          select: { id: true },
        }),
      ]);

      if (!atom) {
        throw new Error("原子不存在");
      }

      if (!user) {
        throw new Error("用户不存在");
      }

      // 检查是否已收藏
      const existingFavorite = await tx.favorite.findFirst({
        where: {
          userId,
          atomId: atomIdInt,
        },
      });

      if (existingFavorite) {
        throw new Error("已经收藏过该原子");
      }

      // 创建收藏
      const favorite = await tx.favorite.create({
        data: {
          userId,
          atomId: atomIdInt,
        },
      });

      // 获取收藏数
      const favoritesCount = await tx.favorite.count({
        where: { atomId: atomIdInt },
      });

      return { favorite, favoritesCount };
    });

    return NextResponse.json({
      message: "收藏成功",
      favorite: result.favorite,
      favoritesCount: result.favoritesCount,
    });
  } catch (error: any) {
    console.error("收藏原子失败:", error);

    // 根据错误类型返回不同状态码
    if (error.message === "原子不存在") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    } else if (error.message === "用户不存在") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    } else if (error.message === "已经收藏过该原子") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "收藏原子失败" }, { status: 500 });
  }
}

// 取消收藏
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ atomId: string }> }
) {
  try {
    const { atomId } = await params;
    const atomIdInt = parseInt(atomId);

    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 使用事务处理
    const result = await prisma.$transaction(async (tx) => {
      // 验证收藏是否存在
      const existingFavorite = await tx.favorite.findFirst({
        where: {
          userId,
          atomId: atomIdInt,
        },
      });

      if (!existingFavorite) {
        throw new Error("未收藏该原子");
      }

      // 删除收藏
      await tx.favorite.delete({
        where: {
          id: existingFavorite.id,
        },
      });

      // 获取收藏数
      const favoritesCount = await tx.favorite.count({
        where: { atomId: atomIdInt },
      });

      return { favoritesCount };
    });

    return NextResponse.json({
      message: "取消收藏成功",
      favoritesCount: result.favoritesCount,
    });
  } catch (error: any) {
    console.error("取消收藏失败:", error);

    if (error.message === "未收藏该原子") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "取消收藏失败" }, { status: 500 });
  }
}
