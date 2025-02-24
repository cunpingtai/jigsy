import { FC } from "react";
import { ThemeCollections } from "@/components/home/ThemeCollections";
import { PuzzleExplorer } from "@/components/home/PuzzleExplorer";
import { PersonalizedRecommendations } from "@/components/home/PersonalizedRecommendations";
import { EventSection } from "@/components/home/EventSection";

export const MainContent: FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <PersonalizedRecommendations /> {/* 个性化推荐 */}
          <PuzzleExplorer /> {/* 完整的拼图浏览器 */}
        </div>
        <aside className="space-y-6">
          <ThemeCollections showAll cols={1} /> {/* 显示所有主题 */}
          <EventSection /> {/* 活动展示 */}
        </aside>
      </div>
    </div>
  );
};
