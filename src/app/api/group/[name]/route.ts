import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 获取分组
export async function GET(
  req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    const group = await prisma.group.findFirst({
      where: { name },
      include: {
        category: true,
        _count: {
          select: {
            atoms: true,
          },
        },
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

    if (!group) {
      return NextResponse.json({ error: "分组不存在" }, { status: 404 });
    }

    return NextResponse.json({
      ...group,
      atomsCount: group._count.atoms,
    });
  } catch (error) {
    console.error("获取分组失败:", error);
    return NextResponse.json({ error: "获取分组失败" }, { status: 500 });
  }
}
