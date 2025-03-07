import { FC } from "react";
import { ThemeCollections } from "@/components/home/ThemeCollections";
import { PuzzleExplorer } from "@/components/home/PuzzleExplorer";
import {
  Atom,
  AtomFeatured,
  Category,
  Group,
  PaginatedData,
} from "@/services/types";

export const MainContent: FC<{
  locale: string;
  categories: Category[];
  category?: Category;
  group?: Group;
  isAdmin: boolean;
  atoms: PaginatedData<Atom>;
  featuredAtoms: AtomFeatured[];
}> = ({
  locale,
  categories,
  category,
  group,
  isAdmin,
  atoms,
  featuredAtoms,
}) => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <PuzzleExplorer
            isAdmin={isAdmin}
            locale={locale}
            categories={categories}
            category={category}
            group={group}
            atoms={atoms}
            currentPage={atoms.pagination.page}
            totalPages={atoms.pagination.totalPages}
          />
        </div>
        <aside className="space-y-6">
          <ThemeCollections
            locale={locale}
            featuredAtoms={featuredAtoms}
            showAll
            cols={1}
          />
          {/* 显示所有主题 */}
          {/* <EventSection /> */}
        </aside>
      </div>
    </div>
  );
};
