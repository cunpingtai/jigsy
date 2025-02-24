import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Award, Puzzle, TrendingUp } from "lucide-react";

const stats = [
  {
    label: "已完成拼图",
    value: 42,
    icon: Puzzle,
    trend: "+5 本周",
    color: "text-blue-500",
  },
  {
    label: "最快完成",
    value: "1分30秒",
    icon: Clock,
    description: "200片拼图",
    color: "text-green-500",
  },
  {
    label: "获得成就",
    value: 12,
    icon: Award,
    trend: "新成就解锁!",
    color: "text-yellow-500",
  },
  {
    label: "排名提升",
    value: "前10%",
    icon: TrendingUp,
    trend: "↑15名",
    color: "text-purple-500",
  },
];

export const PuzzleStats: FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full bg-muted ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                {(stat.trend || stat.description) && (
                  <p className="text-sm text-muted-foreground">
                    {stat.trend || stat.description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
