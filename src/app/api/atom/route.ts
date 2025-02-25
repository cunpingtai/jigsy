import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { AtomStatus } from "@prisma/client";

enum DistributionStrategy {
  SURROUNDING = "surrounding",
  CENTER_SCATTER = "centerScatter",
  SPREAD_OUT = "spreadOut",
}

// 创建原子
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      content,
      coverImage,
      userId,
      categoryId,
      groupId,
      status = AtomStatus.PUBLISHED,
      tags = [],
      // 拼图配置参数
      tilesX,
      tilesY,
      width,
      height,
      distributionStrategy = DistributionStrategy.SURROUNDING,
      seed,
      tabSize,
      jitter,
      lineColor,
      lineWidth,
      background,
    } = body;

    // 使用事务确保原子和配置同时创建
    const result = await prisma.$transaction(async (tx) => {
      // 1. 创建原子
      const atom = await tx.standardAtom.create({
        data: {
          title,
          content,
          coverImage,
          userId,
          categoryId,
          groupId,
          status,
          tags: {
            create: tags.map((tagId: number) => ({
              tag: {
                connect: { id: tagId },
              },
            })),
          },
        },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
          category: true,
          group: true,
        },
      });

      // 2. 创建字段配置
      const fieldConfigs = await tx.fieldConfig.createMany({
        data: [
          {
            userId,
            atomId: atom.id,
            recordId: 0, // 初始记录ID
            name: "tilesX",
            title: "横向切片数",
            value: String(tilesX),
            description: "拼图横向切片的数量",
          },
          {
            userId,
            atomId: atom.id,
            recordId: 0,
            name: "tilesY",
            title: "纵向切片数",
            value: String(tilesY),
            description: "拼图纵向切片的数量",
          },
          {
            userId,
            atomId: atom.id,
            recordId: 0,
            name: "width",
            title: "宽度",
            value: String(width),
            description: "拼图画布宽度",
          },
          {
            userId,
            atomId: atom.id,
            recordId: 0,
            name: "height",
            title: "高度",
            value: String(height),
            description: "拼图画布高度",
          },
          {
            userId,
            atomId: atom.id,
            recordId: 0,
            name: "distributionStrategy",
            title: "分布策略",
            value: distributionStrategy,
            description: "拼图块的分布策略",
          },
          {
            userId,
            atomId: atom.id,
            recordId: 0,
            name: "seed",
            title: "随机种子",
            value: String(seed),
            description: "生成拼图的随机种子",
          },
          {
            userId,
            atomId: atom.id,
            recordId: 0,
            name: "tabSize",
            title: "卡扣尺寸",
            value: String(tabSize),
            description: "拼图块之间卡扣的尺寸",
          },
          {
            userId,
            atomId: atom.id,
            recordId: 0,
            name: "jitter",
            title: "抖动程度",
            value: String(jitter),
            description: "拼图块分布的随机抖动程度",
          },
          {
            userId,
            atomId: atom.id,
            recordId: 0,
            name: "lineColor",
            title: "线条颜色",
            value: lineColor,
            description: "拼图块边框的颜色",
          },
          {
            userId,
            atomId: atom.id,
            recordId: 0,
            name: "lineWidth",
            title: "线条宽度",
            value: String(lineWidth),
            description: "拼图块边框的宽度",
          },
          {
            userId,
            atomId: atom.id,
            recordId: 0,
            name: "background",
            title: "背景颜色",
            value: background,
            description: "拼图背景颜色",
          },
        ],
      });

      // 3. 获取完整的原子信息（包含新创建的配置）
      const atomWithConfigs = await tx.standardAtom.findUnique({
        where: { id: atom.id },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
          category: true,
          group: true,
          fieldConfigs: true,
        },
      });

      return atomWithConfigs;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("创建原子失败:", error);
    return NextResponse.json({ error: "创建原子失败" }, { status: 500 });
  }
}

// 删除原子
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "需要提供原子 ID" }, { status: 400 });
    }

    // 使用事务确保原子和配置同时删除
    await prisma.$transaction(async (tx) => {
      // 1. 删除相关的 FieldConfig
      await tx.fieldConfig.deleteMany({
        where: { atomId: parseInt(id) },
      });

      // 2. 删除原子
      await tx.standardAtom.delete({
        where: { id: parseInt(id) },
      });
    });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除原子失败:", error);
    return NextResponse.json({ error: "删除原子失败" }, { status: 500 });
  }
}

// 更新原子
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      tags,
      // 拼图配置参数
      tilesX,
      tilesY,
      width,
      height,
      distributionStrategy,
      seed,
      tabSize,
      jitter,
      lineColor,
      lineWidth,
      background,
      ...restData
    } = body;

    if (!id) {
      return NextResponse.json({ error: "需要提供原子 ID" }, { status: 400 });
    }

    // 使用事务进行更新
    const result = await prisma.$transaction(async (tx) => {
      // 1. 更新原子基本信息
      const atom = await tx.standardAtom.update({
        where: { id: parseInt(id) },
        data: {
          ...restData,
          ...(tags && {
            tags: {
              deleteMany: {}, // 先删除所有现有标签
              create: tags.map((tagId: number) => ({
                tag: {
                  connect: { id: tagId },
                },
              })),
            },
          }),
        },
      });

      // 2. 更新配置字段
      const configUpdates = [
        { name: "tilesX", value: String(tilesX) },
        { name: "tilesY", value: String(tilesY) },
        { name: "width", value: String(width) },
        { name: "height", value: String(height) },
        { name: "distributionStrategy", value: distributionStrategy },
        { name: "seed", value: String(seed) },
        { name: "tabSize", value: String(tabSize) },
        { name: "jitter", value: String(jitter) },
        { name: "lineColor", value: lineColor },
        { name: "lineWidth", value: String(lineWidth) },
        { name: "background", value: background },
      ].filter((config) => config.value !== undefined);

      // 批量更新配置
      for (const config of configUpdates) {
        await tx.fieldConfig.updateMany({
          where: {
            atomId: atom.id,
            name: config.name,
          },
          data: {
            value: config.value,
          },
        });
      }

      // 3. 获取更新后的完整数据
      return await tx.standardAtom.findUnique({
        where: { id: parseInt(id) },
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
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("更新原子失败:", error);
    return NextResponse.json({ error: "更新原子失败" }, { status: 500 });
  }
}

// 获取原子
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const title = searchParams.get("title");

    if (!id && !title) {
      return NextResponse.json(
        { error: "需要提供 ID 或标题" },
        { status: 400 }
      );
    }

    const atom = await prisma.standardAtom.findFirst({
      where: id ? { id: parseInt(id) } : title ? { title } : {},
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        category: true,
        group: true,
        fieldConfigs: true, // 添加字段配置
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!atom) {
      return NextResponse.json({ error: "原子不存在" }, { status: 404 });
    }

    // 将 fieldConfigs 转换为更易用的格式
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
    console.error("获取原子失败:", error);
    return NextResponse.json({ error: "获取原子失败" }, { status: 500 });
  }
}

// const createAtom = await fetch("/api/atom", {
//   method: "POST",
//   body: JSON.stringify({
//     title: "测试拼图",
//     content: {
//       /* 拼图内容 */
//     },
//     coverImage: "https://example.com/image.jpg",
//     userId: 1,
//     categoryId: 1,
//     groupId: 1,
//     tags: [1, 2, 3],
//     // 拼图配置
//     tilesX: 3,
//     tilesY: 3,
//     width: 800,
//     height: 600,
//     distributionStrategy: "surrounding",
//     seed: 12345,
//     tabSize: 30,
//     jitter: 0.5,
//     lineColor: "#000000",
//     lineWidth: 2,
//     background: "#FFFFFF",
//   }),
// });

// 更新原子
// const updateAtom = await fetch('/api/atom', {
//   method: 'PUT',
//   body: JSON.stringify({
//     id: 1,
//     title: '新标题',
//     content: '新内容',
//     tags: [4, 5, 6],
//     // 更新配置
//     tilesX: 4,
//     tilesY: 4,
//     width: 1000,
//     // 其他配置字段保持不变
//   })
// });

// 删除原子
// const deleteAtom = await fetch('/api/atom?id=1', {
//   method: 'DELETE'
// });

// // 获取原子
// const getAtom = await fetch('/api/atom?id=1');
// // 返回数据包含格式化的配置：
// // {
// //   ...原子信息,
// //   fieldConfigs: [...原始配置数组],
// //   config: {
// //     tilesX: "4",
// //     tilesY: "4",
// //     width: "1000",
// //     ...其他配置
// //   }
// // }
