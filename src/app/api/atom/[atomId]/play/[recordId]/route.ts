import { currentUserId } from "@/app/api/util";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 更新游戏记录（游戏进行中或结束）
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ recordId: string }> }
) {
  try {
    const { recordId } = await params;
    const body = await req.json();

    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { meta } = body;

    // 验证必要参数
    if (!meta) {
      return NextResponse.json({ error: "元数据是必需的" }, { status: 400 });
    }

    // 验证记录是否存在
    const existingRecord = await prisma.userAtomRecord.findUnique({
      where: { id: parseInt(recordId) },
      select: { id: true, userId: true },
    });

    if (!existingRecord) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    }

    // 验证用户权限
    if (userId && existingRecord.userId !== userId) {
      return NextResponse.json({ error: "无权更新此记录" }, { status: 403 });
    }

    // 更新记录
    const record = await prisma.userAtomRecord.update({
      where: { id: parseInt(recordId) },
      data: {
        meta: {
          ...meta,
          status: "COMPLETED",
          endTime: new Date().toISOString(),
        },
      },
    });

    // 可以在这里添加积分奖励、成就解锁等逻辑
    // 例如：更新用户积分
    await prisma.user.update({
      where: { id: userId },
      data: { points: { increment: 10 } }, // 假设完成游戏奖励10积分
    });

    // 记录积分历史
    await prisma.pointsHistory.create({
      data: {
        userId,
        points: 10,
        type: "GAME_COMPLETED",
        description: "完成游戏奖励",
      },
    });

    return NextResponse.json({
      message: "游戏记录更新成功",
      record,
    });
  } catch (error) {
    console.error("更新游戏记录失败:", error);
    return NextResponse.json({ error: "更新游戏记录失败" }, { status: 500 });
  }
}

// 删除游戏记录
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ recordId: string }> }
) {
  try {
    const { recordId } = await params;
    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 验证记录是否存在
    const existingRecord = await prisma.userAtomRecord.findUnique({
      where: { id: parseInt(recordId) },
      select: { id: true, userId: true },
    });

    if (!existingRecord) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    }

    // 验证用户权限
    if (userId && existingRecord.userId !== userId) {
      return NextResponse.json({ error: "无权删除此记录" }, { status: 403 });
    }

    // 删除记录
    await prisma.userAtomRecord.delete({
      where: { id: parseInt(recordId) },
    });

    return NextResponse.json({
      message: "游戏记录删除成功",
    });
  } catch (error) {
    console.error("删除游戏记录失败:", error);
    return NextResponse.json({ error: "删除游戏记录失败" }, { status: 500 });
  }
}
