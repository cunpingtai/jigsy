import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 创建用户
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clerkId, email, name, avatar } = body;

    const user = await prisma.user.create({
      data: {
        clerkId,
        email,
        name,
        avatar,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "创建用户失败" }, { status: 500 });
  }
}

// 更新用户信息
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, clerkId, ...updateData } = body;

    let user;

    if (id) {
      // 通过 ID 更新
      user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: updateData,
      });
    } else if (clerkId) {
      // 通过 clerkId 更新
      user = await prisma.user.update({
        where: { clerkId },
        data: updateData,
      });
    } else {
      return NextResponse.json(
        { error: "需要提供 id 或 clerkId" },
        { status: 400 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "更新用户失败" }, { status: 500 });
  }
}

// 获取用户信息
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clerkId = searchParams.get("clerkId");

    if (!id && !clerkId) {
      return NextResponse.json(
        { error: "需要提供 id 或 clerkId" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: id ? { id: parseInt(id) } : { clerkId: clerkId! },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "获取用户信息失败" }, { status: 500 });
  }
}
