import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { StandardAtomStatus } from "@prisma/client";

// 定义排序类型
type SortField =
  | "createdAt"
  | "updatedAt"
  | "viewCount"
  | "likesCount"
  | "title";
type SortOrder = "asc" | "desc";

// 获取分类下的原子列表
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
    const sortBy = (searchParams.get("sortBy") || "createdAt") as SortField;
    const order = (searchParams.get("order") || "desc") as SortOrder;

    // 筛选参数
    const status = searchParams.get("status") as StandardAtomStatus | null;
    const groupId = searchParams.get("groupId");
    const search = searchParams.get("search") || "";

    // 验证分类是否存在
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) },
      select: { id: true, name: true },
    });

    if (!category) {
      return NextResponse.json({ error: "分类不存在" }, { status: 404 });
    }

    // 构建查询条件
    const where = {
      categoryId: parseInt(categoryId),
      ...(status && { status }),
      ...(groupId && { groupId: parseInt(groupId) }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { content: { path: ["description"], string_contains: search } },
        ],
      }),
    } as any;

    // 获取总数
    const total = await prisma.standardAtom.count({ where });

    // 获取原子列表
    const atoms = await prisma.standardAtom.findMany({
      where,
      include: {
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
        _count: {
          select: {
            likes: true,
            comments: true,
            favorites: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        fieldConfigs: true,
      },
      orderBy: {
        [sortBy]: order,
      },
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
      commentsCount: atom._count.comments,
      favoritesCount: atom._count.favorites,
      viewCount: atom.viewCount,
      likesCount: atom._count.likes,
      tags: atom.tags.map((t) => t.tag),
      creator: atom.user,
      group: atom.group,
      createdAt: atom.createdAt,
      updatedAt: atom.updatedAt,
    }));

    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
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
      filters: {
        status,
        groupId,
        search,
      },
    });
  } catch (error) {
    console.error("获取分类原子列表失败:", error);
    return NextResponse.json(
      { error: "获取分类原子列表失败" },
      { status: 500 }
    );
  }
}
