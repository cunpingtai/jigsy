import { runAIGenerationScheduler } from "./aiGenerationScheduler";

// 定时执行间隔（毫秒）
const SCHEDULER_INTERVAL = 1 * 60 * 1000; // 5分钟

let schedulerRunning = false;

// 执行调度任务
async function executeScheduler() {
  if (schedulerRunning) return;

  try {
    schedulerRunning = true;
    console.log("开始执行AI生成调度任务...");
    await runAIGenerationScheduler();
    console.log("AI生成调度任务执行完成");
  } catch (error) {
    console.error("执行调度任务时出错:", error);
  } finally {
    schedulerRunning = false;
  }
}

// 启动定时调度
export function startScheduler() {
  // 立即执行一次
  executeScheduler();

  // 设置定时执行
  const intervalId = setInterval(executeScheduler, SCHEDULER_INTERVAL);

  console.log(`调度器已启动，执行间隔: ${SCHEDULER_INTERVAL / 1000} 秒`);

  // 返回停止函数
  return () => {
    clearInterval(intervalId);
    console.log("调度器已停止");
  };
}
