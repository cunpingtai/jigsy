import { currentUserId } from "@/app/api/util";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 获取单个评论
export async function GET(
  req: Request,
  { params }: { params: { commentId: string } }
) {
  try {
    const commentId = parseInt(params.commentId);

    // 获取评论
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json({ error: "评论不存在" }, { status: 404 });
    }

    // 格式化返回数据
    const formattedComment = {
      id: comment.id,
      content: comment.content,
      user: comment.user,
      likesCount: comment._count.likes,
      repliesCount: comment._count.replies,
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        user: reply.user,
        createdAt: reply.createdAt,
      })),
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };

    return NextResponse.json(formattedComment);
  } catch (error) {
    console.error("获取评论失败:", error);
    return NextResponse.json({ error: "获取评论失败" }, { status: 500 });
  }
}

// 更新评论
export async function PUT(
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
      return NextResponse.json({ error: "评论内容是必需的" }, { status: 400 });
    }

    // 验证评论是否存在
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      select: { id: true, userId: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "评论不存在" }, { status: 404 });
    }

    // 验证用户是否有权限修改评论
    if (comment.userId !== userId) {
      return NextResponse.json(
        { error: "您没有权限修改此评论" },
        { status: 403 }
      );
    }

    // 更新评论
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
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

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("更新评论失败:", error);
    return NextResponse.json({ error: "更新评论失败" }, { status: 500 });
  }
}

// 删除评论
export async function DELETE(
  req: Request,
  { params }: { params: { commentId: string } }
) {
  try {
    const commentId = parseInt(params.commentId);

    // 获取当前用户ID
    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 验证评论是否存在
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      select: { id: true, userId: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "评论不存在" }, { status: 404 });
    }

    // 验证用户是否有权限删除评论
    if (comment.userId !== userId) {
      return NextResponse.json(
        { error: "您没有权限删除此评论" },
        { status: 403 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // 删除评论的所有回复
      await tx.comment.deleteMany({
        where: { parentId: commentId },
      });

      // 删除评论的所有点赞
      await tx.commentLike.deleteMany({
        where: { commentId: commentId },
      });

      // 删除评论
      await tx.comment.delete({
        where: { id: commentId },
      });
    });

    return NextResponse.json({ message: "评论删除成功" });
  } catch (error) {
    console.error("删除评论失败:", error);
    return NextResponse.json({ error: "删除评论失败" }, { status: 500 });
  }
}
