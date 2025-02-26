import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 获取标签
export async function GET(req: Request) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ error: "查询参数不能为空" }, { status: 400 });
    }

    const tags = await prisma.tag.findMany({
      where: {
        name: {
          contains: query,
        },
      },
      include: {
        _count: {
          select: {
            atoms: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // 格式化返回数据
    const formattedTags = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      description: tag.description,
      atomsCount: tag._count.atoms,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    }));

    return NextResponse.json(formattedTags);
  } catch (error) {
    console.error("获取标签失败:", error);
    return NextResponse.json({ error: "获取标签失败" }, { status: 500 });
  }
}
