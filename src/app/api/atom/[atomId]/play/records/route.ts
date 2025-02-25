import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 获取用户的所有游戏记录
export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = params.userId;

    // 分页参数
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // 排序参数
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    // 筛选参数
    const status = searchParams.get("status"); // 可以筛选游戏状态
    const atomId = searchParams.get("atomId"); // 可以筛选特定原子

    // 验证用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // 构建查询条件
    const whereClause: any = {
      userId: parseInt(userId),
    };

    // 添加状态筛选
    if (status) {
      whereClause.meta = {
        path: ["status"],
        equals: status,
      };
    }

    // 添加原子筛选
    if (atomId) {
      whereClause.atomId = parseInt(atomId);
    }

    // 获取记录总数
    const total = await prisma.userAtomRecord.count({
      where: whereClause,
    });

    // 获取记录列表
    const records = await prisma.userAtomRecord.findMany({
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
    });

    return NextResponse.json({
      records,
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

// 开始游戏（创建记录）
// const startGame = await fetch('/api/atom/1/record', {
//   method: 'POST',
//   body: JSON.stringify({
//     userId: 1,
//     config: {
//       difficulty: 'EASY',
//       theme: 'CLASSIC',
//       pieces: 100
//     }
//   })
// });

// // 更新游戏进度
// const updateProgress = await fetch('/api/record/5', {
//   method: 'PUT',
//   body: JSON.stringify({
//     userId: 1,
//     meta: {
//       status: 'IN_PROGRESS',
//       startTime: '2023-06-01T10:00:00Z',
//       progress: 50,
//       timeSpent: 300, // 秒
//       config: {
//         difficulty: 'EASY',
//         theme: 'CLASSIC',
//         pieces: 100
//       }
//     }
//   })
// });

// // 完成游戏
// const completeGame = await fetch('/api/record/5', {
//   method: 'PUT',
//   body: JSON.stringify({
//     userId: 1,
//     meta: {
//       status: 'COMPLETED',
//       startTime: '2023-06-01T10:00:00Z',
//       endTime: '2023-06-01T11:00:00Z',
//       progress: 100,
//       timeSpent: 3600, // 秒
//       score: 850,
//       config: {
//         difficulty: 'EASY',
//         theme: 'CLASSIC',
//         pieces: 100
//       }
//     }
//   })
// });

// // 获取单个游戏记录
// const getRecord = await fetch('/api/record/5');

// // 获取用户在特定原子的所有记录
// const getUserAtomRecords = await fetch('/api/atom/1/record?userId=1');

// // 获取用户的所有游戏记录
// const getUserRecords = await fetch('/api/user/1/records?page=1&pageSize=10&status=COMPLETED');

// // 删除游戏记录
// const deleteRecord = await fetch('/api/record/5?userId=1', {
//   method: 'DELETE'
// });

/**
 * 现在有了原子（拼图），有了用户，有了分类，有了组，有了用户对原子的使用记录，有了标签，有了评论，可以满足的场景是用户创建拼图，创建分类，创建组，给拼图添加分类，添加组，给拼图点赞，收藏，添加评论，给评论点赞，可以满足显示分类，显示组，显示拼图列表，可以满足用户使用拼图
 */

/**
 * 还差帖子，用户可以创建帖子，添加帖子评论，给贴子点赞，显示帖子列表
 */
