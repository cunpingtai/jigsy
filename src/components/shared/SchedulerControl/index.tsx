"use client";

import { FC, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayIcon, StopCircleIcon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";
import { getCurrentUser } from "@/app/api/util";

interface SchedulerControlProps {
  className?: string;
}

export const SchedulerControl: FC<SchedulerControlProps> = ({ className }) => {
  const [status, setStatus] = useState<"running" | "stopped" | "loading">(
    "loading"
  );

  // 获取当前调度器状态
  const fetchStatus = async () => {
    try {
      setStatus("loading");
      const response = await fetch("/api/cron");
      const data = await response.json();

      // 根据响应判断状态
      if (
        data.message.includes("已在运行中") ||
        data.message.includes("已启动")
      ) {
        setStatus("running");
      } else {
        setStatus("stopped");
      }
    } catch (error) {
      console.error("获取调度器状态失败:", error);
      setStatus("stopped");
      toast.error("获取状态失败", {
        description: "无法获取调度器当前状态",
      });
    }
  };

  // 启动调度器
  const startScheduler = async () => {
    try {
      setStatus("loading");
      const response = await fetch("/api/cron", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        setStatus("running");
        toast.success("操作成功", {
          description: "调度器已启动",
        });
      } else {
        throw new Error(data.message || "启动失败");
      }
    } catch (error) {
      console.error("启动调度器失败:", error);
      setStatus("stopped");
      toast.error("启动失败", {
        description: "无法启动调度器",
      });
    }
  };

  // 停止调度器
  const stopScheduler = async () => {
    try {
      setStatus("loading");
      const response = await fetch("/api/cron", {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        setStatus("stopped");
        toast.success("操作成功", {
          description: "调度器已停止",
        });
      } else {
        throw new Error(data.message || "停止失败");
      }
    } catch (error) {
      console.error("停止调度器失败:", error);
      setStatus("running");
      toast.error("停止失败", {
        description: "无法停止调度器",
      });
    }
  };

  // 组件加载时获取状态
  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          AI 生成调度控制
          <Badge
            variant={
              status === "running"
                ? "default"
                : status === "stopped"
                ? "destructive"
                : "outline"
            }
          >
            {status === "running"
              ? "运行中"
              : status === "stopped"
              ? "已停止"
              : "加载中"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Button
            onClick={startScheduler}
            disabled={status === "running" || status === "loading"}
            variant="default"
            className="flex-1"
          >
            <PlayIcon className="mr-2 h-4 w-4" />
            启动调度器
          </Button>

          <Button
            onClick={stopScheduler}
            disabled={status === "stopped" || status === "loading"}
            variant="destructive"
            className="flex-1"
          >
            <StopCircleIcon className="mr-2 h-4 w-4" />
            停止调度器
          </Button>

          <Button onClick={fetchStatus} variant="outline" size="icon">
            <RefreshCwIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
