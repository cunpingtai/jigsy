import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 获取所有精选原子
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // 分页参数
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // 获取精选帖子总数
    const total = await prisma.atomFeatured.count();

    // 获取精选帖子列表
    const atomFeatureds = await prisma.atomFeatured.findMany({
      include: {
        atom: {
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
    const formattedAtomFeatureds = atomFeatureds.map((featured) => ({
      id: featured.id,
      reason: featured.reason,
      featuredAt: featured.featuredAt,
      atom: {
        id: featured.atom.id,
        title: featured.atom.title,
        content: featured.atom.content,
        user: featured.atom.user,
        commentsCount: featured.atom._count.comments,
        likesCount: featured.atom._count.likes,
        createdAt: featured.atom.createdAt,
        updatedAt: featured.atom.updatedAt,
      },
    }));

    return NextResponse.json({
      data: formattedAtomFeatureds,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("获取精选原子列表失败:", error);
    return NextResponse.json(
      { error: "获取精选原子列表失败" },
      { status: 500 }
    );
  }
}
