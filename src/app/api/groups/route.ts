import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 创建分组
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, categoryId } = body;

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: "名称和分类 ID 是必需的" },
        { status: 400 }
      );
    }

    const group = await prisma.group.create({
      data: {
        name,
        description,
        categoryId: parseInt(categoryId),
      },
      include: {
        category: true,
        atoms: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error("创建分组失败:", error);
    return NextResponse.json({ error: "创建分组失败" }, { status: 500 });
  }
}

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
