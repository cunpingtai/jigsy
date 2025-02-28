import { currentUserId, getCurrentUser } from "@/app/api/util";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

// 获取单个评论
export async function GET(
  req: Request,
  { params }: { params: Promise<{ atomId: string; commentId: string }> }
) {
  try {
    const { atomId, commentId } = await params;

    // 验证原子是否存在
    const atom = await prisma.standardAtom.findUnique({
      where: { id: parseInt(atomId) },
      select: { id: true },
    });

    if (!atom) {
      return NextResponse.json({ error: "原子不存在" }, { status: 404 });
    }

    // 获取评论
    const comment = await prisma.atomComment.findUnique({
      where: {
        id: parseInt(commentId),
        standardAtomId: parseInt(atomId),
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
  { params }: { params: Promise<{ atomId: string; commentId: string }> }
) {
  try {
    const { atomId, commentId } = await params;
    const body = await req.json();
    const { content } = body;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }
    const userId = user.id;
    // 验证必要参数
    if (!content) {
      return NextResponse.json({ error: "评论内容是必需的" }, { status: 400 });
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
    const updatedComment = await prisma.atomComment.update({
      where: { id: parseInt(commentId) },
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
  { params }: { params: Promise<{ atomId: string; commentId: string }> }
) {
  try {
    const { atomId, commentId } = await params;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }
    const userId = user.id;

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
      await tx.atomComment.deleteMany({
        where: { parentId: parseInt(commentId) },
      });

      // 删除评论的所有点赞
      await tx.atomCommentLike.deleteMany({
        where: { commentId: parseInt(commentId) },
      });

      // 删除评论
      await tx.atomComment.delete({
        where: { id: parseInt(commentId) },
      });
    });

    return NextResponse.json({ message: "评论删除成功" });
  } catch (error) {
    console.error("删除评论失败:", error);
    return NextResponse.json({ error: "删除评论失败" }, { status: 500 });
  }
}
