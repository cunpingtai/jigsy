import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 获取所有精选帖子
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // 分页参数
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // 获取精选帖子总数
    const total = await prisma.featured.count();

    // 获取精选帖子列表
    const featuredPosts = await prisma.featured.findMany({
      include: {
        post: {
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
                comments: true,
                likes: true,
              },
            },
          },
        },
      },
      orderBy: [{ order: "desc" }, { featuredAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 格式化返回数据
    const formattedFeaturedPosts = featuredPosts.map((featured) => ({
      id: featured.id,
      reason: featured.reason,
      featuredAt: featured.featuredAt,
      post: {
        id: featured.post.id,
        title: featured.post.title,
        content: featured.post.content,
        user: featured.post.user,
        commentsCount: featured.post._count.comments,
        likesCount: featured.post._count.likes,
        createdAt: featured.post.createdAt,
        updatedAt: featured.post.updatedAt,
      },
    }));

    return NextResponse.json({
      data: formattedFeaturedPosts,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("获取精选帖子列表失败:", error);
    return NextResponse.json(
      { error: "获取精选帖子列表失败" },
      { status: 500 }
    );
  }
}
