import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, ThumbsUp, Clock } from "lucide-react";
import Image from "next/image";

interface Tip {
  id: number;
  title: string;
  image: string;
  author: string;
  category: string;
  likes: number;
  readTime: string;
  difficulty: "初级" | "中级" | "高级";
}

const tips: Tip[] = [
  {
    id: 1,
    title: "如何快速找到边角块",
    image: "https://placehold.co/600x400",
    author: "拼图达人",
    category: "基础技巧",
    likes: 328,
    readTime: "3分钟",
    difficulty: "初级",
  },
  {
    id: 2,
    title: "色彩分类方法详解",
    image: "https://placehold.co/600x400",
    author: "色彩专家",
    category: "进阶技巧",
    likes: 256,
    readTime: "5分钟",
    difficulty: "中级",
  },
  {
    id: 3,
    title: "复杂图案的处理技巧",
    image: "https://placehold.co/600x400",
    author: "拼图大师",
    category: "高级技巧",
    likes: 189,
    readTime: "7分钟",
    difficulty: "高级",
  },
];

export const TipsAndTricks: FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          实用技巧
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tips.map((tip) => (
          <div key={tip.id} className="group cursor-pointer space-y-3">
            <div className="relative h-40 rounded-lg overflow-hidden">
              <Image
                src={tip.image}
                alt={tip.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium group-hover:text-primary transition-colors">
                {tip.title}
              </h3>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    tip.difficulty === "高级"
                      ? "destructive"
                      : tip.difficulty === "中级"
                      ? "default"
                      : "secondary"
                  }
                >
                  {tip.difficulty}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {tip.category}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  {tip.likes}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {tip.readTime}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
