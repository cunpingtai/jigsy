import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 获取标签
export async function GET(
  req: Request,
  { params }: { params: { name: string } }
) {
  try {
    const { name } = params;
    const tag = await prisma.tag.findFirst({
      where: { name },
      include: {
        atoms: {
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
        },
        posts: {
          include: {
            post: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        },
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

    // 格式化返回数据
    const formattedTag = {
      id: tag.id,
      name: tag.name,
      description: tag.description,
      atomsCount: tag._count.atoms,
      atoms: tag.atoms.map((a) => a.atom),
      postsCount: tag._count.posts,
      posts: tag.posts.map((p) => p.post),
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    };

    return NextResponse.json(formattedTag);
  } catch (error) {
    console.error("获取标签失败:", error);
    return NextResponse.json({ error: "获取标签失败" }, { status: 500 });
  }
}
