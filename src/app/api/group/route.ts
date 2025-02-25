import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 创建分组
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, categoryId } = body;

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: "名称和分类 ID 是必需的" },
        { status: 400 }
      );
    }

    const group = await prisma.group.create({
      data: {
        name,
        description,
        categoryId: parseInt(categoryId),
      },
      include: {
        category: true,
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

    return NextResponse.json(group);
  } catch (error) {
    console.error("创建分组失败:", error);
    return NextResponse.json({ error: "创建分组失败" }, { status: 500 });
  }
}

// 删除分组
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "需要提供分组 ID" }, { status: 400 });
    }

    // 检查分组是否存在
    const existingGroup = await prisma.group.findUnique({
      where: { id: parseInt(id) },
      include: {
        atoms: true,
      },
    });

    if (!existingGroup) {
      return NextResponse.json({ error: "分组不存在" }, { status: 404 });
    }

    // 如果分组下有原子，不允许删除
    if (existingGroup.atoms.length > 0) {
      return NextResponse.json(
        { error: "分组下存在原子，无法删除" },
        { status: 400 }
      );
    }

    await prisma.group.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除分组失败:", error);
    return NextResponse.json({ error: "删除分组失败" }, { status: 500 });
  }
}

// 更新分组
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, description, categoryId } = body;

    if (!id) {
      return NextResponse.json({ error: "需要提供分组 ID" }, { status: 400 });
    }

    const group = await prisma.group.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
      },
      include: {
        category: true,
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

    return NextResponse.json(group);
  } catch (error) {
    console.error("更新分组失败:", error);
    return NextResponse.json({ error: "更新分组失败" }, { status: 500 });
  }
}

// 获取分组
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const name = searchParams.get("name");

    if (!id && !name) {
      // 如果没有提供 id 或 name，返回所有分组
      const groups = await prisma.group.findMany({
        include: {
          category: true,
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
      return NextResponse.json(groups);
    }

    const group = await prisma.group.findFirst({
      where: id ? { id: parseInt(id) } : name ? { name } : {},
      include: {
        category: true,
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

    return NextResponse.json(group);
  } catch (error) {
    console.error("获取分组失败:", error);
    return NextResponse.json({ error: "获取分组失败" }, { status: 500 });
  }
}

// 创建分组
// const createGroup = await fetch('/api/group', {
//   method: 'POST',
//   body: JSON.stringify({
//     name: '新分组',
//     description: '分组描述',
//     categoryId: 1
//   })
// });

// // 删除分组
// const deleteGroup = await fetch('/api/group?id=1', {
//   method: 'DELETE'
// });

// // 更新分组
// const updateGroup = await fetch('/api/group', {
//   method: 'PUT',
//   body: JSON.stringify({
//     id: 1,
//     name: '新名称',
//     description: '新描述'
//   })
// });

// // 获取分组
// const getGroupById = await fetch('/api/group?id=1');
// const getGroupByName = await fetch('/api/group?name=分组名称');
// const getAllGroups = await fetch('/api/group');
