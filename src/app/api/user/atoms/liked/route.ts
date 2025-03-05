import { currentUserId } from "@/app/api/util";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 获取用户收藏列表
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 分页参数
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // 排序参数
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    // 获取收藏总数
    const total = await prisma.favorite.count({
      where: { userId },
    });

    // 获取收藏列表
    const likedAtoms = await prisma.atomLike.findMany({
      where: { userId },
      include: {
        standardAtom: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            viewCount: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            group: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
                favorites: true,
              },
            },
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
    const formattedLikedAtoms = likedAtoms.map((likedAtom) => ({
      id: likedAtom.id,
      atom: {
        id: likedAtom.standardAtom.id,
        title: likedAtom.standardAtom.title,
        coverImage: likedAtom.standardAtom.coverImage,
        viewCount: likedAtom.standardAtom.viewCount,
        status: likedAtom.standardAtom.status,
        category: likedAtom.standardAtom.category,
        group: likedAtom.standardAtom.group,
        likesCount: likedAtom.standardAtom._count.likes,
        commentsCount: likedAtom.standardAtom._count.comments,
        favoritesCount: likedAtom.standardAtom._count.favorites,
        createdAt: likedAtom.standardAtom.createdAt,
        updatedAt: likedAtom.standardAtom.updatedAt,
      },
      createdAt: likedAtom.createdAt,
    }));

    return NextResponse.json({
      data: formattedLikedAtoms,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("获取用户点赞失败:", error);
    return NextResponse.json({ error: "获取用户点赞失败" }, { status: 500 });
  }
}
