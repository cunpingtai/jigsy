"use client";

import { FC } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar, TrendingUp, Users, Timer } from "lucide-react";

interface MonthlyData {
  date: string;
  completions: number;
  participants: number;
  avgTime: number;
  [key: string]: any;
}

const monthlyData: MonthlyData[] = [
  {
    date: "3-01",
    completions: 156,
    participants: 234,
    avgTime: 45,
  },
  {
    date: "3-05",
    completions: 189,
    participants: 278,
    avgTime: 42,
  },
  {
    date: "3-10",
    completions: 223,
    participants: 345,
    avgTime: 38,
  },
  {
    date: "3-15",
    completions: 278,
    participants: 389,
    avgTime: 35,
  },
  {
    date: "3-20",
    completions: 312,
    participants: 456,
    avgTime: 33,
  },
  {
    date: "3-25",
    completions: 389,
    participants: 567,
    avgTime: 30,
  },
  {
    date: "3-30",
    completions: 423,
    participants: 623,
    avgTime: 28,
  },
];

const stats = [
  {
    id: "completions",
    label: "完成数量",
    icon: TrendingUp,
    color: "#22c55e",
    dataKey: "completions",
    description: "每日完成的拼图数量",
  },
  {
    id: "participants",
    label: "参与人数",
    icon: Users,
    color: "#3b82f6",
    dataKey: "participants",
    description: "每日参与拼图的用户数",
  },
  {
    id: "avgTime",
    label: "平均用时",
    icon: Timer,
    color: "#f59e0b",
    dataKey: "avgTime",
    description: "完成拼图的平均时间（分钟）",
  },
];

export const MonthlyStats: FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          月度统计
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="completions">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            {stats.map((stat) => (
              <TabsTrigger
                key={stat.id}
                value={stat.id}
                className="flex items-center gap-2"
              >
                <stat.icon className="w-4 h-4" />
                {stat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {stats.map((stat) => (
            <TabsContent key={stat.id} value={stat.id}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {stat.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-2xl font-bold"
                      style={{ color: stat.color }}
                    >
                      {monthlyData[monthlyData.length - 1][stat.dataKey]}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      当前值
                    </span>
                  </div>
                </div>

                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--background)",
                          border: "1px solid var(--border)",
                        }}
                      />
                      <Bar
                        dataKey={stat.dataKey}
                        fill={stat.color}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">
                      最高值
                    </span>
                    <p className="text-xl font-semibold">
                      {Math.max(
                        ...monthlyData.map((data) => data[stat.dataKey])
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">
                      最低值
                    </span>
                    <p className="text-xl font-semibold">
                      {Math.min(
                        ...monthlyData.map((data) => data[stat.dataKey])
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">
                      平均值
                    </span>
                    <p className="text-xl font-semibold">
                      {Math.round(
                        monthlyData.reduce(
                          (acc, curr) => acc + curr[stat.dataKey],
                          0
                        ) / monthlyData.length
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
