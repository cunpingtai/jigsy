import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { StandardAtomStatus } from "@prisma/client";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "需要提供原子 ID 和状态" },
        { status: 400 }
      );
    }

    // 验证状态值是否有效
    if (!Object.values(StandardAtomStatus).includes(status)) {
      return NextResponse.json({ error: "无效的状态值" }, { status: 400 });
    }

    const atom = await prisma.standardAtom.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        category: true,
        group: true,
        fieldConfigs: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // 格式化配置字段
    const formattedAtom = {
      ...atom,
      config: atom.fieldConfigs.reduce(
        (acc, field) => ({
          ...acc,
          [field.name]: field.value,
        }),
        {}
      ),
    };

    return NextResponse.json(formattedAtom);
  } catch (error) {
    console.error("更新原子状态失败:", error);
    return NextResponse.json({ error: "更新原子状态失败" }, { status: 500 });
  }
}

// 更新原子状态
// const updateStatus = await fetch('/api/atom/status', {
//   method: 'PATCH',
//   body: JSON.stringify({
//     id: 1,
//     status: 'PUBLISHED' // 或 'DRAFT' 或 'DELETED'
//   })
// });
