"use client";
import { FC, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Share2,
  Clock,
  Puzzle,
  Trophy,
  BookmarkPlus,
  Play,
  Star,
  Calendar,
  BookOpen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Atom } from "@/services";
import { SignedIn } from "@clerk/nextjs";
import {
  calculateEstimatedTime,
  calculatePuzzleDifficulty,
  cn,
  getDifficultyLabel,
  getImageUrl,
} from "@/lib/utils";
import { atomService } from "@/services/client";
import { toast } from "sonner";
import { PuzzleCard } from "@/components/home/PuzzleCard";
import { User } from "@prisma/client";
import * as client from "@/services/client";
import { useI18n } from "@/app/[locale]/providers";

interface PuzzleDetailProps {
  puzzle: Atom;
  groupAtoms: Atom[];
  role?: string;
  isFeatured: boolean;
  locale: string;
}

export const PuzzleDetail: FC<PuzzleDetailProps> = ({
  puzzle,
  groupAtoms,
  role,
  locale,
  isFeatured,
}) => {
  const {
    config = {
      pieces: 0,
      type: "image",
      tilesX: 0,
      tilesY: 0,
    },
  } = puzzle;
  const { data } = useI18n();
  const pieces = config.tilesX * config.tilesY;

  const imageUrl = getImageUrl(puzzle.coverImage);

  const difficultyLabel = useMemo(() => {
    return calculatePuzzleDifficulty(pieces, config.type, data);
  }, [pieces, config.type, data]);

  const [isLiked, setIsLiked] = useState(puzzle.isLiked || false);
  const [likeCount, setLikeCount] = useState(puzzle.likesCount || 0);
  const [isFavorited, setIsFavorited] = useState(puzzle.isFavorited || false);
  const [isLoading, setIsLoading] = useState(false);

  // 处理点赞
  const handleLike = async () => {
    try {
      setIsLoading(true);
      if (isLiked) {
        await atomService.unlikeAtom(puzzle.id);
        setLikeCount((prev) => prev - 1);
        setIsLiked(false);
        toast.success(data.unlike);
      } else {
        await atomService.likeAtom(puzzle.id);
        setLikeCount((prev) => prev + 1);
        setIsLiked(true);
        toast.success(data.like);
      }
    } catch (error) {
      toast.error(data.error);
      console.error("点赞操作失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理收藏
  const handleFavorite = async () => {
    try {
      setIsLoading(true);
      if (isFavorited) {
        await atomService.unfavoriteAtom(puzzle.id);
        setIsFavorited(false);
        toast.success(data.unfavorite);
      } else {
        await atomService.favoriteAtom(puzzle.id);
        setIsFavorited(true);
        toast.success(data.favorite);
      }
    } catch (error) {
      toast.error(data.error);
      console.error("收藏操作失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [isAtomFeatured, setIsAtomFeatured] = useState(isFeatured || false);
  const [isPublished, setIsPublished] = useState(puzzle.status === "PUBLISHED");

  const handleFeatured = async () => {
    if (puzzle.isFeatured) {
      await client.atomService.removeAtomFromFeatured(puzzle.id);
    } else {
      await client.atomService.addAtomToFeatured(puzzle.id, "精选", 0);
    }
    setIsAtomFeatured(!isAtomFeatured);
  };

  const handlePublish = async () => {
    if (puzzle.status === "PUBLISHED") {
      await client.atomService.updateAtomStatus(puzzle.id, "DRAFT");
    } else {
      await client.atomService.updateAtomStatus(puzzle.id, "PUBLISHED");
    }
    setIsPublished(!isPublished);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：拼图预览和基本信息 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
                <Image
                  src={imageUrl}
                  alt={puzzle.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{puzzle.title}</h1>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={puzzle.user?.avatar} />
                      <AvatarFallback>{puzzle.user?.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{puzzle.user?.name}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <SignedIn>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`gap-2 ${isFavorited ? "bg-primary/10" : ""}`}
                      onClick={handleFavorite}
                      disabled={isLoading}
                    >
                      <BookmarkPlus
                        className={`w-4 h-4 ${
                          isFavorited ? "fill-primary" : ""
                        }`}
                      />
                      {isFavorited ? data.unfavorite : data.favorite}
                    </Button>
                  </SignedIn>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    {data.share}
                  </Button>
                  {role === "ADMIN" ? (
                    <Button
                      onClick={handleFeatured}
                      variant={!isAtomFeatured ? "outline" : "default"}
                      size="sm"
                      className="gap-2"
                    >
                      <Star className="w-4 h-4" />
                      {isAtomFeatured ? data.unfeatured : data.featured}
                    </Button>
                  ) : null}

                  {role === "ADMIN" ? (
                    <Button
                      onClick={handlePublish}
                      variant={!isPublished ? "outline" : "default"}
                      size="sm"
                      className="gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      {isPublished ? data.unpublish : data.publish}
                    </Button>
                  ) : null}
                </div>
              </div>

              <p className="text-muted-foreground mb-6">{puzzle.content}</p>

              <div className="flex flex-wrap gap-4 mb-6">
                <Badge variant="secondary" className="gap-1">
                  <Puzzle className="w-4 h-4" />
                  {data.pieces.replace(
                    "{value}",
                    (config?.tilesX * config?.tilesY).toString()
                  )}
                </Badge>
                <Badge variant="secondary" className={`gap-1 text-primary`}>
                  <Trophy className="w-4 h-4" />
                  {difficultyLabel}
                </Badge>
                {/* <Badge variant="secondary" className="gap-1">
                  <Users className="w-4 h-4" />
                  {puzzle.viewCount} 人完成
                </Badge>  */}
                <Badge variant="secondary" className="gap-1">
                  <Clock className="w-4 h-4" />
                  {data.useTime.replace(
                    "{value}",
                    calculateEstimatedTime(pieces).toString()
                  )}
                </Badge>
              </div>

              <div className="flex gap-4">
                <Button size="lg" className="gap-2 flex-1">
                  <Link
                    className="gap-2 flex-1 flex items-center justify-center"
                    href={`/${locale}/puzzle/${puzzle.id}/play`}
                  >
                    <Play className="w-5 h-5" />
                    {data.start}
                  </Link>
                </Button>
                <SignedIn>
                  <Button
                    variant="outline"
                    size="lg"
                    className={`gap-2 ${isLiked ? "bg-primary/10" : ""}`}
                    onClick={handleLike}
                    disabled={isLoading}
                  >
                    <Heart
                      className={`w-5 h-5 ${isLiked ? "fill-primary" : ""}`}
                    />
                    {likeCount}
                  </Button>
                </SignedIn>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：展示同组原子 */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">{data.group}</h2>
          <div
            className={cn(
              "grid gap-4",
              groupAtoms.length > 2 ? "grid-cols-2" : "grid-cols-1"
            )}
          >
            {groupAtoms.map((atom) => (
              <PuzzleCard
                key={atom.id}
                locale={locale}
                puzzle={{
                  status: atom.status,
                  id: atom.id.toString(),
                  title: atom.title,
                  author: atom.user?.name || "",
                  description: atom.content || "",
                  image: getImageUrl(atom.coverImage),
                  likes: atom.likesCount,
                  difficulty: calculatePuzzleDifficulty(
                    atom.config ? atom.config?.tilesX * atom.config?.tilesY : 0,
                    atom.config?.type || "image",
                    data
                  ),
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
