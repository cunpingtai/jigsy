import { currentUserId } from "@/app/api/util";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 获取所有帖子
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // 获取当前用户ID
    const userId = await currentUserId();

    // 分页参数
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // 排序参数
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    const keyword = searchParams.get("keyword");

    // 构建查询条件
    const where: any = {};

    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { content: { contains: keyword } },
      ];
    }

    // 获取帖子总数
    const total = await prisma.post.count({ where });

    // 获取帖子列表
    const posts = await prisma.post.findMany({
      where,
      include: {
        featured: true,
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
      orderBy: {
        [sortBy]: order,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    let likedPostsMap: Map<number, boolean> = new Map();

    if (userId) {
      // 获取当前用户点赞的帖子
      const likedPosts = await prisma.postLike.findMany({
        where: { userId: userId },
      });

      likedPostsMap = new Map(likedPosts.map((lp) => [lp.postId, true]));
    }

    // 格式化返回数据
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      user: post.user,
      commentsCount: post._count.comments,
      likesCount: post._count.likes,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      isLiked: likedPostsMap.get(post.id) || false,
      isFeatured: post.featured,
    }));

    return NextResponse.json({
      data: formattedPosts,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("获取帖子列表失败:", error);
    return NextResponse.json({ error: "获取帖子列表失败" }, { status: 500 });
  }
}

// 创建帖子
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, tags } = body;

    // 获取当前用户ID
    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 验证必要参数
    if (!title || !content) {
      return NextResponse.json(
        { error: "标题和内容是必需的" },
        { status: 400 }
      );
    }

    // 验证用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const post = await prisma.$transaction(async (tx) => {
      // 创建帖子
      const post = await tx.post.create({
        data: {
          title,
          content,
          userId,
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

      // 关联标签
      await tx.tagsOnPosts.createMany({
        data: tags.map((tag: any) => ({ postId: post.id, tagId: tag })),
      });

      return post;
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("创建帖子失败:", error);
    return NextResponse.json({ error: "创建帖子失败" }, { status: 500 });
  }
}
