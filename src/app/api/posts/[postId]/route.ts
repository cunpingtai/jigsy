import { currentUserId } from "@/app/api/util";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 获取单个帖子
export async function GET(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = parseInt(params.postId);

    // 获取当前用户ID
    const userId = await currentUserId();

    // 验证帖子是否存在
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    const likedPosts = userId
      ? await prisma.postLike.findMany({
          where: { postId: postId, userId: userId },
        })
      : [];

    const likedPostsMap = new Map(likedPosts.map((lp) => [lp.postId, true]));

    // 格式化返回数据
    const formattedPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      user: post.user,
      tags: post.tags.map((tag) => ({
        id: tag.tagId,
        name: tag.tag.name,
      })),
      commentsCount: post._count.comments,
      likesCount: post._count.likes,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      isLiked: likedPostsMap.get(post.id) || false,
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error("获取帖子失败:", error);
    return NextResponse.json({ error: "获取帖子失败" }, { status: 500 });
  }
}

// 更新帖子
export async function PUT(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = parseInt(params.postId);
    const body = await req.json();
    const { title, content, tags } = body;

    // 获取当前用户ID
    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 验证帖子是否存在
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    // 验证用户是否有权限更新帖子
    if (post.userId !== userId) {
      return NextResponse.json(
        { error: "您没有权限更新此帖子" },
        { status: 403 }
      );
    }

    // 构建更新数据
    const updateData: any = {};

    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (tags) updateData.tags = tags;
    // 更新帖子
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updateData,
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

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("更新帖子失败:", error);
    return NextResponse.json({ error: "更新帖子失败" }, { status: 500 });
  }
}

// 删除帖子
export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = parseInt(params.postId);

    // 获取当前用户ID
    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 验证帖子是否存在
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    // 验证用户是否有权限删除帖子
    if (post.userId !== userId) {
      return NextResponse.json(
        { error: "您没有权限删除此帖子" },
        { status: 403 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // 删除帖子相关的所有评论点赞
      await tx.commentLike.deleteMany({
        where: {
          comment: {
            postId: postId,
          },
        },
      });

      // 删除帖子的所有评论
      await tx.comment.deleteMany({
        where: { postId: postId },
      });

      // 删除帖子精选
      await tx.featured.deleteMany({
        where: { postId: postId },
      });

      // 删除帖子的所有点赞
      await tx.postLike.deleteMany({
        where: { postId: postId },
      });

      // 删除帖子标签
      await tx.tagsOnPosts.deleteMany({
        where: { postId: postId },
      });

      // 删除帖子
      await tx.post.delete({
        where: { id: postId },
      });
    });

    return NextResponse.json({ message: "帖子删除成功" });
  } catch (error) {
    console.error("删除帖子失败:", error);
    return NextResponse.json({ error: "删除帖子失败" }, { status: 500 });
  }
}
