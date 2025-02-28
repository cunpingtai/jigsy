import { getCurrentUser } from "@/app/api/util";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

// 获取指定分类下的分组列表
export async function GET(
  req: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const { categoryId } = await params;

    // 分页参数
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // 排序参数
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    // 搜索参数
    const search = searchParams.get("search") || "";

    // 验证分类是否存在
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) },
      select: { id: true },
    });

    if (!category) {
      return NextResponse.json({ error: "分类不存在" }, { status: 404 });
    }

    // 构建查询条件
    const whereClause: any = {
      categoryId: parseInt(categoryId),
    };

    // 添加搜索条件
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // 获取分组总数
    const total = await prisma.group.count({
      where: whereClause,
    });

    // 获取分组列表
    const groups = await prisma.group.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
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

// 在指定分类下创建分组
export async function POST(
  req: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const body = await req.json();
    const { name, description } = body;
    const { categoryId } = await params;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // 验证必要参数
    if (!name) {
      return NextResponse.json({ error: "分组名称是必需的" }, { status: 400 });
    }

    // 验证分类是否存在
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) },
      select: { id: true },
    });

    if (!category) {
      return NextResponse.json({ error: "分类不存在" }, { status: 404 });
    }

    // 检查同一分类下是否已存在同名分组
    const existingGroup = await prisma.group.findFirst({
      where: {
        name,
        categoryId: parseInt(categoryId),
      },
    });

    if (existingGroup) {
      return NextResponse.json(
        { error: "该分类下已存在同名分组" },
        { status: 400 }
      );
    }

    // 创建分组
    const group = await prisma.group.create({
      data: {
        name,
        description,
        categoryId: parseInt(categoryId),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
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
