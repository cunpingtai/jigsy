import { currentUserId } from "@/app/api/util";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 点赞原子
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
      // 验证原子是否存在
      const atom = await tx.standardAtom.findUnique({
        where: { id: atomIdInt },
        select: { id: true },
      });

      if (!atom) {
        throw new Error("原子不存在");
      }

      // 检查是否已点赞
      const existingLike = await tx.atomLike.findFirst({
        where: {
          userId,
          standardAtomId: atomIdInt,
        },
      });

      if (existingLike) {
        throw new Error("已经点赞过该原子");
      }

      // 创建点赞
      const like = await tx.atomLike.create({
        data: {
          userId,
          standardAtomId: atomIdInt,
        },
      });

      // 获取点赞数
      const likesCount = await tx.atomLike.count({
        where: { standardAtomId: atomIdInt },
      });

      return { like, likesCount };
    });

    return NextResponse.json({
      message: "点赞成功",
      like: result.like,
      likesCount: result.likesCount,
    });
  } catch (error: any) {
    console.error("点赞原子失败:", error);

    if (error.message === "原子不存在") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    } else if (error.message === "已经点赞过该原子") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "点赞原子失败" }, { status: 500 });
  }
}

// 取消点赞
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
      // 验证点赞是否存在
      const existingLike = await tx.atomLike.findFirst({
        where: {
          userId,
          standardAtomId: atomIdInt,
        },
      });

      if (!existingLike) {
        throw new Error("未点赞该原子");
      }

      // 删除点赞
      await tx.atomLike.delete({
        where: {
          id: existingLike.id,
        },
      });

      // 获取点赞数
      const likesCount = await tx.atomLike.count({
        where: { standardAtomId: atomIdInt },
      });

      return { likesCount };
    });

    return NextResponse.json({
      message: "取消点赞成功",
      likesCount: result.likesCount,
    });
  } catch (error: any) {
    console.error("取消点赞失败:", error);

    if (error.message === "未点赞该原子") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "取消点赞失败" }, { status: 500 });
  }
}
