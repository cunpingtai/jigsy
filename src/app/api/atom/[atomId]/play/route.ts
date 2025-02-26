import { currentUserId } from "@/app/api/util";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 创建游戏记录（开始游戏）
export async function POST(
  req: Request,
  { params }: { params: { atomId: string } }
) {
  try {
    const body = await req.json();
    const { meta } = body;
    const atomId = params.atomId;

    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 验证原子是否存在
    const atom = await prisma.standardAtom.findUnique({
      where: { id: parseInt(atomId) },
      select: { id: true },
    });

    if (!atom) {
      return NextResponse.json({ error: "原子不存在" }, { status: 404 });
    }

    // 使用事务同时创建游戏记录和更新原子查看次数
    const [record] = await prisma.$transaction([
      prisma.userAtomRecord.create({
        data: {
          userId,
          atomId: parseInt(atomId),
          meta: {
            status: "STARTED",
            startTime: new Date().toISOString(),
            config: body.config || {},
            progress: 0,
          },
        },
      }),
      prisma.standardAtom.update({
        where: { id: parseInt(atomId) },
        data: { viewCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({
      message: "游戏记录创建成功",
      record,
    });
  } catch (error) {
    console.error("创建游戏记录失败:", error);
    return NextResponse.json({ error: "创建游戏记录失败" }, { status: 500 });
  }
}
