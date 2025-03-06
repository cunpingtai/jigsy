import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// 定义响应类型
interface ParsedResponse {
  question: string;
  title: string;
  answer: string;
}

export async function POST(request: NextRequest) {
  try {
    // 从请求体中获取文本
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "缺少文本参数" }, { status: 400 });
    }

    // 创建 OpenAI 客户端
    const client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
    });

    // 系统提示
    const systemPrompt = `
    The user will provide some exam text. Please parse the "question", "title", and "answer" and output them in JSON format. 
    
    The title should be a concise summary of the answer, typically 2-5 words.

    EXAMPLE INPUT: 
    Which is the highest mountain in the world? Mount Everest.

    EXAMPLE JSON OUTPUT:
    {
        "question": "Which is the highest mountain in the world?",
        "title": "Mount Everest",
        "answer": "Mount Everest is the highest mountain on Earth, with its peak at 8,848.86 meters (29,031.7 ft) above sea level."
    }
    `;

    // 发送请求到 DeepSeek API
    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      response_format: {
        type: "json_object",
      },
    });

    // 解析响应
    const content = response.choices[0].message.content;
    const parsedContent = JSON.parse(content || "{}") as ParsedResponse;

    // 返回解析后的内容
    return NextResponse.json(parsedContent);
  } catch (error) {
    console.error("AI 处理错误:", error);
    return NextResponse.json({ error: "处理请求时出错" }, { status: 500 });
  }
}
