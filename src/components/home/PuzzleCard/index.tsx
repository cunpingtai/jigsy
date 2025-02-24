import { FC } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PuzzleCardProps {
  puzzle: {
    id: string;
    title: string;
    author: string;
    image: string;
    likes: number;
    difficulty: string;
  };
}

export const PuzzleCard: FC<PuzzleCardProps> = ({ puzzle }) => {
  return (
    <Card className="overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={puzzle.image}
          alt={puzzle.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold transition-colors hover:text-primary">
          {puzzle.title}
        </h3>
        <p className="text-sm text-muted-foreground">作者: {puzzle.author}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm bg-secondary px-2 py-1 rounded">
            {puzzle.difficulty}
          </span>
          <span className="text-sm text-muted-foreground">
            ❤ {puzzle.likes}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
        >
          <Trophy className="w-4 h-4 mr-2" />
          <Link href={`/puzzle/${puzzle.id}`}>挑战</Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="transition-colors duration-300 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900"
        >
          <Heart className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
