import { PrismaClient } from "@prisma/client";
import { AIGeneratedStatus } from "@prisma/client";
import { get, post } from "@/services/server";
import dotenv from "dotenv";

dotenv.config();

import Replicate from "replicate";
import { createCloudflareService } from "@/services/cloudflareService";

// 初始化 Replicate 客户端
if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error("Missing REPLICATE_API_TOKEN environment variable");
}

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const prisma = new PrismaClient();

// 模型配置
const MODEL_CONFIG = {
  modelId: "minimax/image-01",
};

// 创建 Cloudflare 服务实例
const cloudflareService = createCloudflareService({
  get,
  post,
});

// 处理单个生成记录
async function processGenerationRecord(recordId: number) {
  await prisma.$transaction(async (tx) => {
    try {
      // 更新记录状态为进行中
      await tx.aIGeneratedRecord.update({
        where: { id: recordId },
        data: { status: AIGeneratedStatus.IN_PROGRESS },
      });

      // 获取该记录下所有英文内容需要生成的项目
      const item = await tx.aIGenerated.findFirst({
        where: {
          recordId: recordId,
          language: "en",
          status: AIGeneratedStatus.NOT_STARTED,
        },
      });

      if (!item) {
        throw new Error("未找到需要生成的项目");
      }

      try {
        // 更新项目状态为进行中
        await tx.aIGenerated.update({
          where: { id: item.id },
          data: { status: AIGeneratedStatus.IN_PROGRESS },
        });

        // 准备输入数据
        const processedInput = {
          prompt: item.content,
          aspect_ratio: "1:1",
          number_of_images: 1,
          prompt_optimizer: true,
        };

        // 创建预测任务
        const prediction = await replicate.predictions.create({
          model: MODEL_CONFIG.modelId,
          input: processedInput,
        });

        // 添加预测ID到记录中
        await tx.aIGeneratedRecord.update({
          where: { id: recordId },
          data: { predictionId: prediction.id },
        });
      } catch (error) {
        console.error(`处理项目 ${item.id} 失败:`, error);

        // 更新项目状态为失败
        await tx.aIGenerated.update({
          where: { id: item.id },
          data: { status: AIGeneratedStatus.FAILED },
        });
      }
    } catch (error) {
      console.error(`处理记录 ${recordId} 失败:`, error);

      // 更新记录状态为失败
      await tx.aIGeneratedRecord.update({
        where: { id: recordId },
        data: { status: AIGeneratedStatus.FAILED },
      });
    }
  });
}

// 检查预测状态的函数
async function checkPredictionStatus() {
  try {
    // 获取所有进行中的记录
    const inProgressRecords = await prisma.aIGeneratedRecord.findMany({
      where: {
        status: AIGeneratedStatus.IN_PROGRESS,
        predictionId: { not: undefined },
      },
      include: {
        aiGenerated: true,
      },
    });

    console.log(`找到 ${inProgressRecords.length} 条进行中的记录需要检查状态`);

    // 处理每条记录
    for (const record of inProgressRecords) {
      if (!record.predictionId) continue;

      try {
        // 获取预测结果
        const prediction = await replicate.predictions.get(record.predictionId);

        if (prediction.status === "succeeded") {
          // 预测成功，更新记录

          // 获取生成的图片URL
          const imageUrl = Array.isArray(prediction.output)
            ? prediction.output[0]
            : prediction.output;

          // 如果有图片URL，调用新的URL上传API - 在事务外执行
          let cloudflareImageUrl = "";
          if (imageUrl) {
            try {
              // 调用新的URL上传API
              const uploadResponse = await cloudflareService.uploadUrl(
                imageUrl,
                `ai-generated/${record.id}`
              );
              if (uploadResponse.success) {
                cloudflareImageUrl = uploadResponse.filePath;
                console.log(`图片上传成功: ${cloudflareImageUrl}`);
              }
            } catch (uploadError) {
              console.error(`上传图片失败:`, uploadError);

              // 更新记录状态
              await prisma.aIGeneratedRecord.update({
                where: { id: record.id },
                data: { status: AIGeneratedStatus.FAILED },
              });

              return;
            }
          }

          // 在获取到图片URL后，再开始事务
          await prisma.$transaction(
            async (tx) => {
              // 更新生成项状态
              if (record.aiGenerated.length > 0) {
                for (const item of record.aiGenerated) {
                  // 更新数据库中的图片URL
                  await tx.aIGenerated.update({
                    where: { id: item.id },
                    data: {
                      status: AIGeneratedStatus.COMPLETED,
                      image: cloudflareImageUrl || imageUrl, // 优先使用Cloudflare URL
                    },
                  });
                }
              }

              // 更新记录状态
              await tx.aIGeneratedRecord.update({
                where: { id: record.id },
                data: {
                  status: AIGeneratedStatus.COMPLETED,
                  // 只保存必要的信息，避免超出字段长度限制
                  result: JSON.stringify({
                    status: prediction.status,
                    output: prediction.output ? "已生成" : null,
                    error: prediction.error,
                  }),
                },
              });
            },
            {
              // 增加事务超时时间，默认是5秒
              timeout: 10000, // 10秒
            }
          );

          console.log(`记录 ${record.id} 预测完成`);
        } else if (
          prediction.status === "failed" ||
          prediction.status === "canceled"
        ) {
          // 预测失败，更新记录 - 这里不需要上传图片，可以直接在事务中处理
          await prisma.$transaction(
            async (tx) => {
              // 更新生成项状态
              if (record.aiGenerated.length > 0) {
                for (const item of record.aiGenerated) {
                  await tx.aIGenerated.update({
                    where: { id: item.id },
                    data: { status: AIGeneratedStatus.FAILED },
                  });
                }
              }

              // 更新记录状态
              await tx.aIGeneratedRecord.update({
                where: { id: record.id },
                data: {
                  status: AIGeneratedStatus.FAILED,
                  // 只保存必要的信息
                  result: JSON.stringify({
                    status: prediction.status,
                    error: prediction.error || "未知错误",
                  }),
                },
              });
            },
            {
              timeout: 10000, // 10秒
            }
          );

          console.log(
            `记录 ${record.id} 预测失败: ${prediction.error || "未知错误"}`
          );
        } else {
          // 预测仍在进行中
          console.log(
            `记录 ${record.id} 预测仍在进行中，状态: ${prediction.status}`
          );
        }
      } catch (error) {
        console.error(`检查记录 ${record.id} 预测状态失败:`, error);
      }
    }
  } catch (error) {
    console.error("检查预测状态失败:", error);
  }
}

// 新增：处理已完成的生成记录，创建原子
async function processCompletedGenerations() {
  try {
    // 获取所有已完成但未创建原子的记录
    const completedRecords = await prisma.aIGenerated.findMany({
      where: {
        status: AIGeneratedStatus.COMPLETED,
        atomId: null, // 尚未创建原子
      },
      take: 10, // 每次处理的最大记录数
    });

    console.log(`找到 ${completedRecords.length} 条已完成但未创建原子的记录`);

    // 处理每条记录
    for (const record of completedRecords) {
      try {
        // 解析分类ID、分组ID和标签ID
        const categoryId = parseInt(record.category);
        const groupId = parseInt(record.group);
        const tagIds = record.tags
          .split(",")
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id));

        // 默认用户ID
        const userId = record.userId;

        // 创建原子
        await prisma.$transaction(async (tx) => {
          // 创建标准原子
          const atom = await tx.standardAtom.create({
            data: {
              title: record.title,
              content: record.content,
              coverImage: record.image,
              language: record.language,
              userId: userId,
              categoryId: categoryId,
              groupId: groupId,
              status: "PUBLISHED", // 默认发布状态
            },
          });

          // 关联标签
          if (tagIds.length > 0) {
            const tagRelations = tagIds.map((tagId) => ({
              atomId: atom.id,
              tagId: tagId,
            }));

            await tx.tagsOnAtoms.createMany({
              data: tagRelations,
            });
          }

          const randomTileSize = Math.floor(Math.random() * 17) + 4;
          // 创建字段配置
          const fieldConfigsData = [
            {
              userId,
              atomId: atom.id,
              recordId: 0,
              name: "meta",
              title: "元数据",
              value: JSON.stringify({
                source: "ai-generated",
                recordId: record.recordId,
                generatedId: record.id,
              }),
              description: "原子的元数据",
            },
            {
              userId,
              atomId: atom.id,
              recordId: 0,
              name: "type",
              title: "类型",
              value: "image",
              description: "原子的类型",
            },
            {
              userId,
              atomId: atom.id,
              recordId: 0,
              name: "tilesX",
              title: "横向切片数",
              value: randomTileSize.toString(),
              description: "拼图横向切片的数量",
            },
            {
              userId,
              atomId: atom.id,
              recordId: 0,
              name: "tilesY",
              title: "纵向切片数",
              value: randomTileSize.toString(),
              description: "拼图纵向切片的数量",
            },
            {
              userId,
              atomId: atom.id,
              recordId: 0,
              name: "width",
              title: "宽度",
              value: "0",
              description: "拼图画布宽度",
            },
            {
              userId,
              atomId: atom.id,
              recordId: 0,
              name: "height",
              title: "高度",
              value: "0",
              description: "拼图画布高度",
            },
            {
              userId,
              atomId: atom.id,
              recordId: 0,
              name: "distributionStrategy",
              title: "分布策略",
              value: "surrounding",
              description: "拼图块的分布策略",
            },
            {
              userId,
              atomId: atom.id,
              recordId: 0,
              name: "seed",
              title: "随机种子",
              value: String(Math.floor(Math.random() * 1000)),
              description: "生成拼图的随机种子",
            },
            {
              userId,
              atomId: atom.id,
              recordId: 0,
              name: "tabSize",
              title: "卡扣尺寸",
              value: "20",
              description: "拼图块之间卡扣的尺寸",
            },
            {
              userId,
              atomId: atom.id,
              recordId: 0,
              name: "jitter",
              title: "抖动程度",
              value: Math.random().toFixed(2),
              description: "拼图块分布的随机抖动程度",
            },
            {
              userId,
              atomId: atom.id,
              recordId: 0,
              name: "lineColor",
              title: "线条颜色",
              value: "#ffffff",
              description: "拼图块边框的颜色",
            },
            {
              userId,
              atomId: atom.id,
              recordId: 0,
              name: "lineWidth",
              title: "线条宽度",
              value: "1",
              description: "拼图块边框的宽度",
            },
            {
              userId,
              atomId: atom.id,
              recordId: 0,
              name: "background",
              title: "背景颜色",
              value: "#FFFFFF",
              description: "拼图背景颜色",
            },
          ];

          await tx.fieldConfig.createMany({
            data: fieldConfigsData,
          });

          // 更新 AIGenerated 记录，添加原子ID
          await tx.aIGenerated.update({
            where: { id: record.id },
            data: { atomId: atom.id },
          });

          console.log(
            `成功为记录 ${record.id} 创建原子 ${atom.id} 及其字段配置`
          );
        });
      } catch (error) {
        console.error(`为记录 ${record.id} 创建原子失败:`, error);
      }
    }
  } catch (error) {
    console.error("处理已完成生成记录失败:", error);
  }
}

// 更新主调度函数，添加处理已完成记录的调用
export async function runAIGenerationScheduler() {
  try {
    // 先检查现有预测的状态
    await checkPredictionStatus();

    // 处理已完成但未创建原子的记录
    await processCompletedGenerations();

    // 获取所有未开始的记录
    const pendingRecords = await prisma.aIGeneratedRecord.findMany({
      where: { status: AIGeneratedStatus.NOT_STARTED },
      take: 5, // 每次处理的最大记录数
    });

    console.log(`找到 ${pendingRecords.length} 条待处理记录`);

    // 处理每条记录
    for (const record of pendingRecords) {
      await processGenerationRecord(record.id);
    }
  } catch (error) {
    console.error("AI生成调度器运行失败:", error);
  } finally {
    await prisma.$disconnect();
  }
}
