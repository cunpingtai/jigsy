import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";
import Link from "next/link";

const topUsers = [
  {
    id: "1",
    name: "李四",
    avatar: "https://placehold.co/40x40",
    score: 1200,
    rank: 1,
  },
  // ... 更多用户数据
];

interface LeaderboardProps {
  limit?: number;
}

export const Leaderboard: FC<LeaderboardProps> = ({ limit = 5 }) => {
  return (
    <Card className="sticky z-10 top-20 transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          排行榜
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topUsers.map((user) => (
            <Link
              key={user.id}
              href={`/user/${user.name}`}
              className="flex items-center gap-4 p-2 rounded-lg transition-all duration-300 hover:bg-muted cursor-pointer"
            >
              <span className="text-lg font-bold w-6 transition-colors">
                {user.rank}
              </span>
              <Avatar className="transition-transform hover:scale-110">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.score} 分</p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
