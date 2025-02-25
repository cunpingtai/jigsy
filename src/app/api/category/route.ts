import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 创建分类
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: "分类名称是必需的" }, { status: 400 });
    }

    // 检查分类名称是否已存在
    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      return NextResponse.json({ error: "分类名称已存在" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("创建分类失败:", error);
    return NextResponse.json({ error: "创建分类失败" }, { status: 500 });
  }
}

// 删除分类
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const name = searchParams.get("name");

    if (!id && !name) {
      return NextResponse.json(
        { error: "需要提供分类 ID 或名称" },
        { status: 400 }
      );
    }

    // 构建查询条件
    const where = id ? { id: parseInt(id) } : { name: name as string };

    // 检查分类是否存在
    const existingCategory = await prisma.category.findFirst({
      where,
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
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, newName, description } = body;

    if ((!id && !name) || (!newName && description === undefined)) {
      return NextResponse.json(
        { error: "需要提供分类标识和更新内容" },
        { status: 400 }
      );
    }

    // 构建查询条件
    const where = id ? { id: parseInt(id) } : { name };

    // 检查分类是否存在
    const existingCategory = await prisma.category.findFirst({
      where,
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
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const name = searchParams.get("name");

    // 如果没有提供 id 或 name，返回所有分类
    if (!id && !name) {
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: {
              groups: true,
              atoms: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      // 格式化返回数据
      const formattedCategories = categories.map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        groupsCount: category._count.groups,
        atomsCount: category._count.atoms,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      }));

      return NextResponse.json(formattedCategories);
    }

    // 构建查询条件
    const where = id ? { id: parseInt(id) } : { name: name as string };

    const category = await prisma.category.findFirst({
      where,
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

// 创建分类
// const createCategory = await fetch('/api/category', {
//   method: 'POST',
//   body: JSON.stringify({
//     name: '新分类',
//     description: '分类描述'
//   })
// });

// // 删除分类
// const deleteCategory = await fetch('/api/category?id=1', {
//   method: 'DELETE'
// });
// // 或
// const deleteCategoryByName = await fetch('/api/category?name=分类名称', {
//   method: 'DELETE'
// });

// // 更新分类
// const updateCategory = await fetch('/api/category', {
//   method: 'PUT',
//   body: JSON.stringify({
//     id: 1, // 或使用 name: '原名称'
//     newName: '新名称',
//     description: '新描述'
//   })
// });

// // 获取分类
// const getCategoryById = await fetch('/api/category?id=1');
// const getCategoryByName = await fetch('/api/category?name=分类名称');
// const getAllCategories = await fetch('/api/category');
// const getCategoriesWithGroups = await fetch('/api/category?includeGroups=true');
