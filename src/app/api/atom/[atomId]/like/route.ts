import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 点赞原子
export async function POST(
  req: Request,
  { params }: { params: { atomId: string } }
) {
  try {
    const body = await req.json();
    const { userId } = body;
    const atomId = params.atomId;

    // 验证必要参数
    if (!userId) {
      return NextResponse.json({ error: "用户ID是必需的" }, { status: 400 });
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
      where: { id: parseInt(userId) },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // 检查是否已点赞
    const existingLike = await prisma.atomLike.findFirst({
      where: {
        userId: parseInt(userId),
        standardAtomId: parseInt(atomId),
      },
    });

    if (existingLike) {
      return NextResponse.json({ error: "已经点赞过该原子" }, { status: 400 });
    }

    // 创建点赞
    const like = await prisma.atomLike.create({
      data: {
        userId: parseInt(userId),
        standardAtomId: parseInt(atomId),
      },
    });

    // 获取点赞数
    const likesCount = await prisma.atomLike.count({
      where: { standardAtomId: parseInt(atomId) },
    });

    return NextResponse.json({
      message: "点赞成功",
      like,
      likesCount,
    });
  } catch (error) {
    console.error("点赞原子失败:", error);
    return NextResponse.json({ error: "点赞原子失败" }, { status: 500 });
  }
}

// 取消点赞
export async function DELETE(
  req: Request,
  { params }: { params: { atomId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const atomId = params.atomId;

    if (!userId) {
      return NextResponse.json({ error: "用户ID是必需的" }, { status: 400 });
    }

    // 验证点赞是否存在
    const existingLike = await prisma.atomLike.findFirst({
      where: {
        userId: parseInt(userId),
        standardAtomId: parseInt(atomId),
      },
    });

    if (!existingLike) {
      return NextResponse.json({ error: "未点赞该原子" }, { status: 404 });
    }

    // 删除点赞
    await prisma.atomLike.delete({
      where: {
        id: existingLike.id,
      },
    });

    // 获取点赞数
    const likesCount = await prisma.atomLike.count({
      where: { standardAtomId: parseInt(atomId) },
    });

    return NextResponse.json({
      message: "取消点赞成功",
      likesCount,
    });
  } catch (error) {
    console.error("取消点赞失败:", error);
    return NextResponse.json({ error: "取消点赞失败" }, { status: 500 });
  }
}

// 获取点赞状态
export async function GET(
  req: Request,
  { params }: { params: { atomId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const atomId = params.atomId;

    // 如果提供了用户ID，则获取该用户的点赞状态
    if (userId) {
      const like = await prisma.atomLike.findFirst({
        where: {
          userId: parseInt(userId),
          standardAtomId: parseInt(atomId),
        },
      });

      // 获取点赞数
      const likesCount = await prisma.atomLike.count({
        where: { standardAtomId: parseInt(atomId) },
      });

      return NextResponse.json({
        liked: !!like,
        likesCount,
      });
    }
    // 否则只返回点赞数
    else {
      const likesCount = await prisma.atomLike.count({
        where: { standardAtomId: parseInt(atomId) },
      });

      return NextResponse.json({
        likesCount,
      });
    }
  } catch (error) {
    console.error("获取点赞状态失败:", error);
    return NextResponse.json({ error: "获取点赞状态失败" }, { status: 500 });
  }
}
