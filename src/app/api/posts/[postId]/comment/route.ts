import { currentUserId } from "@/app/api/util";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 获取评论列表
export async function GET(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const { postId } = await params;

    // 获取当前用户ID
    const userId = await currentUserId();
    // 分页参数
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // 排序参数
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    // 验证原子是否存在
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    // 获取评论总数
    const total = await prisma.comment.count({
      where: { postId: parseInt(postId), parentId: null },
    });

    // 获取评论列表
    const comments = await prisma.comment.findMany({
      where: { postId: parseInt(postId), parentId: null },
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
      orderBy: {
        [sortBy]: order,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const likedComments = userId
      ? await prisma.commentLike.findMany({
          where: {
            commentId: { in: comments.map((c) => c.id) },
            userId: userId,
          },
          select: {
            commentId: true,
          },
        })
      : [];

    const likedCommentsMap = new Map(
      likedComments.map((lc) => [lc.commentId, true])
    );

    // 格式化返回数据
    const formattedComments = comments.map((comment) => ({
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
      isLiked: likedCommentsMap.get(comment.id) || false,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }));

    return NextResponse.json({
      data: formattedComments,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("获取评论失败:", error);
    return NextResponse.json({ error: "获取评论失败" }, { status: 500 });
  }
}

// 创建评论
export async function POST(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const body = await req.json();
    const { content, parentId } = body;
    const { postId } = await params;

    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 验证必要参数
    if (!content || !userId) {
      return NextResponse.json(
        { error: "评论内容和用户ID是必需的" },
        { status: 400 }
      );
    }

    // 验证原子是否存在
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    // 验证用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // 如果有父评论ID，验证父评论是否存在
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parseInt(parentId) },
        select: { id: true, postId: true },
      });

      if (!parentComment) {
        return NextResponse.json({ error: "父评论不存在" }, { status: 404 });
      }

      // 确保父评论属于同一个原子
      if (parentComment.postId !== parseInt(postId)) {
        return NextResponse.json(
          { error: "父评论不属于该帖子" },
          { status: 400 }
        );
      }
    }

    // 创建评论
    const comment = await prisma.comment.create({
      data: {
        content,
        postId: parseInt(postId),
        userId: userId,
        ...(parentId && { parentId: parseInt(parentId) }),
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

    return NextResponse.json(comment);
  } catch (error) {
    console.error("创建评论失败:", error);
    return NextResponse.json({ error: "创建评论失败" }, { status: 500 });
  }
}
