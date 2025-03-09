import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 获取标签
export async function GET(
  req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const { searchParams } = new URL(req.url);

    // 获取分页参数
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const skip = (page - 1) * pageSize;

    // 获取标签基本信息
    const tag = await prisma.tag.findFirst({
      where: { name: decodeURIComponent(name) },
      include: {
        _count: {
          select: {
            atoms: true,
            posts: true,
          },
        },
      },
    });

    if (!tag) {
      return NextResponse.json({ error: "标签不存在" }, { status: 404 });
    }

    // 分页获取关联的原子
    const atomsData = await prisma.tagsOnAtoms.findMany({
      where: { tagId: tag.id, atom: { status: "PUBLISHED" } },
      include: {
        atom: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            status: true,
          },
        },
      },
      skip,
      take: pageSize,
    });

    // 格式化返回数据
    const formattedTag = {
      id: tag.id,
      name: tag.name,
      description: tag.description,
      atomsCount: tag._count.atoms,
      data: atomsData.map((a) => a.atom),
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
      pagination: {
        page,
        pageSize,
        total: tag._count.atoms,
        totalPages: Math.ceil(tag._count.atoms / pageSize),
      },
    };

    return NextResponse.json(formattedTag);
  } catch (error) {
    console.error("获取标签失败:", error);
    return NextResponse.json({ error: "获取标签失败" }, { status: 500 });
  }
}
