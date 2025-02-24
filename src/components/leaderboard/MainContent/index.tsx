import { FC } from "react";
import { LeaderboardTabs } from "../LeaderboardTabs";
import { TopCreators } from "../TopCreators";
import { WeeklyChallenge } from "../WeeklyChallenge";
import { MonthlyStats } from "../MonthlyStats";

export const MainContent: FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <LeaderboardTabs /> {/* 主要排行榜标签页 */}
          <MonthlyStats /> {/* 月度数据统计 */}
        </div>
        <aside className="space-y-6">
          <WeeklyChallenge /> {/* 周挑战排名 */}
          <TopCreators /> {/* 创作者排名 */}
        </aside>
      </div>
    </div>
  );
};
