import { FC } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Timer, Trophy, Users } from "lucide-react";
import Image from "next/image";

interface WeeklyChallengeData {
  puzzle: {
    title: string;
    image: string;
    pieces: number;
    participants: number;
  };
  topPlayers: {
    rank: number;
    user: {
      name: string;
      avatar: string;
    };
    time: string;
  }[];
}

const weeklyData: WeeklyChallengeData = {
  puzzle: {
    title: "春日樱花",
    image: "https://placehold.co/600x400",
    pieces: 1000,
    participants: 1234,
  },
  topPlayers: [
    {
      rank: 1,
      user: {
        name: "速度王者",
        avatar: "https://placehold.co/600x400",
      },
      time: "25:30",
    },
    // ... 更多玩家数据
  ],
};

export const WeeklyChallenge: FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          本周挑战
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative h-40 rounded-lg overflow-hidden">
          <Image
            src={weeklyData.puzzle.image}
            alt={weeklyData.puzzle.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 p-4 text-white">
            <h3 className="font-bold">{weeklyData.puzzle.title}</h3>
            <div className="flex items-center gap-3 text-sm mt-1">
              <Badge variant="secondary">{weeklyData.puzzle.pieces}片</Badge>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {weeklyData.puzzle.participants} 人参与
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {weeklyData.topPlayers.map((player) => (
            <div
              key={player.rank}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <span className="w-6 text-center font-bold text-muted-foreground">
                #{player.rank}
              </span>
              <Avatar>
                <AvatarImage src={player.user.avatar} />
                <AvatarFallback>{player.user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{player.user.name}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Timer className="w-4 h-4" />
                  {player.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
