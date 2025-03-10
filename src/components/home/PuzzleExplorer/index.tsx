"use client";
import { FC } from "react";
import { Button } from "@/components/ui/button";
import { PuzzleGrid } from "../PuzzleGrid";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, History, Bookmark, Heart, Settings } from "lucide-react";
import { Atom, Category, Group, PaginatedData } from "@/services/types";
import { calculatePuzzleDifficulty, getImageUrl } from "@/lib/utils";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useI18n } from "@/app/[locale]/providers";
import { SignedIn } from "@/components/shared/SignedIn";

export const PuzzleExplorer: FC<{
  locale: string;
  categories: Category[];
  category?: Category;
  group?: Group;
  atoms: PaginatedData<Atom>;
  currentPage: number;
  totalPages: number;
  isAdmin: boolean;
}> = ({
  locale,
  categories,
  category,
  group,
  atoms,
  currentPage,
  totalPages,
  isAdmin,
}) => {
  const categoryName = category?.name || "all";
  const groupName = group?.name || "";

  const groups =
    categories.find((category) => category.name === categoryName)?.groups || [];
  const { data } = useI18n();

  return (
    <div className="space-y-4">
      {/* 功能按钮行 */}
      <div className="flex gap-4 pb-4 border-b">
        <Link href={`/${locale}/puzzle/create`}>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            {data.createPuzzle}
          </Button>
        </Link>
        <SignedIn>
          <Link href={`/${locale}/puzzle/record`}>
            <Button variant="outline" className="gap-2">
              <History className="w-4 h-4" />
              {data.createRecord}
            </Button>
          </Link>
          <Link href={`/${locale}/play/record`}>
            <Button variant="outline" className="gap-2">
              <History className="w-4 h-4" />
              {data.myGameRecord}
            </Button>
          </Link>
          <Link href={`/${locale}/puzzle/favorite`}>
            <Button variant="outline" className="gap-2">
              <Bookmark className="w-4 h-4" />
              {data.favorites}
            </Button>
          </Link>
          <Link href={`/${locale}/puzzle/liked`}>
            <Button variant="outline" className="gap-2">
              <Heart className="w-4 h-4" />
              {data.liked}
            </Button>
          </Link>
          {isAdmin && (
            <Link href={`/${locale}/puzzle/admin`}>
              <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" />
                {data.adminPuzzleList}
              </Button>
            </Link>
          )}
        </SignedIn>
      </div>

      {/* 分类导航 */}
      <ScrollArea className="w-full">
        <div className="flex space-x-2 pb-2">
          <Link
            href={`/${locale}/explore`}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              categoryName === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {data.all}
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/${locale}/explore/${category.name}`}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                categoryName === category.name
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </ScrollArea>

      {/* 子分类导航 - 仅在选择特定分类时显示 */}
      {categoryName !== "all" && groups.length > 0 && (
        <ScrollArea className="w-full">
          <div className="flex space-x-2 pb-2">
            <Link
              href={`/${locale}/explore/${categoryName}`}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                groupName === ""
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {data.all}
            </Link>
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/${locale}/explore/${categoryName}/${group.name}`}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  groupName === group.name
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                {group.name}
              </Link>
            ))}
          </div>
        </ScrollArea>
      )}
      <h3 className="text-2xl font-bold">{category?.description}</h3>
      <p className="text-sm">{group?.description}</p>
      {/* 拼图网格区域 */}
      <PuzzleGrid
        locale={locale}
        puzzles={atoms.data.map((atom) => {
          const pieces = atom.config
            ? atom.config?.tilesX * atom.config?.tilesY
            : 0;
          return {
            pieces,
            tags: atom.tags?.map(({ tag }) => ({
              tag: {
                id: tag.id.toString(),
                name: tag.name,
              },
            })),
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
        <Pagination className="mt-8">
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  href={getPageUrl(
                    locale,
                    categoryName,
                    groupName,
                    currentPage - 1
                  )}
                />
              </PaginationItem>
            )}

            {generatePaginationItems(currentPage, totalPages).map((page, i) => (
              <PaginationItem key={i}>
                {page === "..." ? (
                  <span className="px-4 py-2">...</span>
                ) : (
                  <PaginationLink
                    href={getPageUrl(
                      locale,
                      categoryName,
                      groupName,
                      page as number
                    )}
                    isActive={page === currentPage}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext
                  href={getPageUrl(
                    locale,
                    categoryName,
                    groupName,
                    currentPage + 1
                  )}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

// 生成分页链接
function getPageUrl(
  locale: string,
  categoryName: string,
  groupName: string,
  page: number
): string {
  let baseUrl = `/${locale}/explore`;

  if (categoryName && categoryName !== "all") {
    baseUrl += `/${categoryName}`;

    if (groupName) {
      baseUrl += `/${groupName}`;
    }
  }

  return `${baseUrl}?page=${page}`;
}

// 生成分页项目数组
function generatePaginationItems(currentPage: number, totalPages: number) {
  const items = [];

  if (totalPages <= 7) {
    // 如果总页数少于等于7，显示所有页码
    for (let i = 1; i <= totalPages; i++) {
      items.push(i);
    }
  } else {
    // 总是显示第一页
    items.push(1);

    // 当前页接近开始
    if (currentPage <= 3) {
      items.push(2, 3, 4, "...", totalPages);
    }
    // 当前页接近结束
    else if (currentPage >= totalPages - 2) {
      items.push(
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    }
    // 当前页在中间
    else {
      items.push(
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages
      );
    }
  }

  return items;
}
