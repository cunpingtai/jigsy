import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 获取原子评论列表
export async function GET(
  req: Request,
  { params }: { params: { atomId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const atomId = params.atomId;

    // 分页参数
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // 排序参数
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    // 验证原子是否存在
    const atom = await prisma.standardAtom.findUnique({
      where: { id: parseInt(atomId) },
      select: { id: true },
    });

    if (!atom) {
      return NextResponse.json({ error: "原子不存在" }, { status: 404 });
    }

    // 获取评论总数
    const total = await prisma.atomComment.count({
      where: { standardAtomId: parseInt(atomId) },
    });

    // 获取评论列表
    const comments = await prisma.atomComment.findMany({
      where: { standardAtomId: parseInt(atomId) },
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
  { params }: { params: { atomId: string } }
) {
  try {
    const body = await req.json();
    const { content, userId, parentId } = body;
    const atomId = params.atomId;

    // 验证必要参数
    if (!content || !userId) {
      return NextResponse.json(
        { error: "评论内容和用户ID是必需的" },
        { status: 400 }
      );
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

    // 如果有父评论ID，验证父评论是否存在
    if (parentId) {
      const parentComment = await prisma.atomComment.findUnique({
        where: { id: parseInt(parentId) },
        select: { id: true, standardAtomId: true },
      });

      if (!parentComment) {
        return NextResponse.json({ error: "父评论不存在" }, { status: 404 });
      }

      // 确保父评论属于同一个原子
      if (parentComment.standardAtomId !== parseInt(atomId)) {
        return NextResponse.json(
          { error: "父评论不属于该原子" },
          { status: 400 }
        );
      }
    }

    // 创建评论
    const comment = await prisma.atomComment.create({
      data: {
        content,
        standardAtomId: parseInt(atomId),
        userId: parseInt(userId),
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

// 获取原子评论列表
// const getComments = await fetch('/api/atom/1/comment?page=1&pageSize=10&sortBy=createdAt&order=desc');

// // 创建评论
// const createComment = await fetch('/api/atom/1/comment', {
//   method: 'POST',
//   body: JSON.stringify({
//     content: '这是一条评论',
//     userId: 1
//   })
// });

// // 创建回复
// const createReply = await fetch('/api/atom/1/comment', {
//   method: 'POST',
//   body: JSON.stringify({
//     content: '这是一条回复',
//     userId: 2,
//     parentId: 5 // 父评论ID
//   })
// });

// // 更新评论
// const updateComment = await fetch('/api/comment/5', {
//   method: 'PUT',
//   body: JSON.stringify({
//     content: '更新后的评论内容',
//     userId: 1 // 验证权限
//   })
// });

// // 删除评论
// const deleteComment = await fetch('/api/comment/5?userId=1', {
//   method: 'DELETE'
// });

// // 获取单个评论
// const getComment = await fetch('/api/comment/5');

// // 点赞评论
// const likeComment = await fetch('/api/comment/5/like', {
//   method: 'POST',
//   body: JSON.stringify({
//     userId: 1
//   })
// });

// // 取消点赞
// const unlikeComment = await fetch('/api/comment/5/like?userId=1', {
//   method: 'DELETE'
// });

// // 获取点赞状态
// const getLikeStatus = await fetch('/api/comment/5/like?userId=1');
