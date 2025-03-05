import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const language = searchParams.get("language");

  try {
    const where = language ? { language } : {};
    // 获取分类列表
    const categories = await prisma.category.findMany({
      where,
      include: {
        groups: true,
        _count: {
          select: {
            groups: true,
            atoms: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 格式化返回数据
    const formattedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      groupsCount: category._count.groups,
      atomsCount: category._count.atoms,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      groups: category.groups.map((group) => ({
        id: group.id,
        name: group.name,
        description: group.description,
      })),
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error("获取分类列表失败:", error);
    return NextResponse.json({ error: "获取分类列表失败" }, { status: 500 });
  }
}
