import { FC } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MessageSquare, Hash } from "lucide-react";

interface Topic {
  id: number;
  title: string;
  tag: string;
  posts: number;
  participants: number;
  trending: number; // 上升趋势百分比
}

const topics: Topic[] = [
  {
    id: 1,
    title: "最适合初学者的拼图尺寸",
    tag: "新手指南",
    posts: 56,
    participants: 234,
    trending: 85,
  },
  {
    id: 2,
    title: "如何解决纯色拼图",
    tag: "技巧分享",
    posts: 43,
    participants: 189,
    trending: 65,
  },
  {
    id: 3,
    title: "你最喜欢的拼图主题",
    tag: "讨论",
    posts: 38,
    participants: 156,
    trending: 45,
  },
  {
    id: 4,
    title: "拼图收纳有妙招",
    tag: "经验",
    posts: 32,
    participants: 145,
    trending: 30,
  },
];

export const TrendingTopics: FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-rose-500" />
          热门话题
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium flex-1">{topic.title}</h3>
            </div>
            <div className="flex items-center justify-between text-sm">
              <Badge variant="secondary">{topic.tag}</Badge>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {topic.posts}
                </span>
                <span className="text-green-500">+{topic.trending}%</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
