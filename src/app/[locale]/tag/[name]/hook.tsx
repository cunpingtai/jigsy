"use client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tag } from "lucide-react";
import { Atom } from "@/services/types";
import { useI18n } from "../../providers";
import { PuzzleGrid } from "@/components/home/PuzzleGrid";
import { calculatePuzzleDifficulty, getImageUrl } from "@/lib/utils";

type AtomFeatured = {
  atom: Atom;
  reason: string;
  createdAt: string;
};

export const TagPuzzlesPage = ({
  locale,
  tagName,
  tagDescription,
  initialPuzzles,
  initialTotalPages,
  initialPage,
}: {
  locale: string;
  tagName: string;
  tagDescription?: string;
  initialPuzzles: AtomFeatured[];
  initialTotalPages: number;
  initialPage: number;
}) => {
  const { data } = useI18n();

  const puzzles = initialPuzzles.map(({ atom }) => {
    const pieces = atom.config ? atom.config?.tilesX * atom.config?.tilesY : 0;
    return {
      pieces,
      id: atom.id.toString(),
      title: atom.title,
      author: atom.user?.name || "",
      image: getImageUrl(atom.coverImage),
      description: atom.content || "",
      likes: atom.likesCount,
      difficulty: calculatePuzzleDifficulty(
        pieces,
        atom.config?.type || "image",
        data
      ),
      status: atom.status,
    };
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-2 mb-6">
        <Tag className="h-6 w-6" />
        <h1 className="text-2xl font-bold">
          {data.tagPuzzles}: {tagName}
        </h1>
      </div>
      <p className=" mb-6">{tagDescription}</p>

      {initialPuzzles.length === 0 ? (
        <div className="text-center py-10">
          <Tag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            {data.noPuzzles}
          </h3>
          <p className="text-gray-500">
            {data.noPuzzlesDescription.replace("{tag}", tagName)}
          </p>
        </div>
      ) : (
        <>
          <PuzzleGrid locale={locale} puzzles={puzzles} />

          {initialTotalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={getPageUrl(locale, tagName, initialPage - 1)}
                      className={
                        initialPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from(
                    { length: initialTotalPages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href={getPageUrl(locale, tagName, page)}
                        isActive={initialPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href={getPageUrl(locale, tagName, initialPage + 1)}
                      className={
                        initialPage === initialTotalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const getPageUrl = (locale: string, tagName: string, page: number) => {
  return `/${locale}/tag?name=${tagName}&page=${page}`;
};

export default TagPuzzlesPage;
