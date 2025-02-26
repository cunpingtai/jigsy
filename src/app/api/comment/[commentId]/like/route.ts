import { currentUserId } from "@/app/api/util";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 点赞评论
export async function POST(
  req: Request,
  { params }: { params: { commentId: string } }
) {
  try {
    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const commentId = params.commentId;

    // 验证评论是否存在
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
      select: { id: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "评论不存在" }, { status: 404 });
    }

    // 检查是否已点赞
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId: parseInt(commentId),
        },
      },
    });

    if (existingLike) {
      return NextResponse.json({ error: "已经点赞过该评论" }, { status: 400 });
    }

    // 创建点赞
    await prisma.commentLike.create({
      data: {
        userId,
        commentId: parseInt(commentId),
      },
    });

    // 获取点赞数
    const likesCount = await prisma.commentLike.count({
      where: { commentId: parseInt(commentId) },
    });

    return NextResponse.json({
      message: "点赞成功",
      likesCount,
    });
  } catch (error) {
    console.error("点赞评论失败:", error);
    return NextResponse.json({ error: "点赞评论失败" }, { status: 500 });
  }
}

// 取消点赞
export async function DELETE(
  req: Request,
  { params }: { params: { commentId: string } }
) {
  try {
    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const commentId = params.commentId;

    // 验证点赞是否存在
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId: parseInt(commentId),
        },
      },
    });

    if (!existingLike) {
      return NextResponse.json({ error: "未点赞该评论" }, { status: 404 });
    }

    // 删除点赞
    await prisma.commentLike.delete({
      where: {
        userId_commentId: {
          userId,
          commentId: parseInt(commentId),
        },
      },
    });

    // 获取点赞数
    const likesCount = await prisma.commentLike.count({
      where: { commentId: parseInt(commentId) },
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

// 获取评论点赞状态
export async function GET(
  req: Request,
  { params }: { params: { commentId: string } }
) {
  try {
    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const commentId = params.commentId;

    // 获取点赞状态
    const like = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId: parseInt(commentId),
        },
      },
    });

    // 获取点赞数
    const likesCount = await prisma.commentLike.count({
      where: { commentId: parseInt(commentId) },
    });

    return NextResponse.json({
      liked: !!like,
      likesCount,
    });
  } catch (error) {
    console.error("获取点赞状态失败:", error);
    return NextResponse.json({ error: "获取点赞状态失败" }, { status: 500 });
  }
}
