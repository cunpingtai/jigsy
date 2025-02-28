import { currentUserId } from "@/app/api/util";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clerkId: string }> }
) {
  try {
    const { clerkId } = await params;
    const { ...updateData } = await req.json();

    if (!clerkId) {
      return NextResponse.json({ error: "需要提供 clerkId" }, { status: 400 });
    }

    // 查找用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { clerkId },
    });

    let user;

    if (existingUser) {
      // 用户存在，更新信息
      user = await prisma.user.update({
        where: { clerkId },
        data: updateData,
      });
    } else {
      // 用户不存在，创建新用户
      user = await prisma.user.create({
        data: {
          clerkId,
          ...updateData,
        },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "更新或创建用户失败" }, { status: 500 });
  }
}

// 获取用户信息
export async function GET(
  req: Request,
  { params }: { params: Promise<{ clerkId: string }> }
) {
  try {
    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clerkId } = await params;
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "获取用户信息失败" }, { status: 500 });
  }
}
