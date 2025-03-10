import { NextResponse } from "next/server";
import { startScheduler } from "@/lib/scheduler";
import { AICronStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// 全局变量，确保调度器只启动一次
let schedulerStarted = false;
let stopScheduler: (() => void) | null = null;

// 获取或创建 AICron 记录
async function getOrCreateCronRecord() {
  // 查找第一条记录
  let cronRecord = await prisma.aICron.findFirst();

  // 如果不存在，则创建一条
  if (!cronRecord) {
    cronRecord = await prisma.aICron.create({
      data: {
        status: AICronStatus.STOP,
      },
    });
  }

  return cronRecord;
}

export async function GET() {
  try {
    // 获取 AICron 记录
    const cronRecord = await getOrCreateCronRecord();

    // 根据数据库状态控制调度器
    if (cronRecord.status === AICronStatus.START && !schedulerStarted) {
      // 数据库状态为启动，但调度器未运行，则启动调度器
      stopScheduler = startScheduler();
      schedulerStarted = true;
      return NextResponse.json({ success: true, message: "调度器已启动" });
    } else if (cronRecord.status === AICronStatus.STOP && schedulerStarted) {
      // 数据库状态为停止，但调度器在运行，则停止调度器
      if (stopScheduler) {
        stopScheduler();
        schedulerStarted = false;
      }
      return NextResponse.json({ success: true, message: "调度器已停止" });
    } else if (cronRecord.status === AICronStatus.START && schedulerStarted) {
      // 数据库状态和调度器状态一致（都是启动）
      return NextResponse.json({ success: true, message: "调度器已在运行中" });
    } else {
      // 数据库状态和调度器状态一致（都是停止）
      return NextResponse.json({ success: true, message: "调度器未运行" });
    }
  } catch (error) {
    console.error("获取调度器状态失败:", error);
    return NextResponse.json(
      { success: false, message: "获取调度器状态失败" },
      { status: 500 }
    );
  }
}

// 启动调度器
export async function POST() {
  try {
    // 获取 AICron 记录
    const cronRecord = await getOrCreateCronRecord();

    // 更新数据库状态为启动
    await prisma.aICron.update({
      where: { id: cronRecord.id },
      data: { status: AICronStatus.START },
    });

    // 如果调度器未运行，则启动
    if (!schedulerStarted) {
      stopScheduler = startScheduler();
      schedulerStarted = true;
    }

    return NextResponse.json({ success: true, message: "调度器已启动" });
  } catch (error) {
    console.error("启动调度器失败:", error);
    return NextResponse.json(
      { success: false, message: "启动调度器失败" },
      { status: 500 }
    );
  }
}

// 停止调度器
export async function DELETE() {
  try {
    // 获取 AICron 记录
    const cronRecord = await getOrCreateCronRecord();

    // 更新数据库状态为停止
    await prisma.aICron.update({
      where: { id: cronRecord.id },
      data: { status: AICronStatus.STOP },
    });

    // 如果调度器在运行，则停止
    if (schedulerStarted && stopScheduler) {
      stopScheduler();
      schedulerStarted = false;
    }

    return NextResponse.json({ success: true, message: "调度器已停止" });
  } catch (error) {
    console.error("停止调度器失败:", error);
    return NextResponse.json(
      { success: false, message: "停止调度器失败" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
