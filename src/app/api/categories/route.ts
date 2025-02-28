import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "../util";
import { UserRole } from "@prisma/client";

// 创建分类
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description } = body;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    if (!name) {
      return NextResponse.json({ error: "分类名称是必需的" }, { status: 400 });
    }

    // 检查分类名称是否已存在
    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      return NextResponse.json({ error: "分类名称已存在" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("创建分类失败:", error);
    return NextResponse.json({ error: "创建分类失败" }, { status: 500 });
  }
}
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
