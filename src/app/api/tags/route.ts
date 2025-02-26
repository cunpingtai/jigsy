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

// 获取标签
export async function GET(req: Request) {
  try {
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
  } catch (error) {
    console.error("获取标签失败:", error);
    return NextResponse.json({ error: "获取标签失败" }, { status: 500 });
  }
}
