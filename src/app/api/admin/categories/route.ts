import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 创建分类
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, language } = body;

    if (!name) {
      return NextResponse.json({ error: "分类名称是必需的" }, { status: 400 });
    }

    // 检查分类名称是否已存在
    const existingCategory = await prisma.category.findUnique({
      where: { name, language },
    });

    if (existingCategory) {
      // 如果分类名称已存在，则更新分类
      const updatedCategory = await prisma.category.update({
        where: { id: existingCategory.id },
        data: { name, description, language },
      });
      return NextResponse.json(updatedCategory);
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        language,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("创建分类失败:", error);
    return NextResponse.json({ error: "创建分类失败" }, { status: 500 });
  }
}

// 获取所有分类
export async function GET(req: Request) {
  try {
    const categories = await prisma.category.findMany();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("获取分类失败:", error);
    return NextResponse.json({ error: "获取分类失败" }, { status: 500 });
  }
}
