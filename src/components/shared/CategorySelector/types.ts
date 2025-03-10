import { data } from "@/data";

export type LanguageCode = keyof typeof data;

export interface Group {
  name: string;
  description: string;
}

export interface Category {
  name: string;
  description: string;
  groups: Group[];
}

export interface CategorySelectorProps {
  className?: string;
  language?: LanguageCode;
  groupMap: Record<
    string,
    {
      id: number;
      name: string;
      description: string;
    }
  >;
  categoryMap: Record<
    string,
    {
      id: number;
      name: string;
      description: string;
    }
  >;
  onSelectCategory?: (category: Category, categoryIndex: number) => void;
  onSelectGroup?: (
    group: Group,
    groupIndex: number,
    categoryIndex: number
  ) => void;
}
