import { currentUserId } from "@/app/api/util";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 设置帖子为精选
export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = parseInt(params.postId);
    const body = await req.json();
    const { reason, order = 0 } = body;

    // 获取当前用户ID
    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 验证用户是否有管理员权限
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "您没有权限设置精选帖子" },
        { status: 403 }
      );
    }

    // 验证帖子是否存在
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    // 检查帖子是否已经被精选
    const existingFeatured = await prisma.featured.findUnique({
      where: { postId: postId },
    });

    if (existingFeatured) {
      // 更新现有精选信息
      const updatedFeatured = await prisma.featured.update({
        where: { postId: postId },
        data: {
          reason: reason,
          order: order,
          featuredAt: new Date(),
          featuredBy: userId,
        },
      });

      return NextResponse.json({
        message: "精选帖子更新成功",
        featured: updatedFeatured,
      });
    }

    // 创建新的精选记录
    const featured = await prisma.featured.create({
      data: {
        postId: postId,
        reason: reason,
        order: order,
        featuredBy: userId,
      },
    });

    return NextResponse.json({
      message: "设置精选帖子成功",
      featured: featured,
    });
  } catch (error) {
    console.error("设置精选帖子失败:", error);
    return NextResponse.json({ error: "设置精选帖子失败" }, { status: 500 });
  }
}

// 取消帖子精选
export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = parseInt(params.postId);

    // 获取当前用户ID
    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 验证用户是否有管理员权限
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "您没有权限取消精选帖子" },
        { status: 403 }
      );
    }

    // 验证帖子是否存在
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    // 检查帖子是否已经被精选
    const existingFeatured = await prisma.featured.findUnique({
      where: { postId: postId },
    });

    if (!existingFeatured) {
      return NextResponse.json(
        { error: "该帖子尚未被设为精选" },
        { status: 400 }
      );
    }

    // 删除精选记录
    await prisma.featured.delete({
      where: { postId: postId },
    });

    return NextResponse.json({
      message: "取消精选帖子成功",
    });
  } catch (error) {
    console.error("取消精选帖子失败:", error);
    return NextResponse.json({ error: "取消精选帖子失败" }, { status: 500 });
  }
}

// 获取帖子精选状态
export async function GET(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = parseInt(params.postId);

    // 验证帖子是否存在
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    // 获取帖子的精选信息
    const featured = await prisma.featured.findUnique({
      where: { postId: postId },
      include: {
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      isFeatured: !!featured,
      featured: featured || null,
    });
  } catch (error) {
    console.error("获取帖子精选状态失败:", error);
    return NextResponse.json(
      { error: "获取帖子精选状态失败" },
      { status: 500 }
    );
  }
}
