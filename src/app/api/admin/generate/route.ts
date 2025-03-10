import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, AIGeneratedStatus } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// 定义请求体验证模式
const generateSchema = z.object({
  data: z.array(
    z.object({
      title: z.string().min(1, "标题不能为空"),
      language: z.string().min(1, "语言不能为空"),
      content: z.string().min(1, "内容不能为空"),
      category: z.string().min(1, "分类不能为空"),
      categoryDescription: z.string().optional(),
      group: z.string().min(1, "分组不能为空"),
      groupDescription: z.string().optional(),
      tags: z.array(
        z.object({
          name: z.string().min(1, "标签不能为空"),
          description: z.string().optional(),
        })
      ),
      image: z.string().optional(),
    })
  ),
  userId: z.string().min(1, "用户ID不能为空"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证请求数据
    const validationResult = generateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "数据验证失败", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { data: datas, userId } = validationResult.data;

    const result = await prisma.$transaction(async (tx) => {
      // 创建生成记录
      const r = await tx.aIGeneratedRecord.create({
        data: {
          status: AIGeneratedStatus.NOT_STARTED,
          result: "",
          predictionId: "",
        },
      });
      for (const data of datas) {
        const {
          title,
          language,
          content,
          category: categoryName,
          group: groupName,
          tags,
          categoryDescription,
          groupDescription,
          image = "",
        } = data;

        // 处理分类
        let categoryId;
        const existingCategory = await tx.category.findFirst({
          where: { name: categoryName, language },
        });

        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          // 创建新分类
          const newCategory = await tx.category.create({
            data: {
              name: categoryName,
              description: categoryDescription,
              language,
            },
          });
          categoryId = newCategory.id;
        }

        // 处理分组
        let groupId;
        const existingGroup = await tx.group.findFirst({
          where: {
            name: groupName,
            categoryId: categoryId,
            language,
          },
        });

        if (existingGroup) {
          groupId = existingGroup.id;
        } else {
          // 创建新分组
          const newGroup = await tx.group.create({
            data: {
              name: groupName,
              description: groupDescription,
              categoryId: categoryId,
              language,
            },
          });
          groupId = newGroup.id;
        }

        // 优化标签处理 - 批量操作
        const tagIds = [];
        const tagNames = tags.map((tag) => tag.name);
        // 1. 批量查询已存在的标签
        const existingTags = await tx.tag.findMany({
          where: {
            name: { in: tagNames },
            language,
          },
        });

        // 2. 找出需要创建的新标签
        const existingTagNames = existingTags.map((tag) => tag.name);
        const tagsToCreate = tags.filter(
          (tag) => !existingTagNames.includes(tag.name)
        );

        // 3. 批量创建新标签
        if (tagsToCreate.length > 0) {
          const createdTags = await tx.tag.createMany({
            data: tagsToCreate.map((tag) => ({
              name: tag.name || "",
              description: tag.description || "",
              language,
            })),
            skipDuplicates: true, // 跳过重复项
          });

          // 4. 查询所有标签以获取ID (包括新创建的)
          const allTags = await tx.tag.findMany({
            where: {
              name: { in: tagNames },
              language,
            },
          });

          // 5. 收集所有标签ID
          tagIds.push(...allTags.map((tag) => tag.id));
        } else {
          // 如果没有新标签需要创建，直接使用现有标签
          tagIds.push(...existingTags.map((tag) => tag.id));
        }

        // 创建 AI 生成记录
        const record = await tx.aIGenerated.create({
          data: {
            userId,
            atomId: undefined,
            title,
            recordId: r.id,
            language,
            content,
            category: categoryId.toString(), // 保存原始分类名称
            group: groupId.toString(), // 保存原始分组名称
            tags: tagIds.join(","), // 保存原始标签字符串
            image,
            status: AIGeneratedStatus.NOT_STARTED,
          },
        });
      }

      return { recordId: r.id };
    });

    return NextResponse.json(
      {
        success: true,
        recordId: result.recordId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("保存 AI 生成内容失败:", error);
    return NextResponse.json(
      { error: "保存失败", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// 获取所有生成记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language");
    const status = searchParams.get("status");

    const filters: any = {};

    if (language) {
      filters.language = language;
    }

    if (status) {
      filters.status = status;
    }

    const records = await prisma.aIGenerated.findMany({
      where: filters,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        record: true, // 包含关联的记录信息
      },
    });

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error("获取 AI 生成内容失败:", error);
    return NextResponse.json(
      { error: "获取失败", details: (error as Error).message },
      { status: 500 }
    );
  }
}
