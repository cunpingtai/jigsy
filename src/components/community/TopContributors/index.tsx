import { FC } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Star, Puzzle } from "lucide-react";

interface Contributor {
  id: number;
  name: string;
  avatar: string;
  contributions: {
    puzzles: number;
    solutions: number;
    rating: number;
  };
  rank: number;
}

const contributors: Contributor[] = [
  {
    id: 1,
    name: "张三",
    avatar: "https://placehold.co/600x400",
    contributions: {
      puzzles: 45,
      solutions: 128,
      rating: 4.9,
    },
    rank: 1,
  },
  {
    id: 2,
    name: "李四",
    avatar: "https://placehold.co/600x400",
    contributions: {
      puzzles: 38,
      solutions: 96,
      rating: 4.8,
    },
    rank: 2,
  },
  {
    id: 3,
    name: "王五",
    avatar: "https://placehold.co/600x400",
    contributions: {
      puzzles: 32,
      solutions: 85,
      rating: 4.7,
    },
    rank: 3,
  },
];

export const TopContributors: FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          贡献榜
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {contributors.map((contributor) => (
          <div
            key={contributor.id}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex-shrink-0 w-8 text-center font-bold text-muted-foreground">
              #{contributor.rank}
            </div>
            <Avatar>
              <AvatarImage src={contributor.avatar} />
              <AvatarFallback>{contributor.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{contributor.name}</p>
              <div className="flex gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Puzzle className="w-4 h-4" />
                  {contributor.contributions.puzzles}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {contributor.contributions.rating}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
