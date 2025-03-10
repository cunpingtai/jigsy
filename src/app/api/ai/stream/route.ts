import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getCurrentUser } from "../../util";

// 创建 SSE 响应
function createSSEResponse(data: string, event?: string): string {
  let message = "";

  if (event) {
    message += `event: ${event}\n`;
  }

  message += `data: ${data}\n\n`;
  return message;
}

export async function POST(request: NextRequest) {
  const { text } = await request.json();

  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "用户未登录" }, { status: 401 });
  }

  if (!text) {
    return new Response(
      createSSEResponse(JSON.stringify({ error: "缺少文本参数" }), "error"),
      {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      }
    );
  }

  // 创建响应流
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 创建 OpenAI 客户端
        const client = new OpenAI({
          apiKey: process.env.DEEPSEEK_API_KEY,
          baseURL: "https://api.deepseek.com",
        });

        // 发送流式请求到 DeepSeek API
        const completion = await client.chat.completions.create({
          model: "deepseek-chat",
          messages: [
            // { role: "system", content: systemPrompt },
            { role: "user", content: text },
          ],
          stream: true, // 启用流式输出
        });

        let accumulatedAnswer = ""; // 累积的回答内容

        // 处理流式响应
        for await (const chunk of completion) {
          // 获取当前块的内容
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            // 累积回答内容
            accumulatedAnswer += content;

            // 创建当前状态的响应对象
            const responseData = {
              question: text,
              answer: accumulatedAnswer,
            };

            // 发送消息事件
            controller.enqueue(
              encoder.encode(
                createSSEResponse(JSON.stringify(responseData), "message")
              )
            );
          }
        }

        // 发送完成事件，包含完整的回答
        const finalResponse = {
          question: text,
          answer: accumulatedAnswer,
        };
        controller.enqueue(
          encoder.encode(
            createSSEResponse(JSON.stringify(finalResponse), "complete")
          )
        );

        // 关闭流
        controller.close();
      } catch (error) {
        console.error("AI 处理错误:", error);
        controller.enqueue(
          encoder.encode(
            createSSEResponse(
              JSON.stringify({ error: "处理请求时出错" }),
              "error"
            )
          )
        );
        controller.close();
      }
    },
  });

  // 返回流式响应
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
