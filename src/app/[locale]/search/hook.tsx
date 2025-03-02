"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import * as client from "@/services/client";
import { Atom } from "@/services/types";
import { calculatePuzzleDifficulty, cn, getImageUrl } from "@/lib/utils";
import { PuzzleGrid } from "@/components/home/PuzzleGrid";
import { useI18n } from "../providers";

const SearchPage = ({ locale }: { locale: string }) => {
  const { data } = useI18n();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(
    decodeURIComponent(initialQuery)
  );
  const [searchResults, setSearchResults] = useState<Atom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 9; // 每页显示9个原子，适合3列布局

  useEffect(() => {
    setSearchQuery(decodeURIComponent(initialQuery));
  }, [initialQuery]);

  const handleSearch = useCallback(
    async (page = 1) => {
      if (!searchQuery.trim()) return;

      setIsLoading(true);
      setError(null);
      setCurrentPage(page);

      try {
        const result = await client.atomService.getAtoms({
          title: searchQuery,
          page: page,
          pageSize: pageSize,
          language: locale,
        });
        setSearchResults(result.data || []);
        // 计算总页数
        const total = result.pagination.total || 0;
        setTotalPages(Math.ceil(total / pageSize));
      } catch (err) {
        console.error("搜索出错:", err);
        setError(data.searchError);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery, locale, data.searchError]
  );

  useEffect(() => {
    if (initialQuery) {
      handleSearch(1);
    }
  }, [handleSearch, initialQuery]);

  const handlePageChange = (page: number) => {
    handleSearch(page);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">{data.search}</h1>

      <div className="flex gap-2 mb-8">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={data.searchTitle}
          className="flex-1"
          onKeyDown={(e) => e.key === "Enter" && handleSearch(1)}
        />
        <Button onClick={() => handleSearch(1)} disabled={isLoading}>
          {isLoading ? data.searching : <Search className="h-4 w-4 mr-2" />}
          {data.search}
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="w-full h-40 bg-gray-200">
                <Skeleton className="h-full w-full" />
              </div>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {searchResults.length > 0 ? (
            <>
              <PuzzleGrid
                locale={locale}
                puzzles={searchResults.map((atom) => {
                  const pieces = atom.config
                    ? atom.config?.tilesX * atom.config?.tilesY
                    : 0;
                  return {
                    description: atom.content || "",
                    status: atom.status,
                    id: atom.id.toString(),
                    title: atom.title,
                    author: atom.user?.name || "",
                    image: getImageUrl(atom.coverImage),
                    likes: atom.likesCount,
                    difficulty: calculatePuzzleDifficulty(
                      pieces,
                      atom.config?.type || "image",
                      data
                    ),
                  };
                })}
              />

              {/* 分页控件 */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      {data.previousPage}
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      )
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      {data.nextPage}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : searchQuery && !isLoading ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">{data.noResults}</p>
              <p className="text-sm text-gray-400 mt-2">
                {data.tryDifferentKeywords}
              </p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default SearchPage;
