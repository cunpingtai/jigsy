import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 删除标签
export async function DELETE(
  req: Request,
  { params }: { params: { tagId: string } }
) {
  try {
    const { tagId } = params;

    // 检查标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: { id: parseInt(tagId) },
      include: {
        atoms: true,
      },
    });

    if (!existingTag) {
      return NextResponse.json({ error: "标签不存在" }, { status: 404 });
    }

    // 检查标签是否被使用
    if (existingTag.atoms.length > 0) {
      // 选择一：返回错误，不允许删除
      // return NextResponse.json(
      //   { error: "标签已被使用，无法删除" },
      //   { status: 400 }
      // );

      // 选择二：删除标签与原子的关联，然后删除标签
      await prisma.tagsOnAtoms.deleteMany({
        where: { tagId: parseInt(tagId) },
      });
    }

    // 删除标签
    await prisma.tag.delete({
      where: { id: parseInt(tagId) },
    });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除标签失败:", error);
    return NextResponse.json({ error: "删除标签失败" }, { status: 500 });
  }
}

// 更新标签
export async function PUT(
  req: Request,
  { params }: { params: { tagId: string } }
) {
  try {
    const { tagId } = params;
    const body = await req.json();
    const { name, description } = body;

    // 验证名称
    if (name !== undefined && (name === null || name.trim() === "")) {
      return NextResponse.json({ error: "标签名称不能为空" }, { status: 400 });
    }

    // 检查标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: { id: parseInt(tagId) },
    });

    if (!existingTag) {
      return NextResponse.json({ error: "标签不存在" }, { status: 404 });
    }

    // 如果要更新名称，检查新名称是否已存在
    if (name && name !== existingTag.name) {
      const nameExists = await prisma.tag.findFirst({
        where: {
          name: { equals: name.trim() },
          id: { not: parseInt(tagId) },
        },
      });

      if (nameExists) {
        return NextResponse.json({ error: "标签名称已存在" }, { status: 400 });
      }
    }

    // 构建更新数据
    const updateData = {
      ...(name && { name: name.trim() }),
      ...(description !== undefined && { description }),
    };

    // 更新标签
    const tag = await prisma.tag.update({
      where: { id: parseInt(tagId) },
      data: updateData,
      include: {
        _count: {
          select: {
            atoms: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...tag,
      atomsCount: tag._count.atoms,
    });
  } catch (error) {
    console.error("更新标签失败:", error);
    return NextResponse.json({ error: "更新标签失败" }, { status: 500 });
  }
}

// 获取标签
export async function GET(
  req: Request,
  { params }: { params: { tagId: string } }
) {
  try {
    const { tagId } = params;
    const tag = await prisma.tag.findFirst({
      where: { id: parseInt(tagId) },
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
      posts: tag.posts.map((p) => p.post),
      postsCount: tag._count.posts,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    };

    return NextResponse.json(formattedTag);
  } catch (error) {
    console.error("获取标签失败:", error);
    return NextResponse.json({ error: "获取标签失败" }, { status: 500 });
  }
}
