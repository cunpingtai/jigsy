import { FC } from "react";
import { EventSection } from "@/components/home/EventSection";
import { CommunityFeed } from "@/components/home/CommunityFeed";
import { CreatorSpotlight } from "@/components/home/CreatorSpotlight";
import { TopContributors } from "../TopContributors";
import { TrendingTopics } from "../TrendingTopics";
import { CreatePost } from "../CreatePost";

export const MainContent: FC = () => {
  // 模拟用户数据
  const user = {
    name: "张三",
    avatar: "https://github.com/shadcn.png",
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <CreatePost user={user} />
          <CommunityFeed showAll /> {/* 完整动态流 */}
          <EventSection showAll /> {/* 所有活动 */}
        </div>
        <aside className="space-y-6">
          <CreatorSpotlight showAll /> {/* 更多创作者 */}
          <TopContributors /> {/* 新组件：贡献榜 */}
          <TrendingTopics /> {/* 新组件：热门话题 */}
        </aside>
      </div>
    </div>
  );
};
