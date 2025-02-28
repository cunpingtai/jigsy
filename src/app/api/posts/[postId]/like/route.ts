import { currentUserId } from "@/app/api/util";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 点赞帖子
export async function POST(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;

    // 获取当前用户ID
    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 验证帖子是否存在
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    // 检查用户是否已经点赞过该帖子
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: parseInt(postId),
        },
      },
    });

    if (existingLike) {
      return NextResponse.json(
        { error: "您已经点赞过该帖子" },
        { status: 400 }
      );
    }

    // 创建点赞记录
    const like = await prisma.postLike.create({
      data: {
        userId: userId,
        postId: parseInt(postId),
      },
    });

    // 获取帖子的点赞总数
    const likesCount = await prisma.postLike.count({
      where: { postId: parseInt(postId) },
    });

    return NextResponse.json({
      message: "点赞成功",
      likesCount,
    });
  } catch (error) {
    console.error("点赞帖子失败:", error);
    return NextResponse.json({ error: "点赞帖子失败" }, { status: 500 });
  }
}

// 取消点赞帖子
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;

    // 获取当前用户ID
    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 验证帖子是否存在
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    // 检查用户是否已经点赞过该帖子
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: parseInt(postId),
        },
      },
    });

    if (!existingLike) {
      return NextResponse.json({ error: "您尚未点赞该帖子" }, { status: 400 });
    }

    // 删除点赞记录
    await prisma.postLike.delete({
      where: {
        userId_postId: {
          userId: userId,
          postId: parseInt(postId),
        },
      },
    });

    // 获取帖子的点赞总数
    const likesCount = await prisma.postLike.count({
      where: { postId: parseInt(postId) },
    });

    return NextResponse.json({
      message: "取消点赞成功",
      likesCount,
    });
  } catch (error) {
    console.error("取消点赞帖子失败:", error);
    return NextResponse.json({ error: "取消点赞帖子失败" }, { status: 500 });
  }
}

// 获取帖子点赞状态
export async function GET(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;

    // 获取当前用户ID
    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 验证帖子是否存在
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    // 检查用户是否已经点赞过该帖子
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: parseInt(postId),
        },
      },
    });

    // 获取帖子的点赞总数
    const likesCount = await prisma.postLike.count({
      where: { postId: parseInt(postId) },
    });

    return NextResponse.json({
      liked: !!existingLike,
      likesCount,
    });
  } catch (error) {
    console.error("获取帖子点赞状态失败:", error);
    return NextResponse.json(
      { error: "获取帖子点赞状态失败" },
      { status: 500 }
    );
  }
}
