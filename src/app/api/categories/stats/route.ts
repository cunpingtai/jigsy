import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
