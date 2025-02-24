import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

const collections = [
  {
    id: 1,
    title: "日本浮世绘",
    image: "https://placehold.co/600x400",
    count: 24,
    tags: ["艺术", "文化", "历史"],
  },
  {
    id: 2,
    title: "世界建筑",
    image: "https://placehold.co/600x400",
    count: 36,
    tags: ["建筑", "旅行", "文化"],
  },
  {
    id: 3,
    title: "梵高画作",
    image: "https://placehold.co/600x400",
    count: 18,
    tags: ["艺术", "油画", "经典"],
  },
];

interface ThemeCollectionsProps {
  showAll?: boolean;
  cols?: number;
}

export const ThemeCollections: FC<ThemeCollectionsProps> = ({
  showAll = false,
  cols = 3,
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">精选主题</h2>
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        style={
          cols
            ? {
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
              }
            : {}
        }
      >
        {collections.map((collection) => (
          <Card
            key={collection.id}
            className="group cursor-pointer overflow-hidden"
          >
            <div className="relative h-48">
              <Image
                src={collection.image}
                alt={collection.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 p-4 text-white">
                <h3 className="font-bold text-lg">{collection.title}</h3>
                <p className="text-sm text-white/80">
                  {collection.count} 个拼图
                </p>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {collection.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
