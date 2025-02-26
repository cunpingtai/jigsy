import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { AtomStatus } from "@prisma/client";
import { currentUserId } from "../../util";

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
    const title = searchParams.get("title");
    const categoryId = searchParams.get("categoryId");
    const groupId = searchParams.get("groupId");
    const tagId = searchParams.get("tagId");
    const status = searchParams.get("status") as AtomStatus | null;

    // 构建查询条件
    const where: any = {
      userId,
    };

    if (title) {
      where.title = {
        contains: title,
      };
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    if (groupId) {
      where.groupId = parseInt(groupId);
    }

    if (tagId) {
      where.tags = {
        some: {
          tagId: parseInt(tagId),
        },
      };
    }

    if (status) {
      where.status = status;
    }

    // 计算总数
    const total = await prisma.standardAtom.count({ where });

    // 查询数据
    const atoms = await prisma.standardAtom.findMany({
      where,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        category: true,
        group: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 为每个原子添加配置信息
    const atomsWithConfig = await Promise.all(
      atoms.map(async (atom) => {
        const fieldConfigs = await prisma.fieldConfig.findMany({
          where: { atomId: atom.id },
        });

        const config = fieldConfigs.reduce(
          (acc, field) => ({
            ...acc,
            [field.name]: field.value,
          }),
          {}
        );

        return {
          ...atom,
          config,
        };
      })
    );

    // 返回结果
    return NextResponse.json({
      data: atomsWithConfig,
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
