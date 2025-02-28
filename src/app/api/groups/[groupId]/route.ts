import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "../../util";
import { UserRole } from "@prisma/client";

// 删除分组
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const { groupId } = await params;

    // 检查分组是否存在
    const existingGroup = await prisma.group.findUnique({
      where: { id: parseInt(groupId) },
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
      where: { id: parseInt(groupId) },
    });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除分组失败:", error);
    return NextResponse.json({ error: "删除分组失败" }, { status: 500 });
  }
}

// 更新分组
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const { groupId } = await params;
    const body = await req.json();
    const { name, description, categoryId } = body;

    const group = await prisma.group.update({
      where: { id: parseInt(groupId) },
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
export async function GET(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;

    const group = await prisma.group.findFirst({
      where: { id: parseInt(groupId) },
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
