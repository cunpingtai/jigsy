"use client";
import { FC } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { AtomFeatured } from "@/services/types";
import { getImageUrl } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/app/[locale]/providers";

interface ThemeCollectionsProps {
  showAll?: boolean;
  cols?: number;
  featuredAtoms: AtomFeatured[];
  locale: string;
}

export const ThemeCollections: FC<ThemeCollectionsProps> = ({
  locale,
  showAll = false,
  cols = 3,
  featuredAtoms,
}) => {
  const collections = featuredAtoms.map((atom) => ({
    id: atom.atom.id,
    title: atom.atom.title,
    image: getImageUrl(atom.atom.coverImage),
    tags: atom.atom.tags.map((tag) => tag.name),
  }));
  const { data } = useI18n();
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{data.featuredCollections}</h2>
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
                className="object-cover transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 p-4 text-white">
                <h3 className="font-bold text-lg">{collection.title}</h3>
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
            <CardFooter className="p-4 pt-0 gap-2">
              <Link
                className="w-full flex"
                href={`/${locale}/puzzle/${collection.id}`}
              >
                <Button className="w-full">{data.view}</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
