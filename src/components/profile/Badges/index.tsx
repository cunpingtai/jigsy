import { FC } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock } from "lucide-react";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";

interface BadgeItem {
  id: number;
  name: string;
  icon: string;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked: boolean;
  unlockedAt?: string;
  progress?: {
    current: number;
    total: number;
  };
}

const badges: BadgeItem[] = [
  {
    id: 1,
    name: "拼图大师",
    icon: "https://placehold.co/600x400",
    description: "完成100个拼图",
    rarity: "legendary",
    unlocked: true,
    unlockedAt: "2024-02-15",
  },
  {
    id: 2,
    name: "速度之星",
    icon: "https://placehold.co/600x400",
    description: "30分钟内完成500片拼图",
    rarity: "epic",
    unlocked: true,
    unlockedAt: "2024-03-01",
  },
  {
    id: 3,
    name: "收藏家",
    icon: "https://placehold.co/600x400",
    description: "收藏50个拼图",
    rarity: "rare",
    unlocked: false,
    progress: {
      current: 35,
      total: 50,
    },
  },
];

const rarityColors = {
  common: "bg-gray-100",
  rare: "bg-blue-100",
  epic: "bg-purple-100",
  legendary: "bg-yellow-100",
};

export const Badges: FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          成就徽章
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`p-4 rounded-lg ${
              badge.unlocked ? rarityColors[badge.rarity] : "bg-gray-50"
            } 
              transition-all hover:shadow-md`}
          >
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12">
                <Image
                  src={badge.icon}
                  alt={badge.name}
                  fill
                  className={`object-contain ${
                    !badge.unlocked && "opacity-50 grayscale"
                  }`}
                />
                {!badge.unlocked && (
                  <Lock className="absolute -top-1 -right-1 w-4 h-4 text-gray-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{badge.name}</h3>
                  <Badge
                    variant={
                      badge.rarity === "legendary"
                        ? "destructive"
                        : badge.rarity === "epic"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {badge.rarity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {badge.description}
                </p>
                {badge.unlocked ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    获得于 {badge.unlockedAt}
                  </p>
                ) : (
                  badge.progress && (
                    <div className="mt-2">
                      <Progress
                        value={
                          (badge.progress.current / badge.progress.total) * 100
                        }
                        className="h-1"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        {badge.progress.current}/{badge.progress.total}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
