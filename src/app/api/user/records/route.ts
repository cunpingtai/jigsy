import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { AtomStatus } from "@prisma/client";
import { currentUserId } from "@/app/api/util";

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
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // 查询过滤参数

    // 构建查询条件
    const where: any = {
      userId,
    };

    // 计算总数
    const total = await prisma.userAtomRecord.count({ where });

    // 查询数据
    const records = await prisma.userAtomRecord.findMany({
      where,
      include: {
        atom: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 返回结果
    return NextResponse.json({
      data: records,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("获取原子列表失败:", error);
    return NextResponse.json({ error: "获取原子列表失败" }, { status: 500 });
  }
}

// 使用示例:
// 基础查询: GET /api/atom/list
// 分页: GET /api/atom/list?page=2&pageSize=20
// 排序: GET /api/atom/list?sortBy=title&sortOrder=asc
// 过滤: GET /api/atom/list?title=测试&categoryId=1&status=PUBLISHED
// 组合: GET /api/atom/list?page=1&pageSize=10&sortBy=createdAt&sortOrder=desc&userId=1
