import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 定义排序类型
type SortField =
  | "name"
  | "createdAt"
  | "updatedAt"
  | "groupsCount"
  | "atomsCount";
type SortOrder = "asc" | "desc";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // 分页参数
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    // 排序参数
    const sortBy = (searchParams.get("sortBy") || "name") as SortField;
    const order = (searchParams.get("order") || "asc") as SortOrder;

    // 搜索参数
    const search = searchParams.get("search") || "";

    // 构建查询条件
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : {};

    // 获取总数
    const total = await prisma.category.count({ where });

    // 获取分类列表
    let categories;

    // 如果按组数或原子数排序，需要特殊处理
    if (sortBy === "groupsCount" || sortBy === "atomsCount") {
      // 先获取所有符合条件的分类
      categories = await prisma.category.findMany({
        where,
        include: {
          _count: {
            select: {
              groups: true,
              atoms: true,
            },
          },
        },
      });

      // 手动排序
      categories.sort((a, b) => {
        const valueA =
          sortBy === "groupsCount" ? a._count.groups : a._count.atoms;
        const valueB =
          sortBy === "groupsCount" ? b._count.groups : b._count.atoms;

        return order === "asc" ? valueA - valueB : valueB - valueA;
      });

      // 手动分页
      categories = categories.slice((page - 1) * pageSize, page * pageSize);
    } else {
      // 对于其他字段，可以直接使用 Prisma 的排序
      categories = await prisma.category.findMany({
        where,
        include: {
          _count: {
            select: {
              groups: true,
              atoms: true,
            },
          },
        },
        orderBy: {
          [sortBy]: order,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
    }

    // 格式化返回数据
    const formattedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      groupsCount: category._count.groups,
      atomsCount: category._count.atoms,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));

    return NextResponse.json({
      data: formattedCategories,
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
      filters: {
        search,
      },
    });
  } catch (error) {
    console.error("获取分类列表失败:", error);
    return NextResponse.json({ error: "获取分类列表失败" }, { status: 500 });
  }
}

// 获取分类统计信息
export async function POST(req: Request) {
  try {
    // 获取总分类数
    const totalCategories = await prisma.category.count();

    // 获取总组数
    const totalGroups = await prisma.group.count();

    // 获取总原子数
    const totalAtoms = await prisma.standardAtom.count();

    // 获取每个分类的组数和原子数
    const categoriesWithCounts = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            groups: true,
            atoms: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // 获取最近创建的分类
    const recentCategories = await prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    // 获取最活跃的分类（原子数最多）
    const mostActiveCategories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            atoms: true,
          },
        },
      },
      orderBy: {
        atoms: {
          _count: "desc",
        },
      },
      take: 5,
    });

    return NextResponse.json({
      summary: {
        totalCategories,
        totalGroups,
        totalAtoms,
      },
      categoriesWithCounts: categoriesWithCounts.map((category) => ({
        id: category.id,
        name: category.name,
        groupsCount: category._count.groups,
        atomsCount: category._count.atoms,
      })),
      recentCategories,
      mostActiveCategories: mostActiveCategories.map((category) => ({
        id: category.id,
        name: category.name,
        atomsCount: category._count.atoms,
      })),
    });
  } catch (error) {
    console.error("获取分类统计失败:", error);
    return NextResponse.json({ error: "获取分类统计失败" }, { status: 500 });
  }
}

// 获取分类列表（默认按名称升序）
// const getCategories = await fetch('/api/category/list');

// // 按原子数量降序排序
// const getCategoriesByAtomCount = await fetch('/api/category/list?sortBy=atomsCount&order=desc');

// // 搜索分类
// const searchCategories = await fetch('/api/category/list?search=游戏');

// // 分页和排序组合
// const getPagedCategories = await fetch('/api/category/list?page=2&pageSize=10&sortBy=createdAt&order=desc');

// // 获取分类统计信息
// const getCategoryStats = await fetch('/api/category/list', {
//   method: 'POST'
// });
