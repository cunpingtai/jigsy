import { currentUserId } from "@/app/api/util";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 获取用户的所有游戏记录
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 分页参数
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // 排序参数
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    // 筛选参数
    const status = searchParams.get("status"); // 可以筛选游戏状态
    const atomId = searchParams.get("atomId"); // 可以筛选特定原子

    // 构建查询条件
    const whereClause: any = {
      userId,
    };

    // 添加状态筛选
    if (status) {
      whereClause.meta = {
        path: ["status"],
        equals: status,
      };
    }

    // 添加原子筛选
    if (atomId) {
      whereClause.atomId = parseInt(atomId);
    }

    // 获取记录总数
    const total = await prisma.userAtomRecord.count({
      where: whereClause,
    });

    // 获取记录列表
    const records = await prisma.userAtomRecord.findMany({
      where: whereClause,
      include: {
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
      orderBy: {
        [sortBy]: order,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return NextResponse.json({
      data: records,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("获取用户游戏记录失败:", error);
    return NextResponse.json(
      { error: "获取用户游戏记录失败" },
      { status: 500 }
    );
  }
}
