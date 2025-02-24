import { FC } from "react";
import { TutorialSection } from "@/components/home/TutorialSection";
import { PuzzleGuides } from "../PuzzleGuides";
import { TipsAndTricks } from "../TipsAndTricks";
import { PopularTutorials } from "../PopularTutorials";

export const MainContent: FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <TutorialSection showAll /> {/* 完整教程列表 */}
          <TipsAndTricks /> {/* 新组件：技巧分享 */}
          <PuzzleGuides /> {/* 新组件：详细攻略 */}
        </div>
        <aside className="space-y-6">
          <PopularTutorials /> {/* 新组件：热门教程 */}
        </aside>
      </div>
    </div>
  );
};
