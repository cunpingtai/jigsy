import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Flame, Calendar } from "lucide-react";

interface GoalProgress {
  current: number;
  target: number;
  label: string;
  icon: any;
  streak?: number;
}

const goals: GoalProgress[] = [
  {
    current: 15,
    target: 20,
    label: "本周目标",
    icon: Target,
  },
  {
    current: 7,
    target: 7,
    label: "连续打卡",
    icon: Flame,
    streak: 7,
  },
  {
    current: 45,
    target: 50,
    label: "本月进度",
    icon: Calendar,
  },
];

interface ProgressTrackerProps {
  showDetailed?: boolean;
}

export const ProgressTracker: FC<ProgressTrackerProps> = ({
  showDetailed = false,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>进度追踪</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {goals.map((goal, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <goal.icon className="w-5 h-5 text-primary" />
                <span className="font-medium">{goal.label}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {goal.current}/{goal.target}
              </span>
            </div>
            <Progress
              value={(goal.current / goal.target) * 100}
              className="h-2"
            />
            {goal.streak && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                连续打卡 {goal.streak} 天
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
