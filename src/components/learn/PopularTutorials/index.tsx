import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Play } from "lucide-react";
import Image from "next/image";

interface Tutorial {
  id: number;
  title: string;
  thumbnail: string;
  duration: string;
  views: number;
  category: string;
  trending?: boolean;
}

const tutorials: Tutorial[] = [
  {
    id: 1,
    title: "拼图排序技巧大公开",
    thumbnail: "https://placehold.co/600x400",
    duration: "15:30",
    views: 12890,
    category: "技巧",
    trending: true,
  },
  {
    id: 2,
    title: "如何开始1000片拼图",
    thumbnail: "https://placehold.co/600x400",
    duration: "12:45",
    views: 8567,
    category: "入门",
  },
  {
    id: 3,
    title: "拼图框架搭建方法",
    thumbnail: "https://placehold.co/600x400",
    duration: "18:20",
    views: 7234,
    category: "进阶",
    trending: true,
  },
];

export const PopularTutorials: FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          热门教程
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tutorials.map((tutorial) => (
          <div
            key={tutorial.id}
            className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
          >
            <div className="relative w-24 h-16 rounded overflow-hidden flex-shrink-0">
              <Image
                src={tutorial.thumbnail}
                alt={tutorial.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div className="absolute bottom-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-xs text-white">
                {tutorial.duration}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                {tutorial.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {tutorial.category}
                </Badge>
                {tutorial.trending && (
                  <Badge variant="destructive" className="text-xs">
                    热门
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <span>{tutorial.views.toLocaleString()} 次观看</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
