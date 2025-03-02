import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { currentUserId, getCurrentUser } from "../../util";
import { currentUser } from "@clerk/nextjs/server";

// 删除原子
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ atomId: string }> }
) {
  try {
    const { atomId } = await params;

    // 使用事务确保原子和配置同时删除
    await prisma.$transaction(async (tx) => {
      // 1. 删除相关的 FieldConfig
      await tx.fieldConfig.deleteMany({
        where: { atomId: parseInt(atomId) },
      });

      // 2. 删除原子
      await tx.standardAtom.delete({
        where: { id: parseInt(atomId) },
      });

      // 3. 删除原子标签
      await tx.tagsOnAtoms.deleteMany({
        where: { atomId: parseInt(atomId) },
      });

      // 4. 删除原子点赞
      await tx.atomLike.deleteMany({
        where: { standardAtomId: parseInt(atomId) },
      });

      // 5. 删除原子收藏
      await tx.favorite.deleteMany({
        where: { atomId: parseInt(atomId) },
      });

      // 6. 删除原子评论
      await tx.atomComment.deleteMany({
        where: { standardAtomId: parseInt(atomId) },
      });

      // 7. 删除原子挑战
      await tx.challenge.deleteMany({
        where: { atomId: parseInt(atomId) },
      });

      // 8. 删除原子精选
      await tx.atomFeatured.deleteMany({
        where: { atomId: parseInt(atomId) },
      });
    });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除原子失败:", error);
    return NextResponse.json({ error: "删除原子失败" }, { status: 500 });
  }
}

// 更新原子
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ atomId: string }> }
) {
  try {
    const { atomId } = await params;
    const body = await req.json();
    const {
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
      type,
      meta,
      ...restData
    } = body;

    // 使用事务进行更新
    const result = await prisma.$transaction(async (tx) => {
      // 1. 更新原子基本信息
      const atom = await tx.standardAtom.update({
        where: { id: parseInt(atomId) },
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
        { name: "meta", value: meta },
        { name: "type", value: type },
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
        where: { id: parseInt(atomId) },
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
export async function GET(
  req: Request,
  { params }: { params: Promise<{ atomId: string }> }
) {
  try {
    const { atomId } = await params;

    // 需要获取当前用户的点赞和收藏状态
    const userId = await currentUserId();
    let isLiked: boolean | null = null;
    let isFavorited: boolean | null = null;

    if (userId) {
      isLiked = (await prisma.atomLike.findFirst({
        where: {
          userId: userId,
          standardAtomId: parseInt(atomId),
        },
      }))
        ? true
        : false;

      isFavorited = (await prisma.favorite.findFirst({
        where: {
          userId: userId,
          atomId: parseInt(atomId),
        },
      }))
        ? true
        : false;
    }

    const atom = await prisma.standardAtom.findFirst({
      where: { id: parseInt(atomId) },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            likes: true,
            favorites: true,
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
      isLiked: !!isLiked,
      isFavorited: !!isFavorited,
      likesCount: atom._count.likes,
      favoritesCount: atom._count.favorites,
      tags: atom.tags?.map((tag) => tag.tag),
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
