import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Target } from "lucide-react";

const achievements = [
  {
    id: 1,
    title: "拼图大师",
    icon: Trophy,
    progress: 75,
    total: 100,
    description: "完成100个拼图",
  },
  {
    id: 2,
    title: "收藏家",
    icon: Star,
    progress: 30,
    total: 50,
    description: "收藏50个拼图",
  },
  {
    id: 3,
    title: "挑战者",
    icon: Target,
    progress: 10,
    total: 100,
    description: "完成100个挑战",
  },
  // ... 更多成就
];

interface AchievementShowcaseProps {
  showAll?: boolean;
}

export const AchievementShowcase: FC<AchievementShowcaseProps> = ({
  showAll = false,
}) => {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <h2 className="text-xl font-bold">我的成就</h2>
        <div className="space-y-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <achievement.icon className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">{achievement.title}</span>
              </div>
              <Progress
                value={(achievement.progress / achievement.total) * 100}
              />
              <p className="text-sm text-muted-foreground">
                {achievement.progress}/{achievement.total} -{" "}
                {achievement.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
