import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import Image from "next/image";

interface Puzzle {
  id: number;
  title: string;
  image: string;
  pieces: number;
  completedAt?: string;
  timeSpent?: string;
  status: "completed" | "in-progress" | "created";
  likes?: number;
  difficulty: string;
}

const puzzles: Puzzle[] = [
  {
    id: 1,
    title: "樱花庭院",
    image: "https://placehold.co/600x400",
    pieces: 1000,
    completedAt: "2024-03-15",
    timeSpent: "5小时30分",
    status: "completed",
    difficulty: "中等",
  },
  {
    id: 2,
    title: "星空夜景",
    image: "https://placehold.co/600x400",
    pieces: 1500,
    status: "in-progress",
    difficulty: "困难",
  },
  {
    id: 3,
    title: "海边日落",
    image: "https://placehold.co/600x400",
    pieces: 500,
    status: "created",
    likes: 156,
    difficulty: "简单",
  },
];

export const UserPuzzles: FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>我的拼图</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="completed">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="completed">已完成</TabsTrigger>
            <TabsTrigger value="in-progress">进行中</TabsTrigger>
            <TabsTrigger value="created">已创建</TabsTrigger>
          </TabsList>

          {["completed", "in-progress", "created"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {puzzles
                  .filter((puzzle) => puzzle.status === tab)
                  .map((puzzle) => (
                    <div
                      key={puzzle.id}
                      className="group cursor-pointer space-y-3"
                    >
                      <div className="relative h-40 rounded-lg overflow-hidden">
                        <Image
                          src={puzzle.image}
                          alt={puzzle.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        <Badge className="absolute top-2 right-2">
                          {puzzle.pieces}片
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium group-hover:text-primary transition-colors">
                          {puzzle.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{puzzle.difficulty}</Badge>
                          {puzzle.status === "completed" && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {puzzle.timeSpent}
                            </div>
                          )}
                          {puzzle.likes && (
                            <div className="text-sm text-muted-foreground">
                              ❤️ {puzzle.likes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
