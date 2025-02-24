import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const creators = [
  {
    id: 1,
    name: "张艺术家",
    avatar: "/avatars/creator1.jpg",
    description: "专注风景摄影",
    followers: 1200,
    puzzles: 45,
  },
  // ... 更多创作者
];

interface CreatorSpotlightProps {
  limit?: number;
  showAll?: boolean;
}

export const CreatorSpotlight: FC<CreatorSpotlightProps> = ({
  limit = 3,
  showAll = false,
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">推荐创作者</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
        {creators.map((creator) => (
          <Card key={creator.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={creator.avatar} />
                <AvatarFallback>{creator.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{creator.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {creator.description}
                </p>
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span>{creator.followers} 关注</span>
                  <span>{creator.puzzles} 作品</span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                关注
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
