import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 创建标签
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description } = body;

    // 验证名称
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "标签名称不能为空" }, { status: 400 });
    }

    // 检查名称是否已存在
    const existingTag = await prisma.tag.findFirst({
      where: { name: { equals: name } },
    });

    if (existingTag) {
      return NextResponse.json({ error: "标签名称已存在" }, { status: 400 });
    }

    // 创建标签
    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        description,
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error("创建标签失败:", error);
    return NextResponse.json({ error: "创建标签失败" }, { status: 500 });
  }
}

// 删除标签
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "需要提供标签 ID" }, { status: 400 });
    }

    // 检查标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: { id: parseInt(id) },
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
        where: { tagId: parseInt(id) },
      });
    }

    // 删除标签
    await prisma.tag.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除标签失败:", error);
    return NextResponse.json({ error: "删除标签失败" }, { status: 500 });
  }
}

// 更新标签
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, description } = body;

    if (!id) {
      return NextResponse.json({ error: "需要提供标签 ID" }, { status: 400 });
    }

    // 验证名称
    if (name !== undefined && (name === null || name.trim() === "")) {
      return NextResponse.json({ error: "标签名称不能为空" }, { status: 400 });
    }

    // 检查标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingTag) {
      return NextResponse.json({ error: "标签不存在" }, { status: 404 });
    }

    // 如果要更新名称，检查新名称是否已存在
    if (name && name !== existingTag.name) {
      const nameExists = await prisma.tag.findFirst({
        where: {
          name: { equals: name.trim() },
          id: { not: parseInt(id) },
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
      where: { id: parseInt(id) },
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
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const name = searchParams.get("name");

    // 如果没有提供 id 或 name，返回所有标签
    if (!id && !name) {
      const tags = await prisma.tag.findMany({
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
    }

    // 构建查询条件
    const where = id
      ? { id: parseInt(id) }
      : name
      ? { name: { equals: name } }
      : {};

    const tag = await prisma.tag.findFirst({
      where,
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
        _count: {
          select: {
            atoms: true,
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
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    };

    return NextResponse.json(formattedTag);
  } catch (error) {
    console.error("获取标签失败:", error);
    return NextResponse.json({ error: "获取标签失败" }, { status: 500 });
  }
}
