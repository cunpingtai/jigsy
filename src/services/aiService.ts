import { ParsedResponse } from "./types";

// AI 服务接口
export interface AiService {
  // 使用 SSE 解析问题和答案
  parseQuestionAnswer: (
    text: string,
    callbacks: {
      onMessage?: (data: ParsedResponse) => void;
      onError?: (error: Error) => void;
      onComplete?: (data: ParsedResponse) => void;
    }
  ) => Promise<void>;

  // 非流式调用，直接返回解析结果
  parseQuestionAnswerDirect: (text: string) => Promise<ParsedResponse>;
}

// 创建 AI 服务
export const createAiService = (baseUrl: string = ""): AiService => {
  return {
    // 使用 SSE 解析问题和答案
    parseQuestionAnswer: async (
      text: string,
      callbacks: {
        onMessage?: (data: ParsedResponse) => void;
        onError?: (error: Error) => void;
        onComplete?: (data: ParsedResponse) => void;
      }
    ): Promise<void> => {
      try {
        // 创建 EventSource 连接 - 使用 POST 方式
        const url = `${baseUrl}/api/ai/stream`;

        // 使用 fetch 创建 POST 请求的 SSE 连接
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        });

        if (!response.ok || !response.body) {
          throw new Error(`HTTP 错误: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let finalResponse: ParsedResponse | null = null;

        // 处理流式响应
        const processStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                if (finalResponse && callbacks.onComplete) {
                  callbacks.onComplete(finalResponse);
                }
                break;
              }

              const chunk = decoder.decode(value, { stream: true });
              // 分割事件，每个事件由 event: 类型 和 data: 数据组成
              const events = chunk
                .split("\n\n")
                .filter((event) => event.trim());

              for (const event of events) {
                try {
                  // 解析事件类型和数据
                  const eventLines = event.split("\n");
                  let eventType = "message"; // 默认事件类型
                  let eventData = "";

                  for (const line of eventLines) {
                    if (line.startsWith("event:")) {
                      eventType = line.replace("event:", "").trim();
                    } else if (line.startsWith("data:")) {
                      eventData = line.replace("data:", "").trim();
                    }
                  }

                  if (eventData === "[DONE]") {
                    if (finalResponse && callbacks.onComplete) {
                      callbacks.onComplete(finalResponse);
                    }
                    return;
                  }

                  if (eventData) {
                    const data = JSON.parse(eventData) as ParsedResponse;
                    finalResponse = data;

                    // 根据事件类型调用不同的回调
                    if (eventType === "message" && callbacks.onMessage) {
                      callbacks.onMessage(data);
                    } else if (
                      eventType === "complete" &&
                      callbacks.onComplete
                    ) {
                      callbacks.onComplete(data);
                      return; // 收到 complete 事件后结束处理
                    }
                  }
                } catch (error) {
                  console.error("解析 SSE 消息时出错:", error);
                }
              }
            }
          } catch (error) {
            if (callbacks.onError) {
              callbacks.onError(
                error instanceof Error ? error : new Error(String(error))
              );
            }
          }
        };

        processStream();
      } catch (error) {
        if (callbacks.onError) {
          callbacks.onError(
            error instanceof Error ? error : new Error(String(error))
          );
        }
      }
    },

    // 非流式调用，直接返回解析结果
    parseQuestionAnswerDirect: async (
      text: string
    ): Promise<ParsedResponse> => {
      const response = await fetch(`${baseUrl}/api/ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "调用 AI 服务失败");
      }

      return (await response.json()) as ParsedResponse;
    },
  };
};

// 导出两个服务
export default createAiService;
