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
    const recordIdInt = parseInt(recordId);
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

    // 使用事务处理所有数据库操作
    try {
      const result = await prisma.$transaction(async (tx) => {
        // 验证记录是否存在
        const existingRecord = await tx.userAtomRecord.findUnique({
          where: { id: recordIdInt },
          select: { id: true, userId: true, meta: true },
        });

        if (!existingRecord) {
          throw new Error("记录不存在");
        }

        if (existingRecord.userId !== userId) {
          // 验证用户权限
          throw new Error("无权更新此记录");
        }

        // 检查游戏状态
        try {
          if (existingRecord.meta) {
            const status =
              typeof existingRecord.meta === "string"
                ? JSON.parse(existingRecord.meta).status
                : typeof existingRecord.meta === "object"
                ? !Array.isArray(existingRecord.meta)
                  ? existingRecord.meta.status
                  : undefined
                : undefined;

            if (status === "COMPLETED") {
              return existingRecord;
            }
          }
        } catch (e: any) {
          if (e.message === "游戏已完成") {
            throw e;
          }
          // 忽略其他解析错误
        }

        // 更新记录
        const record = await tx.userAtomRecord.update({
          where: { id: recordIdInt },
          data: {
            meta: {
              ...meta,
              endTime: new Date().toISOString(),
            },
          },
        });

        // 处理游戏完成逻辑
        if (meta.status === "COMPLETED") {
          // 更新用户积分
          await tx.user.update({
            where: { id: userId },
            data: { points: { increment: 10 } }, // 假设完成游戏奖励10积分
          });

          // 记录积分历史
          await tx.pointsHistory.create({
            data: {
              userId,
              points: 10,
              type: "GAME_COMPLETED",
              description: "完成游戏奖励",
            },
          });
        }

        return record;
      });

      return NextResponse.json({
        record: result,
      });
    } catch (txError: any) {
      // 处理事务中的错误
      if (txError.message === "记录不存在") {
        return NextResponse.json({ error: txError.message }, { status: 404 });
      } else if (txError.message === "无权更新此记录") {
        return NextResponse.json({ error: txError.message }, { status: 403 });
      } else if (txError.message === "游戏已完成") {
        return NextResponse.json({ error: txError.message }, { status: 400 });
      }
      throw txError; // 重新抛出其他错误
    }
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
    const recordIdInt = parseInt(recordId);

    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 使用事务处理
    try {
      await prisma.$transaction(async (tx) => {
        // 验证记录是否存在
        const existingRecord = await tx.userAtomRecord.findUnique({
          where: { id: recordIdInt },
          select: { id: true, userId: true },
        });

        if (!existingRecord) {
          throw new Error("记录不存在");
        }

        // 验证用户权限
        if (existingRecord.userId !== userId) {
          throw new Error("无权删除此记录");
        }

        // 删除记录
        await tx.userAtomRecord.delete({
          where: { id: recordIdInt },
        });
      });

      return NextResponse.json({
        message: "游戏记录删除成功",
      });
    } catch (txError: any) {
      if (txError.message === "记录不存在") {
        return NextResponse.json({ error: txError.message }, { status: 404 });
      } else if (txError.message === "无权删除此记录") {
        return NextResponse.json({ error: txError.message }, { status: 403 });
      }
      throw txError;
    }
  } catch (error) {
    console.error("删除游戏记录失败:", error);
    return NextResponse.json({ error: "删除游戏记录失败" }, { status: 500 });
  }
}

// 获取游戏记录
export async function GET(
  req: Request,
  { params }: { params: Promise<{ recordId: string }> }
) {
  try {
    const { recordId } = await params;
    const recordIdInt = parseInt(recordId);

    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 验证记录是否存在
    const existingRecord = await prisma.userAtomRecord.findUnique({
      where: { id: recordIdInt },
      include: {
        atom: {
          select: {
            id: true,
            title: true,
            coverImage: true,
          },
        },
      },
    });

    if (!existingRecord) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    }

    // 验证用户权限（只能查看自己的记录）
    if (existingRecord.userId !== userId) {
      return NextResponse.json({ error: "无权查看此记录" }, { status: 403 });
    }

    return NextResponse.json({
      record: existingRecord,
    });
  } catch (error) {
    console.error("获取游戏记录失败:", error);
    return NextResponse.json({ error: "获取游戏记录失败" }, { status: 500 });
  }
}
