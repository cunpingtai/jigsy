import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, Users, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Guide {
  id: number;
  title: string;
  image: string;
  description: string;
  chapters: number;
  students: number;
  rating: number;
  level: string;
  tags: string[];
}

const guides: Guide[] = [
  {
    id: 1,
    title: "从零开始的拼图之旅",
    image: "https://placehold.co/600x400",
    description: "适合完全没有拼图经验的新手，从基础开始一步步掌握拼图技巧。",
    chapters: 12,
    students: 1234,
    rating: 4.8,
    level: "入门",
    tags: ["新手友好", "系统化", "基础知识"],
  },
  {
    id: 2,
    title: "高难度拼图攻略",
    image: "https://placehold.co/600x400",
    description: "针对3000片以上大型拼图的专业技巧和解决方案。",
    chapters: 8,
    students: 856,
    rating: 4.9,
    level: "高级",
    tags: ["大型拼图", "进阶技巧", "效率提升"],
  },
];

export const PuzzleGuides: FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="w-5 h-5 text-blue-500" />
          详细攻略
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {guides.map((guide) => (
          <div
            key={guide.id}
            className="flex flex-col md:flex-row gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden">
              <Image
                src={guide.image}
                alt={guide.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-medium">{guide.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {guide.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {guide.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Book className="w-4 h-4" />
                  {guide.chapters} 章节
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {guide.students} 学习
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  {guide.rating}
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <Button variant="outline" className="gap-2">
                开始学习
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
