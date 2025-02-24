import { FC } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface RankingStats {
  globalRank: number;
  totalUsers: number;
  weeklyProgress: number;
  monthlyProgress: number;
  achievements: {
    total: number;
    rank: number;
  };
  categories: {
    name: string;
    rank: number;
    percentile: number;
  }[];
}

const rankingStats: RankingStats = {
  globalRank: 256,
  totalUsers: 10000,
  weeklyProgress: 15,
  monthlyProgress: 45,
  achievements: {
    total: 24,
    rank: 189,
  },
  categories: [
    { name: "风景拼图", rank: 123, percentile: 95 },
    { name: "动物拼图", rank: 345, percentile: 85 },
    { name: "建筑拼图", rank: 567, percentile: 75 },
  ],
};

export const UserRanking: FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          排名详情
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 全球排名 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">全球排名</span>
            <span className="font-bold text-xl">
              #{rankingStats.globalRank}
            </span>
          </div>
          <Progress
            value={
              (1 - rankingStats.globalRank / rankingStats.totalUsers) * 100
            }
          />
          <p className="text-sm text-muted-foreground text-right">
            超过{" "}
            {(
              (1 - rankingStats.globalRank / rankingStats.totalUsers) *
              100
            ).toFixed(1)}
            % 的用户
          </p>
        </div>

        {/* 进度趋势 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">周排名提升</span>
            <p className="font-semibold text-green-500">
              <TrendingUp className="w-4 h-4 inline mr-1" />+
              {rankingStats.weeklyProgress}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">月排名提升</span>
            <p className="font-semibold text-green-500">
              <TrendingUp className="w-4 h-4 inline mr-1" />+
              {rankingStats.monthlyProgress}
            </p>
          </div>
        </div>

        {/* 分类排名 */}
        <div className="space-y-3">
          <h3 className="font-medium">分类排名</h3>
          {rankingStats.categories.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">{category.name}</span>
                <span className="text-sm font-medium">#{category.rank}</span>
              </div>
              <Progress value={category.percentile} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
