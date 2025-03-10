import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { AtomStatus } from "@prisma/client";

// 获取所有原子
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    console.log("searchParams", searchParams);

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
    const status = searchParams.get("status") || "PUBLISHED";
    const featured = searchParams.get("featured");
    const language = searchParams.get("language") || "";

    // 构建查询条件
    const where: any = {};

    if (title) {
      where.title = {
        contains: title,
      };
    }

    if (language) {
      where.language = language;
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

    if (status && status !== "ALL") {
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

    console.log("where", where);

    // 计算总数
    const total = await prisma.standardAtom.count({ where });
    console.log("total", total);
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

    // 单独查询字段配置
    const atomIds = atoms.map((atom) => atom.id);
    const fieldConfigs =
      atomIds.length > 0
        ? await prisma.fieldConfig.findMany({
            where: {
              atomId: {
                in: atomIds,
              },
            },
          })
        : [];

    // 处理数据格式
    const atomsWithConfig = atoms.map((atom) => {
      // 过滤出当前原子的字段配置
      const atomFieldConfigs = fieldConfigs.filter(
        (config) => config.atomId === atom.id
      );

      // 将字段配置转换为对象格式
      const config = atomFieldConfigs.reduce(
        (acc, field) => ({
          ...acc,
          [field.name]: field.value,
        }),
        {}
      );

      // 处理特殊字段
      const isFeatured =
        atom.featured &&
        Array.isArray(atom.featured) &&
        atom.featured.length > 0 &&
        atom.featured.some((f) => f && f.status === true);

      // 创建一个新对象而不是修改原对象
      return {
        ...atom,
        config,
        isFeatured: isFeatured || false,
        featured: undefined, // 移除不需要的嵌套数据
      };
    });

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
