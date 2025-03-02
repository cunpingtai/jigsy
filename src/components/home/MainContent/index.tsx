import { FC } from "react";
import { PuzzleCarousel } from "../PuzzleCarousel";
import { Leaderboard } from "../Leaderboard";
import { DailyChallenge } from "../DailyChallenge";
import { CreatorSpotlight } from "../CreatorSpotlight";
import { CommunityFeed } from "../CommunityFeed";
import { ThemeCollections } from "../ThemeCollections";
import { ProgressTracker } from "../ProgressTracker";

export const MainContent: FC<{ locale: string }> = ({ locale }) => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <DailyChallenge />
          <PuzzleCarousel /> {/* 展示热门/精选拼图 */}
          <ThemeCollections featuredAtoms={[]} locale={locale} />{" "}
          {/* 精选主题预览，显示3-4个 */}
          <CommunityFeed limit={5} /> {/* 限制显示最新5条动态 */}
        </div>
        <aside className="space-y-6">
          <ProgressTracker /> {/* 个人进度 */}
          <Leaderboard limit={5} /> {/* 显示前5名 */}
          <CreatorSpotlight limit={3} /> {/* 显示3个创作者 */}
        </aside>
      </div>
    </div>
  );
};
