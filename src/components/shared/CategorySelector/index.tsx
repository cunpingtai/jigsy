import { FC, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { data } from "@/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Category, CategorySelectorProps, Group } from "./types";

export const CategorySelector: FC<CategorySelectorProps> = ({
  className,
  language = "zh-CN",
  categoryMap,
  groupMap,
  onSelectCategory,
  onSelectGroup,
}) => {
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<
    number | null
  >(null);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(
    null
  );
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (language && data[language]) {
      setCategories(data[language].categories);
      // 重置选择状态
      setSelectedCategoryIndex(null);
      setSelectedGroupIndex(null);
    }
  }, [language]);

  const handleCategoryClick = (index: number) => {
    const newIndex = selectedCategoryIndex === index ? null : index;
    setSelectedCategoryIndex(newIndex);
    setSelectedGroupIndex(null);

    if (newIndex !== null && onSelectCategory) {
      onSelectCategory(categories[newIndex], newIndex);
    }
  };

  const handleGroupClick = (groupIndex: number, categoryIndex: number) => {
    setSelectedGroupIndex(groupIndex);

    if (onSelectGroup && categories[categoryIndex]) {
      onSelectGroup(
        categories[categoryIndex].groups[groupIndex],
        groupIndex,
        categoryIndex
      );
    }
  };

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      <h2 className="text-xl font-bold">分类选择</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category, index) => (
          <Card
            key={`${language}-category-${index}`}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              selectedCategoryIndex === index ? "ring-2 ring-primary" : ""
            )}
            onClick={() => {
              handleCategoryClick(index);
            }}
          >
            <CardHeader className="pb-2">
              <Badge variant="default">
                {categoryMap[category.name] ? "已存在" : "不存在"}
              </Badge>
              <CardTitle className="text-lg">{category.name}</CardTitle>
              <CardDescription className="line-clamp-2 text-xs">
                {category.description}
              </CardDescription>
            </CardHeader>

            {selectedCategoryIndex === index && (
              <CardContent>
                <h4 className="text-sm font-medium mb-2">分组:</h4>
                <ScrollArea className="h-40">
                  <div className="flex flex-wrap gap-2">
                    {category.groups.map((group: Group, groupIndex: number) => (
                      <div
                        className="border p-2"
                        key={`group-${groupIndex}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGroupClick(groupIndex, index);
                        }}
                      >
                        <Badge
                          variant={
                            selectedGroupIndex === groupIndex ||
                            groupMap[group.name]
                              ? "default"
                              : "outline"
                          }
                        >
                          {groupMap[group.name] ? "已存在" : "不存在"}
                        </Badge>
                        <span className="cursor-pointer">{group.name}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export * from "./types";
