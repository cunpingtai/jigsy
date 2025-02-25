import { prisma } from "@/lib/prisma";
import { AtomStatus } from "@prisma/client";
import { NextResponse } from "next/server";

// 定义排序类型
type SortField = "createdAt" | "viewCount" | "likesCount" | "title";
type SortOrder = "asc" | "desc";

// 获取分组下的原子列表
export async function GET(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = params.groupId;

    // 分页参数
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // 排序参数
    const sortBy = (searchParams.get("sortBy") || "createdAt") as SortField;
    const order = (searchParams.get("order") || "desc") as SortOrder;

    // 状态筛选
    const status = searchParams.get("status");

    // 验证分组是否存在
    const group = await prisma.group.findUnique({
      where: { id: parseInt(groupId) },
      select: { id: true, name: true },
    });

    if (!group) {
      return NextResponse.json({ error: "分组不存在" }, { status: 404 });
    }

    // 构建查询条件
    const where = {
      groupId: parseInt(groupId),
      ...(status && { status: status as AtomStatus }),
    };

    // 构建排序条件
    const orderBy = {
      [sortBy]: order,
    };

    // 获取总数
    const total = await prisma.standardAtom.count({ where });

    // 获取原子列表
    const atoms = await prisma.standardAtom.findMany({
      where,
      include: {
        likes: true,
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
        fieldConfigs: true,
        _count: {
          select: {
            comments: true,
            favorites: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 格式化返回数据
    const formattedAtoms = atoms.map((atom) => ({
      id: atom.id,
      title: atom.title,
      content: atom.content,
      coverImage: atom.coverImage,
      status: atom.status,
      viewCount: atom.viewCount,
      likesCount: atom.likes.length,
      commentsCount: atom._count.comments,
      favoritesCount: atom._count.favorites,
      tags: atom.tags.map((t) => t.tag),
      creator: atom.user,
      createdAt: atom.createdAt,
      updatedAt: atom.updatedAt,
      config: atom.fieldConfigs.reduce(
        (acc, field) => ({
          ...acc,
          [field.name]: field.value,
        }),
        {}
      ),
    }));

    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
      },
      data: formattedAtoms,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      sorting: {
        sortBy,
        order,
      },
    });
  } catch (error) {
    console.error("获取分组原子列表失败:", error);
    return NextResponse.json(
      { error: "获取分组原子列表失败" },
      { status: 500 }
    );
  }
}

// 获取分组原子列表
// const getAtoms = await fetch('/api/group/1/atoms?page=1&pageSize=10&sortBy=viewCount&order=desc');
// // 返回格式：
// // {
// //   group: { id: 1, name: "分组名称" },
// //   data: [{
// //     id: 1,
// //     title: "原子标题",
// //     content: {},
// //     coverImage: "图片地址",
// //     status: "PUBLISHED",
// //     viewCount: 100,
// //     likesCount: 50,
// //     commentsCount: 30,
// //     favoritesCount: 20,
// //     tags: [...],
// //     creator: { id: 1, name: "创建者", avatar: "头像地址" },
// //     createdAt: "2024-01-01T00:00:00.000Z",
// //     updatedAt: "2024-01-01T00:00:00.000Z",
// //     config: { /* 配置信息 */ }
// //   }, ...],
// //   pagination: {
// //     total: 100,
// //     page: 1,
// //     pageSize: 10,
// //     totalPages: 10
// //   },
// //   sorting: {
// //     sortBy: "viewCount",
// //     order: "desc"
// //   }
// // }

// // 获取分组原子统计
// const getStats = await fetch('/api/group/1/atoms', {
//   method: 'POST'
// });
// // 返回格式：
// // {
// //   statistics: [{
// //     status: "PUBLISHED",
// //     _count: { _all: 50 },
// //     _sum: { viewCount: 1000, likesCount: 500 }
// //   }, ...],
// //   recentUpdates: [{
// //     id: 1,
// //     title: "原子标题",
// //     updatedAt: "2024-01-01T00:00:00.000Z"
// //   }, ...]
// // }
