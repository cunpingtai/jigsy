import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { currentUserId } from "../../util";

// 更新用户信息
export async function PUT(req: Request) {
  try {
    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { ...updateData } = body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "更新用户失败" }, { status: 500 });
  }
}

// 获取用户信息
export async function GET(req: Request) {
  try {
    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "获取用户信息失败" }, { status: 500 });
  }
}
