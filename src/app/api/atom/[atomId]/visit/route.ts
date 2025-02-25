import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "需要提供原子 ID" }, { status: 400 });
    }

    // 使用事务确保原子存在且更新计数准确
    const atom = await prisma.$transaction(async (tx) => {
      // 1. 检查原子是否存在
      const existingAtom = await tx.standardAtom.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingAtom) {
        throw new Error("原子不存在");
      }

      // 2. 更新访问次数
      return await tx.standardAtom.update({
        where: { id: parseInt(id) },
        data: {
          viewCount: {
            increment: 1,
          },
        },
        select: {
          id: true,
          title: true,
          viewCount: true,
        },
      });
    });

    return NextResponse.json(atom);
  } catch (error) {
    console.error("更新访问次数失败:", error);
    if (error instanceof Error && error.message === "原子不存在") {
      return NextResponse.json({ error: "原子不存在" }, { status: 404 });
    }
    return NextResponse.json({ error: "更新访问次数失败" }, { status: 500 });
  }
}

// 获取访问统计
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "需要提供原子 ID" }, { status: 400 });
    }

    const atom = await prisma.standardAtom.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        title: true,
        viewCount: true,
      },
    });

    if (!atom) {
      return NextResponse.json({ error: "原子不存在" }, { status: 404 });
    }

    return NextResponse.json(atom);
  } catch (error) {
    console.error("获取访问统计失败:", error);
    return NextResponse.json({ error: "获取访问统计失败" }, { status: 500 });
  }
}

// 记录访问
// const recordView = await fetch('/api/atom/view', {
//   method: 'POST',
//   body: JSON.stringify({
//     id: 1
//   })
// });

// // 获取访问统计
// const getViews = await fetch('/api/atom/view?id=1');
// // 返回格式：
// // {
// //   id: 1,
// //   title: "原子标题",
// //   viewCount: 100
// // }
