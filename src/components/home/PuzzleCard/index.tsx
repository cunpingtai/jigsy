"use client";
import { FC } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Trophy, Puzzle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/app/[locale]/providers";

interface PuzzleCardProps {
  puzzle: {
    id: string;
    title: string;
    author: string;
    image: string;
    likes: number;
    description: string;
    difficulty: string;
    status: string;
    pieces: number;
    tags?: Array<{
      tag: {
        id: string;
        name: string;
      };
    }>;
  };
  showStatus?: boolean;
  locale: string;
}

export const PuzzleCard: FC<PuzzleCardProps> = ({
  locale,
  puzzle,
  showStatus,
}) => {
  const { data } = useI18n();
  const statusMap = {
    DRAFT: data.draft,
    PUBLISHED: data.published,
    DELETED: data.deleted,
  };

  return (
    <Card className="overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={puzzle.image}
          alt={puzzle.title}
          width={1024}
          height={1024}
          className="object-contain transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-2">
          <Puzzle className="w-4 h-4 text-yellow-500" />
          {data.pieces.replace("{value}", puzzle.pieces.toString())}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold transition-colors hover:text-primary">
          {puzzle.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {puzzle.description}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex w-full items-center gap-2 mt-2 justify-between">
            <span className="text-sm bg-secondary px-2 py-1 rounded">
              {puzzle.difficulty}
            </span>
            {puzzle.likes ? (
              <span className="text-sm text-muted-foreground flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                {puzzle.likes}
              </span>
            ) : null}
          </div>
          {showStatus && (
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant={puzzle.status === "PUBLISHED" ? "default" : "outline"}
              >
                {statusMap[puzzle.status as keyof typeof statusMap]}
              </Badge>
            </div>
          )}
        </div>
        <div>
          {puzzle.tags && puzzle.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {puzzle.tags.map((tag) => (
                <Link key={tag.tag.id} href={`/${locale}/tag/${tag.tag.name}`}>
                  <Badge variant="outline">{tag.tag.name}</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 gap-2">
        <Link className="w-full flex" href={`/${locale}/puzzle/${puzzle.id}`}>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
          >
            <Trophy className="w-4 h-4 mr-2" />
            {data.challenge}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
