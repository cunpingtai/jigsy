import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { StandardAtomStatus, UserRole } from "@prisma/client";
import { getCurrentUser } from "../../../util";

export async function PATCH(
  req: Request,
  { params }: { params: { atomId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const atomId = parseInt(params.atomId);
    const body = await req.json();

    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "需要提供原子状态" }, { status: 400 });
    }

    // 验证状态值是否有效
    if (!Object.values(StandardAtomStatus).includes(status)) {
      return NextResponse.json({ error: "无效的状态值" }, { status: 400 });
    }

    const atom = await prisma.standardAtom.update({
      where: { id: atomId },
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
