import { currentUserId, getCurrentUser } from "@/app/api/util";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

// 设置原子 为精选
export async function POST(
  req: Request,
  { params }: { params: Promise<{ atomId: string }> }
) {
  try {
    const { atomId } = await params;
    const atomIdInt = parseInt(atomId);
    const body = await req.json();
    const { reason, order = 0 } = body;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const userId = user.id;

    // 使用事务处理所有数据库操作
    const result = await prisma.$transaction(async (tx) => {
      // 验证原子是否存在
      const atom = await tx.standardAtom.findUnique({
        where: { id: atomIdInt },
        select: { id: true },
      });

      if (!atom) {
        throw new Error("原子不存在");
      }

      // 检查原子是否已经被精选
      const existingFeatured = await tx.atomFeatured.findUnique({
        where: { atomId: atomIdInt },
      });

      let featured;
      if (existingFeatured) {
        // 更新现有精选信息
        featured = await tx.atomFeatured.update({
          where: { atomId: atomIdInt },
          data: {
            reason: reason,
            order: order,
            featuredAt: new Date(),
            featuredBy: userId,
          },
        });

        return { featured, isUpdate: true };
      } else {
        // 创建新的精选记录
        featured = await tx.atomFeatured.create({
          data: {
            atomId: atomIdInt,
            reason: reason,
            order: order,
            featuredBy: userId,
          },
        });

        return { featured, isUpdate: false };
      }
    });

    return NextResponse.json({
      message: result.isUpdate ? "精选原子更新成功" : "设置精选原子成功",
      featured: result.featured,
    });
  } catch (error: any) {
    console.error("设置精选原子失败:", error);

    if (error.message === "原子不存在") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "设置精选原子失败" }, { status: 500 });
  }
}

// 取消原子精选
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ atomId: string }> }
) {
  try {
    const { atomId } = await params;
    const atomIdInt = parseInt(atomId);

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // 使用事务处理
    await prisma.$transaction(async (tx) => {
      // 验证原子是否存在
      const atom = await tx.standardAtom.findUnique({
        where: { id: atomIdInt },
        select: { id: true },
      });

      if (!atom) {
        throw new Error("原子不存在");
      }

      // 检查原子是否已经被精选
      const existingFeatured = await tx.atomFeatured.findUnique({
        where: { atomId: atomIdInt },
      });

      if (!existingFeatured) {
        throw new Error("该原子尚未被设为精选");
      }

      // 删除精选记录
      await tx.atomFeatured.delete({
        where: { atomId: atomIdInt },
      });
    });

    return NextResponse.json({
      message: "取消精选原子成功",
    });
  } catch (error: any) {
    console.error("取消精选原子失败:", error);

    if (error.message === "原子不存在") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    } else if (error.message === "该原子尚未被设为精选") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "取消精选原子失败" }, { status: 500 });
  }
}

// 获取原子精选状态
export async function GET(
  req: Request,
  { params }: { params: Promise<{ atomId: string }> }
) {
  try {
    const { atomId } = await params;
    const atomIdInt = parseInt(atomId);

    // 验证原子是否存在并同时获取精选信息
    const atom = await prisma.standardAtom.findUnique({
      where: { id: atomIdInt },
      select: {
        id: true,
        title: true,
        featured: true,
      },
    });

    if (!atom) {
      return NextResponse.json({ error: "原子不存在" }, { status: 404 });
    }

    return NextResponse.json({
      isFeatured: !!atom.featured,
      featured: atom.featured || null,
    });
  } catch (error) {
    console.error("获取原子精选状态失败:", error);
    return NextResponse.json(
      { error: "获取原子精选状态失败" },
      { status: 500 }
    );
  }
}
