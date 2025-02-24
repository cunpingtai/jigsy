import { FC } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown, Heart, Puzzle } from "lucide-react";

interface Creator {
  rank: number;
  user: {
    name: string;
    avatar: string;
    badge: string;
  };
  stats: {
    puzzles: number;
    likes: number;
  };
}

const creators: Creator[] = [
  {
    rank: 1,
    user: {
      name: "艺术创作者",
      avatar: "https://placehold.co/600x400",
      badge: "精英创作者",
    },
    stats: {
      puzzles: 45,
      likes: 1280,
    },
  },
  // ... 更多创作者数据
];

export const TopCreators: FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          优秀创作者
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {creators.map((creator) => (
          <div
            key={creator.rank}
            className="space-y-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-4 text-center font-bold text-muted-foreground">
                #{creator.rank}
              </span>
              <Avatar>
                <AvatarImage className="w-10 h-10" src={creator.user.avatar} />
                <AvatarFallback>{creator.user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium whitespace-nowrap">
                    {creator.user.name}
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-xs whitespace-nowrap"
                  >
                    {creator.user.badge}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Puzzle className="w-4 h-4" />
                    {creator.stats.puzzles} 作品
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {creator.stats.likes}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
