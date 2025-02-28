import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 获取分类
export async function GET(
  req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    const category = await prisma.category.findFirst({
      where: {
        name: name,
      },
      include: {
        groups: {
          include: {
            _count: {
              select: {
                atoms: true,
              },
            },
          },
        },
        _count: {
          select: {
            groups: true,
            atoms: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "分类不存在" }, { status: 404 });
    }

    // 格式化返回数据
    const formattedCategory = {
      id: category.id,
      name: category.name,
      description: category.description,
      groupsCount: category._count.groups,
      atomsCount: category._count.atoms,
      groups: category.groups.map((group) => ({
        id: group.id,
        name: group.name,
        description: group.description,
        atomsCount: group._count.atoms,
      })),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };

    return NextResponse.json(formattedCategory);
  } catch (error) {
    console.error("获取分类失败:", error);
    return NextResponse.json({ error: "获取分类失败" }, { status: 500 });
  }
}
