import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Medal, Trophy, Clock, Star } from "lucide-react";
import Link from "next/link";

interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string;
    avatar: string;
    level: number;
  };
  score: number;
  completedPuzzles?: number;
  averageTime?: string;
  rating?: number;
}

const categories: {
  id: string;
  label: string;
  icon: React.ElementType;
  data: LeaderboardEntry[];
}[] = [
  {
    id: "points",
    label: "积分排名",
    icon: Trophy,
    data: [
      {
        rank: 1,
        user: {
          id: "1",
          name: "拼图大师",
          avatar: "https://placehold.co/600x400",
          level: 50,
        },
        score: 15680,
      },
      // ... 更多数据
    ],
  },
  {
    id: "speed",
    label: "速度排名",
    icon: Clock,
    data: [
      {
        rank: 1,
        user: {
          id: "2",
          name: "闪电侠",
          avatar: "https://placehold.co/600x400",
          level: 45,
        },
        score: 15680,
        averageTime: "15:30",
        completedPuzzles: 286,
      },
      // ... 更多数据
    ],
  },
  {
    id: "rating",
    label: "评分排名",
    icon: Star,
    data: [
      {
        rank: 1,
        user: {
          id: "3",
          name: "艺术家",
          avatar: "https://placehold.co/600x400",
          level: 48,
        },
        score: 15680,
        rating: 4.95,
        completedPuzzles: 156,
      },
      // ... 更多数据
    ],
  },
];

const RankIcon: FC<{ rank: number }> = ({ rank }) => {
  if (rank > 3) return <span className="font-bold text-lg">{rank}</span>;

  const colors = ["text-yellow-500", "text-gray-400", "text-amber-600"];

  return <Medal className={`w-6 h-6 ${colors[rank - 1]}`} />;
};

export const LeaderboardTabs: FC = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <Tabs defaultValue="points">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex items-center gap-2"
              >
                <category.icon className="w-4 h-4" />
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="space-y-4">
                {category.data.map((entry) => (
                  <Link
                    key={entry.rank}
                    href={`/profile/${entry.user.id}`}
                    className="block"
                  >
                    <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-8 flex justify-center">
                        <RankIcon rank={entry.rank} />
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={entry.user.avatar} />
                        <AvatarFallback>{entry.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{entry.user.name}</span>
                          <span className="text-sm text-muted-foreground">
                            Lv.{entry.user.level}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {entry.score && `${entry.score} 积分`}
                          {entry.averageTime && `平均用时 ${entry.averageTime}`}
                          {entry.rating && `评分 ${entry.rating}`}
                          {entry.completedPuzzles &&
                            ` · ${entry.completedPuzzles} 个拼图`}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
