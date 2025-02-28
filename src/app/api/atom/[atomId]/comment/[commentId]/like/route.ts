import { currentUserId } from "@/app/api/util";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 点赞评论
export async function POST(
  req: Request,
  { params }: { params: Promise<{ atomId: string; commentId: string }> }
) {
  try {
    const { atomId, commentId } = await params;

    // 获取当前用户ID
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

    // 验证评论是否存在
    const comment = await prisma.atomComment.findUnique({
      where: {
        id: parseInt(commentId),
        standardAtomId: parseInt(atomId),
      },
      select: { id: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "评论不存在" }, { status: 404 });
    }

    // 检查用户是否已经点赞过该评论
    const existingLike = await prisma.atomCommentLike.findUnique({
      where: {
        userId_commentId: {
          userId: userId,
          commentId: parseInt(commentId),
        },
      },
    });

    if (existingLike) {
      return NextResponse.json(
        { error: "您已经点赞过该评论" },
        { status: 400 }
      );
    }

    // 创建点赞记录
    const like = await prisma.atomCommentLike.create({
      data: {
        userId: userId,
        commentId: parseInt(commentId),
      },
    });

    // 获取评论的点赞总数
    const likesCount = await prisma.atomCommentLike.count({
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

// 取消点赞评论
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ atomId: string; commentId: string }> }
) {
  try {
    const { atomId, commentId } = await params;

    // 获取当前用户ID
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

    // 验证评论是否存在
    const comment = await prisma.atomComment.findUnique({
      where: {
        id: parseInt(commentId),
        standardAtomId: parseInt(atomId),
      },
      select: { id: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "评论不存在" }, { status: 404 });
    }

    // 检查用户是否已经点赞过该评论
    const existingLike = await prisma.atomCommentLike.findUnique({
      where: {
        userId_commentId: {
          userId: userId,
          commentId: parseInt(commentId),
        },
      },
    });

    if (!existingLike) {
      return NextResponse.json({ error: "您尚未点赞该评论" }, { status: 400 });
    }

    // 删除点赞记录
    await prisma.atomCommentLike.delete({
      where: {
        userId_commentId: {
          userId: userId,
          commentId: parseInt(commentId),
        },
      },
    });

    // 获取评论的点赞总数
    const likesCount = await prisma.atomCommentLike.count({
      where: { commentId: parseInt(commentId) },
    });

    return NextResponse.json({
      message: "取消点赞成功",
      likesCount,
    });
  } catch (error) {
    console.error("取消点赞评论失败:", error);
    return NextResponse.json({ error: "取消点赞评论失败" }, { status: 500 });
  }
}

// 获取评论点赞状态
export async function GET(
  req: Request,
  { params }: { params: Promise<{ atomId: string; commentId: string }> }
) {
  try {
    const { atomId, commentId } = await params;

    // 获取当前用户ID
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

    // 验证评论是否存在
    const comment = await prisma.atomComment.findUnique({
      where: {
        id: parseInt(commentId),
        standardAtomId: parseInt(atomId),
      },
      select: { id: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "评论不存在" }, { status: 404 });
    }

    // 检查用户是否已经点赞过该评论
    const existingLike = await prisma.atomCommentLike.findUnique({
      where: {
        userId_commentId: {
          userId: userId,
          commentId: parseInt(commentId),
        },
      },
    });

    // 获取评论的点赞总数
    const likesCount = await prisma.atomCommentLike.count({
      where: { commentId: parseInt(commentId) },
    });

    return NextResponse.json({
      liked: !!existingLike,
      likesCount,
    });
  } catch (error) {
    console.error("获取评论点赞状态失败:", error);
    return NextResponse.json(
      { error: "获取评论点赞状态失败" },
      { status: 500 }
    );
  }
}
