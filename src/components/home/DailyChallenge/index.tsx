import { FC } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, Trophy, Users } from "lucide-react";

export const DailyChallenge: FC = () => {
  return (
    <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          今日挑战
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              <span>剩余时间: 8小时</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>1.2k 人参与</span>
            </div>
          </div>
          <Button className="w-full" variant="secondary">
            立即参与
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
