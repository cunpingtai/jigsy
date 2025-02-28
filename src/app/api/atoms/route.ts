import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { AtomStatus } from "@prisma/client";

// 获取所有原子
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

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
    const featured = searchParams.get("featured");

    // 构建查询条件
    const where: any = {};

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

    if (featured === "true") {
      where.featured = {
        some: {
          status: true,
        },
      };
    } else if (featured === "false") {
      where.featured = {
        none: {
          status: true,
        },
      };
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
        featured: true,
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
          isFeatured: atom.featured,
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
