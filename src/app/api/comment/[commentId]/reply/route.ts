import { currentUserId } from "@/app/api/util";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 获取评论的回复列表
export async function GET(
  req: Request,
  { params }: { params: { commentId: string } }
) {
  try {
    const commentId = parseInt(params.commentId);
    const { searchParams } = new URL(req.url);

    // 分页参数
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // 验证评论是否存在
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      select: { id: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "评论不存在" }, { status: 404 });
    }

    // 获取回复总数
    const total = await prisma.comment.count({
      where: { parentId: commentId },
    });

    // 获取回复列表
    const replies = await prisma.comment.findMany({
      where: { parentId: commentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 格式化返回数据
    const formattedReplies = replies.map((reply) => ({
      id: reply.id,
      content: reply.content,
      user: reply.user,
      likesCount: reply._count.likes,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
    }));

    return NextResponse.json({
      data: formattedReplies,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("获取回复失败:", error);
    return NextResponse.json({ error: "获取回复失败" }, { status: 500 });
  }
}

// 创建回复
export async function POST(
  req: Request,
  { params }: { params: { commentId: string } }
) {
  try {
    const body = await req.json();
    const { content } = body;
    const commentId = parseInt(params.commentId);

    // 获取当前用户ID
    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 验证必要参数
    if (!content) {
      return NextResponse.json({ error: "回复内容是必需的" }, { status: 400 });
    }

    // 验证评论是否存在
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      select: { id: true, postId: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "评论不存在" }, { status: 404 });
    }

    // 验证用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // 创建回复
    const reply = await prisma.comment.create({
      data: {
        content,
        postId: comment.postId,
        userId: userId,
        parentId: commentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(reply);
  } catch (error) {
    console.error("创建回复失败:", error);
    return NextResponse.json({ error: "创建回复失败" }, { status: 500 });
  }
}
