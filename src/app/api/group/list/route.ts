import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // 构建查询条件
    const where = categoryId ? { categoryId: parseInt(categoryId) } : {};

    // 获取总数
    const total = await prisma.group.count({ where });

    // 获取分组列表
    const groups = await prisma.group.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        _count: {
          select: {
            atoms: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 格式化返回数据
    const formattedGroups = groups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      category: group.category,
      atomsCount: group._count.atoms,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    }));

    return NextResponse.json({
      data: formattedGroups,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("获取分组列表失败:", error);
    return NextResponse.json({ error: "获取分组列表失败" }, { status: 500 });
  }
}

// 获取分组统计信息
export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    const where = categoryId ? { categoryId: parseInt(categoryId) } : {};

    const stats = await prisma.group.aggregate({
      where,
      _count: {
        _all: true, // 总分组数
      },
      _sum: {
        // 可以添加其他统计字段
      },
    });

    // 获取每个分组的原子数量
    const groupsWithAtomCounts = await prisma.group.findMany({
      where,
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            atoms: true,
          },
        },
      },
    });

    return NextResponse.json({
      totalGroups: stats._count._all,
      groupsWithAtomCounts: groupsWithAtomCounts.map((group) => ({
        id: group.id,
        name: group.name,
        atomsCount: group._count.atoms,
      })),
    });
  } catch (error) {
    console.error("获取分组统计失败:", error);
    return NextResponse.json({ error: "获取分组统计失败" }, { status: 500 });
  }
}

// 获取特定分类的分组列表
// const getGroupsByCategory = await fetch('/api/group/list?categoryId=1&page=1&pageSize=10');
// // 返回格式：
// // {
// //   data: [{
// //     id: 1,
// //     name: "分组名称",
// //     description: "描述",
// //     category: { id: 1, name: "分类名称", description: "分类描述" },
// //     atomsCount: 5,
// //     atoms: [...],
// //     createdAt: "2024-01-01T00:00:00.000Z",
// //     updatedAt: "2024-01-01T00:00:00.000Z"
// //   }, ...],
// //   pagination: {
// //     total: 100,
// //     page: 1,
// //     pageSize: 10,
// //     totalPages: 10
// //   }
// // }

// // 获取分组统计信息
// const getGroupStats = await fetch('/api/group/list?categoryId=1', {
//   method: 'POST'
// });
// // 返回格式：
// // {
// //   totalGroups: 50,
// //   groupsWithAtomCounts: [{
// //     id: 1,
// //     name: "分组名称",
// //     atomsCount: 5
// //   }, ...]
// // }
