import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Clock } from "lucide-react";
import Image from "next/image";

const recommendations = [
  {
    id: 1,
    type: "based_on_history",
    title: "基于你的解谜历史",
    puzzles: [
      {
        id: "p1",
        title: "山间晨雾",
        image: "https://placehold.co/600x400",
        difficulty: "中等",
        progress: 0,
      },
      {
        id: "p2",
        title: "海边日落",
        image: "https://placehold.co/600x400",
        difficulty: "中等",
        progress: 65,
      },
      // ... 更多推荐
    ],
  },
  {
    id: 2,
    type: "continue_playing",
    title: "继续解谜",
    puzzles: [
      {
        id: "p2",
        title: "海边日落",
        image: "https://placehold.co/600x400",
        progress: 65,
        difficulty: "中等",
      },
      {
        id: "p3",
        title: "山间晨雾",
        image: "https://placehold.co/600x400",
        progress: 0,
        difficulty: "中等",
      },
      // ... 更多未完成的拼图
    ],
  },
];

export const PersonalizedRecommendations: FC = () => {
  return (
    <div className="space-y-6">
      {recommendations.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {section.type === "based_on_history" ? (
                <Sparkles className="w-5 h-5 text-yellow-500" />
              ) : (
                <Clock className="w-5 h-5 text-blue-500" />
              )}
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {section.puzzles.map((puzzle) => (
                <div key={puzzle.id} className="group relative cursor-pointer">
                  <div className="relative h-32 rounded-lg overflow-hidden">
                    <Image
                      src={puzzle.image}
                      alt={puzzle.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    {puzzle.progress && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${puzzle.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-medium">{puzzle.title}</p>
                  {puzzle.difficulty && (
                    <span className="text-xs text-muted-foreground">
                      {puzzle.difficulty}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
