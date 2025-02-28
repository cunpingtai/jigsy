import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "../../util";
import { UserRole } from "@prisma/client";

// 删除分类
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // 构建查询条件

    // 检查分类是否存在
    const existingCategory = await prisma.category.findFirst({
      where: { id: parseInt(categoryId) },
      include: {
        groups: true,
        atoms: true,
      },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: "分类不存在" }, { status: 404 });
    }

    // 检查分类下是否有组或原子
    if (
      existingCategory.groups.length > 0 ||
      existingCategory.atoms.length > 0
    ) {
      return NextResponse.json(
        { error: "分类下存在组或原子，无法删除" },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: existingCategory.id },
    });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除分类失败:", error);
    return NextResponse.json({ error: "删除分类失败" }, { status: 500 });
  }
}

// 更新分类
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const { categoryId } = await params;
    const body = await req.json();
    const { newName, description } = body;

    if (!newName && description === undefined) {
      return NextResponse.json({ error: "需要提供更新内容" }, { status: 400 });
    }

    // 检查分类是否存在
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: parseInt(categoryId),
      },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: "分类不存在" }, { status: 404 });
    }

    // 如果要更新名称，检查新名称是否已存在
    if (newName && newName !== existingCategory.name) {
      const nameExists = await prisma.category.findUnique({
        where: { name: newName },
      });

      if (nameExists) {
        return NextResponse.json({ error: "新名称已存在" }, { status: 400 });
      }
    }

    // 构建更新数据
    const updateData = {
      ...(newName && { name: newName }),
      ...(description !== undefined && { description }),
    };

    const category = await prisma.category.update({
      where: { id: existingCategory.id },
      data: updateData,
      include: {
        _count: {
          select: {
            groups: true,
            atoms: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...category,
      groupsCount: category._count.groups,
      atomsCount: category._count.atoms,
    });
  } catch (error) {
    console.error("更新分类失败:", error);
    return NextResponse.json({ error: "更新分类失败" }, { status: 500 });
  }
}

// 获取分类
export async function GET(
  req: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;

    const category = await prisma.category.findFirst({
      where: {
        id: parseInt(categoryId),
      },
      include: {
        groups: {
          include: {
            _count: {
              select: {
                atoms: true,
              },
            },
          },
        },
        _count: {
          select: {
            groups: true,
            atoms: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "分类不存在" }, { status: 404 });
    }

    // 格式化返回数据
    const formattedCategory = {
      id: category.id,
      name: category.name,
      description: category.description,
      groupsCount: category._count.groups,
      atomsCount: category._count.atoms,
      groups: category.groups.map((group) => ({
        id: group.id,
        name: group.name,
        description: group.description,
        atomsCount: group._count.atoms,
      })),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };

    return NextResponse.json(formattedCategory);
  } catch (error) {
    console.error("获取分类失败:", error);
    return NextResponse.json({ error: "获取分类失败" }, { status: 500 });
  }
}
