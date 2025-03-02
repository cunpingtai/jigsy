import { FC } from "react";
import { ThemeCollections } from "../home/ThemeCollections";
import { PuzzleExplorer } from "../home/PuzzleExplorer";
import { PersonalizedRecommendations } from "../home/PersonalizedRecommendations";
import { EventSection } from "../home/EventSection";

export const MainContent: FC<{ locale: string }> = async ({ locale }) => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <PuzzleExplorer
            locale={locale}
            currentPage={1}
            totalPages={1}
            categories={[]}
            atoms={{
              data: [],
              pagination: { page: 1, pageSize: 24, total: 0, totalPages: 0 },
              sort: { field: "createdAt", order: "descend" },
              filters: {},
            }}
          />{" "}
          {/* 完整的拼图浏览器 */}
          <PersonalizedRecommendations /> {/* 个性化推荐 */}
        </div>
        <aside className="space-y-6">
          <ThemeCollections locale={locale} showAll featuredAtoms={[]} />{" "}
          {/* 显示所有主题 */}
          <EventSection /> {/* 活动展示 */}
        </aside>
      </div>
    </div>
  );
};
