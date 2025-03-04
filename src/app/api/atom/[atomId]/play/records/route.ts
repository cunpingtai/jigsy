import { currentUserId } from "@/app/api/util";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 获取用户的所有游戏记录
export async function GET(
  req: Request,
  { params }: { params: Promise<{ atomId: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const { atomId } = await params;
    const atomIdInt = atomId ? parseInt(atomId) : undefined;

    const userId = await currentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 分页参数
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // 验证分页参数
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json({ error: "无效的分页参数" }, { status: 400 });
    }

    // 排序参数
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    // 验证排序参数
    const validSortFields = ["createdAt", "updatedAt", "id"];
    if (!validSortFields.includes(sortBy)) {
      return NextResponse.json({ error: "无效的排序字段" }, { status: 400 });
    }

    // 筛选参数
    const status = searchParams.get("status"); // 可以筛选游戏状态

    // 构建查询条件
    const whereClause: any = {
      userId,
    };

    // 添加原子筛选
    if (atomIdInt) {
      whereClause.atomId = atomIdInt;
    }

    // 添加状态筛选
    if (status) {
      whereClause.meta = {
        path: ["status"],
        equals: status,
      };
    }

    // 使用 Promise.all 并行执行两个查询
    const [total, records] = await Promise.all([
      // 获取记录总数
      prisma.userAtomRecord.count({
        where: whereClause,
      }),

      // 获取记录列表
      prisma.userAtomRecord.findMany({
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
      }),
    ]);

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
