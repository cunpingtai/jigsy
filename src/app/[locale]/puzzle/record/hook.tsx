"use client";
import { Atom } from "@/services/types";
import { calculatePuzzleDifficulty, getImageUrl } from "@/lib/utils";
import { PuzzleGrid } from "@/components/home/PuzzleGrid";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useI18n } from "@/app/[locale]/providers";

export const RecordPage = ({
  locale,
  result,
}: {
  locale: string;
  result: {
    data: Atom[];
    pagination: {
      page: number;
      totalPages: number;
    };
  };
}) => {
  const { data } = useI18n();
  const puzzles = result.data.map((atom: Atom) => {
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
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">{data.myPuzzles}</h1>

      {puzzles.length > 0 ? (
        <>
          <PuzzleGrid locale={locale} showStatus={true} puzzles={puzzles} />

          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <Link
                href={`/${locale}/puzzle/record?page=${
                  result.pagination.page - 1
                }`}
              >
                <Button
                  variant="outline"
                  disabled={result.pagination.page === 1}
                >
                  {data.previousPage}
                </Button>
              </Link>

              <span className="mx-4">
                {data.pageLabel
                  .replace("{page}", result.pagination.page.toString())
                  .replace(
                    "{totalPages}",
                    result.pagination.totalPages.toString()
                  )}
              </span>

              <Link
                href={`/${locale}/puzzle/record?page=${
                  result.pagination.page + 1
                }`}
              >
                <Button
                  variant="outline"
                  disabled={
                    result.pagination.page === result.pagination.totalPages
                  }
                >
                  {data.nextPage}
                </Button>
              </Link>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">{data.noPuzzles}</p>
          <p className="text-sm text-gray-400 mt-2">{data.createPuzzles}</p>
        </div>
      )}
    </div>
  );
};

export default RecordPage;
