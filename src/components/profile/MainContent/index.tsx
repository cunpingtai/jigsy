import { FC } from "react";
import { PuzzleStats } from "@/components/home/PuzzleStats";
import { AchievementShowcase } from "@/components/home/AchievementShowcase";
import { ProgressTracker } from "@/components/home/ProgressTracker";
import { UserPuzzles } from "../UserPuzzles";
import { UserRanking } from "../UserRanking";
import { Badges } from "../Badges";

export const MainContent: FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <PuzzleStats /> {/* 完整统计数据 */}
          <AchievementShowcase showAll /> {/* 所有成就 */}
          <UserPuzzles /> {/* 新组件：用户创建/完成的拼图 */}
        </div>
        <aside className="space-y-6">
          <ProgressTracker showDetailed /> {/* 详细进度 */}
          <UserRanking /> {/* 新组件：排名详情 */}
          <Badges /> {/* 新组件：徽章展示 */}
        </aside>
      </div>
    </div>
  );
};
