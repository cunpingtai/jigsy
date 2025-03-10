import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { AtomStatus } from "@prisma/client";
import { currentUserId } from "../util";

enum DistributionStrategy {
  SURROUNDING = "surrounding",
  CENTER_SCATTER = "centerScatter",
  SPREAD_OUT = "spreadOut",
}

// 创建原子
export async function POST(req: Request) {
  const userId = await currentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let defaultStatus: AtomStatus = AtomStatus.DRAFT;
  if (process.env.DEFAULT_JIGSAW_PUZZLE_PUBLISHSTATUS === "true") {
    defaultStatus = AtomStatus.PUBLISHED;
  }

  try {
    const body = await req.json();
    const {
      title,
      content,
      coverImage,
      categoryId,
      groupId,
      tags = [],
      language = "en",
      // 拼图配置参数
      tilesX,
      tilesY,
      width = 0,
      height = 0,
      distributionStrategy = DistributionStrategy.SURROUNDING,
      seed = 99,
      tabSize = 25,
      jitter = 52,
      lineColor = "#000000",
      lineWidth = 1,
      background = "#FFFFFF",
      type = "image",
      meta,
    } = body;

    // 使用事务确保原子和配置同时创建
    const result = await prisma.$transaction(async (tx) => {
      // 1. 创建原子
      const atom = await tx.standardAtom.create({
        data: {
          title,
          content,
          coverImage,
          language,
          userId,
          categoryId,
          groupId,
          status: defaultStatus,
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

      // 关联标签 - 确保 tags 是有效数组且每个元素都是有效的 tagId
      if (Array.isArray(tags) && tags.length > 0) {
        await tx.tagsOnAtoms.createMany({
          data: tags.map((tagId: number) => ({
            atomId: atom.id,
            tagId: typeof tagId === "number" ? tagId : parseInt(tagId),
          })),
        });
      }

      // 2. 创建字段配置 - 确保所有值都被正确转换为字符串
      const fieldConfigsData = [
        {
          userId,
          atomId: atom.id,
          recordId: 0,
          name: "meta",
          title: "元数据",
          value: meta,
          description: "原子的元数据",
        },
        {
          userId,
          atomId: atom.id,
          recordId: 0,
          name: "type",
          title: "类型",
          value: String(type || "image"),
          description: "原子的类型",
        },
        {
          userId,
          atomId: atom.id,
          recordId: 0,
          name: "tilesX",
          title: "横向切片数",
          value: String(tilesX || 0),
          description: "拼图横向切片的数量",
        },
        {
          userId,
          atomId: atom.id,
          recordId: 0,
          name: "tilesY",
          title: "纵向切片数",
          value: String(tilesY || 0),
          description: "拼图纵向切片的数量",
        },
        {
          userId,
          atomId: atom.id,
          recordId: 0,
          name: "width",
          title: "宽度",
          value: String(width || 0),
          description: "拼图画布宽度",
        },
        {
          userId,
          atomId: atom.id,
          recordId: 0,
          name: "height",
          title: "高度",
          value: String(height || 0),
          description: "拼图画布高度",
        },
        {
          userId,
          atomId: atom.id,
          recordId: 0,
          name: "distributionStrategy",
          title: "分布策略",
          value: String(distributionStrategy || "surrounding"),
          description: "拼图块的分布策略",
        },
        {
          userId,
          atomId: atom.id,
          recordId: 0,
          name: "seed",
          title: "随机种子",
          value: String(seed || 0),
          description: "生成拼图的随机种子",
        },
        {
          userId,
          atomId: atom.id,
          recordId: 0,
          name: "tabSize",
          title: "卡扣尺寸",
          value: String(tabSize || 0),
          description: "拼图块之间卡扣的尺寸",
        },
        {
          userId,
          atomId: atom.id,
          recordId: 0,
          name: "jitter",
          title: "抖动程度",
          value: String(jitter || 0),
          description: "拼图块分布的随机抖动程度",
        },
        {
          userId,
          atomId: atom.id,
          recordId: 0,
          name: "lineColor",
          title: "线条颜色",
          value: String(lineColor || "#000000"),
          description: "拼图块边框的颜色",
        },
        {
          userId,
          atomId: atom.id,
          recordId: 0,
          name: "lineWidth",
          title: "线条宽度",
          value: String(lineWidth || 0),
          description: "拼图块边框的宽度",
        },
        {
          userId,
          atomId: atom.id,
          recordId: 0,
          name: "background",
          title: "背景颜色",
          value: String(background || "#FFFFFF"),
          description: "拼图背景颜色",
        },
      ];

      await tx.fieldConfig.createMany({
        data: fieldConfigsData,
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
    return NextResponse.json(
      { error: "创建原子失败", details: String(error) },
      { status: 500 }
    );
  }
}

// 获取原子
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");

    if (!title) {
      return NextResponse.json({ error: "需要提供标题" }, { status: 400 });
    }

    const atom = await prisma.standardAtom.findFirst({
      where: { title },
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
