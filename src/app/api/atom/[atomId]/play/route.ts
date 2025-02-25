import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 创建游戏记录（开始游戏）
export async function POST(
  req: Request,
  { params }: { params: { atomId: string } }
) {
  try {
    const body = await req.json();
    const { userId, meta } = body;
    const atomId = params.atomId;

    // 验证必要参数
    if (!userId) {
      return NextResponse.json({ error: "用户ID是必需的" }, { status: 400 });
    }

    // 验证原子是否存在
    const atom = await prisma.standardAtom.findUnique({
      where: { id: parseInt(atomId) },
      select: { id: true },
    });

    if (!atom) {
      return NextResponse.json({ error: "原子不存在" }, { status: 404 });
    }

    // 验证用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // 创建游戏记录
    const record = await prisma.userAtomRecord.create({
      data: {
        userId: parseInt(userId),
        atomId: parseInt(atomId),
        meta: meta || {
          status: "STARTED",
          startTime: new Date().toISOString(),
          config: body.config || {},
          progress: 0,
        },
      },
    });

    // 更新原子的查看次数
    await prisma.standardAtom.update({
      where: { id: parseInt(atomId) },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({
      message: "游戏记录创建成功",
      record,
    });
  } catch (error) {
    console.error("创建游戏记录失败:", error);
    return NextResponse.json({ error: "创建游戏记录失败" }, { status: 500 });
  }
}

// 获取用户的游戏记录
export async function GET(
  req: Request,
  { params }: { params: { atomId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const atomId = params.atomId;
    const recordId = searchParams.get("recordId");

    // 如果提供了记录ID，则获取单个记录
    if (recordId) {
      const record = await prisma.userAtomRecord.findUnique({
        where: { id: parseInt(recordId) },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          atom: {
            select: {
              id: true,
              title: true,
              coverImage: true,
            },
          },
        },
      });

      if (!record) {
        return NextResponse.json({ error: "记录不存在" }, { status: 404 });
      }

      return NextResponse.json(record);
    }

    // 如果提供了用户ID，则获取该用户的所有记录
    if (userId) {
      const records = await prisma.userAtomRecord.findMany({
        where: {
          userId: parseInt(userId),
          atomId: parseInt(atomId),
        },
        orderBy: {
          createdAt: "desc",
        },
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

      return NextResponse.json(records);
    }

    // 否则获取该原子的所有记录
    const records = await prisma.userAtomRecord.findMany({
      where: {
        atomId: parseInt(atomId),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("获取游戏记录失败:", error);
    return NextResponse.json({ error: "获取游戏记录失败" }, { status: 500 });
  }
}

// 更新游戏记录（游戏进行中或结束）
export async function PUT(
  req: Request,
  { params }: { params: { recordId: string } }
) {
  try {
    const body = await req.json();
    const { meta, userId } = body;
    const recordId = params.recordId;

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
    if (userId && existingRecord.userId !== parseInt(userId)) {
      return NextResponse.json({ error: "无权更新此记录" }, { status: 403 });
    }

    // 更新记录
    const record = await prisma.userAtomRecord.update({
      where: { id: parseInt(recordId) },
      data: { meta },
    });

    // 如果游戏结束，可以在这里处理额外逻辑
    if (meta.status === "COMPLETED") {
      // 可以在这里添加积分奖励、成就解锁等逻辑
      // 例如：更新用户积分
      if (userId) {
        await prisma.user.update({
          where: { id: parseInt(userId) },
          data: { points: { increment: 10 } }, // 假设完成游戏奖励10积分
        });

        // 记录积分历史
        await prisma.pointsHistory.create({
          data: {
            userId: parseInt(userId),
            points: 10,
            type: "GAME_COMPLETED",
            description: "完成游戏奖励",
          },
        });
      }
    }

    return NextResponse.json({
      message: "游戏记录更新成功",
      record,
    });
  } catch (error) {
    console.error("更新游戏记录失败:", error);
    return NextResponse.json({ error: "更新游戏记录失败" }, { status: 500 });
  }
}

// 获取单个游戏记录
export async function GET_SINGLE(
  req: Request,
  { params }: { params: { recordId: string } }
) {
  try {
    const recordId = params.recordId;

    const record = await prisma.userAtomRecord.findUnique({
      where: { id: parseInt(recordId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        atom: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            group: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!record) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error("获取游戏记录失败:", error);
    return NextResponse.json({ error: "获取游戏记录失败" }, { status: 500 });
  }
}

// 删除游戏记录
export async function DELETE(
  req: Request,
  { params }: { params: { recordId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const recordId = params.recordId;

    // 验证记录是否存在
    const existingRecord = await prisma.userAtomRecord.findUnique({
      where: { id: parseInt(recordId) },
      select: { id: true, userId: true },
    });

    if (!existingRecord) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    }

    // 验证用户权限
    if (userId && existingRecord.userId !== parseInt(userId)) {
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
