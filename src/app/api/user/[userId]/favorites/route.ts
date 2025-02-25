import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 获取用户收藏列表
export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = params.userId;

    // 分页参数
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // 排序参数
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    // 验证用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // 获取收藏总数
    const total = await prisma.favorite.count({
      where: { userId: parseInt(userId) },
    });

    // 获取收藏列表
    const favorites = await prisma.favorite.findMany({
      where: { userId: parseInt(userId) },
      include: {
        atom: {
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
    const formattedFavorites = favorites.map((favorite) => ({
      id: favorite.id,
      atom: {
        id: favorite.atom.id,
        title: favorite.atom.title,
        coverImage: favorite.atom.coverImage,
        viewCount: favorite.atom.viewCount,
        status: favorite.atom.status,
        category: favorite.atom.category,
        group: favorite.atom.group,
        likesCount: favorite.atom._count.likes,
        commentsCount: favorite.atom._count.comments,
        favoritesCount: favorite.atom._count.favorites,
        createdAt: favorite.atom.createdAt,
        updatedAt: favorite.atom.updatedAt,
      },
      createdAt: favorite.createdAt,
      updatedAt: favorite.updatedAt,
    }));

    return NextResponse.json({
      favorites: formattedFavorites,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("获取用户收藏失败:", error);
    return NextResponse.json({ error: "获取用户收藏失败" }, { status: 500 });
  }
}

// 添加收藏
// const addFavorite = await fetch('/api/atom/1/favorite', {
//   method: 'POST',
//   body: JSON.stringify({
//     userId: 1
//   })
// });

// // 取消收藏
// const removeFavorite = await fetch('/api/atom/1/favorite?userId=1', {
//   method: 'DELETE'
// });

// // 获取收藏状态
// const getFavoriteStatus = await fetch('/api/atom/1/favorite?userId=1');

// // 获取原子的收藏数
// const getFavoritesCount = await fetch('/api/atom/1/favorite');

// // 获取用户收藏列表
// const getUserFavorites = await fetch('/api/user/1/favorites?page=1&pageSize=10&sortBy=createdAt&order=desc');
