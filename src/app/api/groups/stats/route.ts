import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
