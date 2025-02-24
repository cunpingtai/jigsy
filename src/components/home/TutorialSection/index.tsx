import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Play, Star } from "lucide-react";
import Image from "next/image";

const tutorials = [
  {
    id: 1,
    title: "拼图新手入门指南",
    image: "https://placehold.co/600x400",
    duration: "5分钟",
    level: "入门",
    views: 1200,
  },
  {
    id: 2,
    title: "边角处理技巧",
    image: "https://placehold.co/600x400",
    duration: "8分钟",
    level: "进阶",
    views: 890,
  },
  {
    id: 3,
    title: "快速分类方法",
    image: "https://placehold.co/600x400",
    duration: "6分钟",
    level: "专家",
    views: 650,
  },
];

interface TutorialSectionProps {
  showAll?: boolean;
}
export const TutorialSection: FC<TutorialSectionProps> = ({
  showAll = false,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          拼图技巧
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tutorials.map((tutorial) => (
            <div key={tutorial.id} className="group cursor-pointer space-y-2">
              <div className="relative h-32 rounded-lg overflow-hidden">
                <Image
                  src={tutorial.image}
                  alt={tutorial.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                  {tutorial.duration}
                </div>
              </div>
              <h3 className="font-medium group-hover:text-primary transition-colors">
                {tutorial.title}
              </h3>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {tutorial.level}
                </span>
                <span>{tutorial.views} 次观看</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
