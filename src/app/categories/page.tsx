"use client";
import { FC, useCallback, useEffect } from "react";
import {
  CategorySelector,
  Category,
  Group,
  LanguageCode,
} from "@/components/shared/CategorySelector";
import { LanguageSelector } from "@/app/generate/LanguageSelector";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const CategoriesPage: FC = () => {
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageCode>("zh-CN");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const handleLanguageChange = (language: LanguageCode) => {
    setSelectedLanguage(language);
    // 重置选择
    setSelectedCategory(null);
    setSelectedGroup(null);
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedGroup(null);
  };

  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group);
  };

  const [categories, setCategories] = useState<
    Record<
      string,
      {
        id: number;
        name: string;
        description: string;
      }
    >
  >({});

  const [groups, setGroups] = useState<
    Record<
      string,
      {
        id: number;
        name: string;
        description: string;
      }
    >
  >({});

  const fetchCategories = useCallback(async () => {
    const response = await fetch("/api/admin/categories");
    const data = await response.json();
    const categories = data.reduce((acc: Record<string, any>, item: any) => {
      acc[item.name] = item;
      return acc;
    }, {});
    setCategories(categories);
  }, []);

  const fetchGroups = useCallback(async () => {
    if (!selectedCategory) {
      return;
    }
    const category = categories[selectedCategory.name];
    const response = await fetch(
      "/api/admin/groups?language=" +
        selectedLanguage +
        "&categoryId=" +
        category.id
    );
    const data = await response.json();
    const groups = data.reduce((acc: Record<string, any>, item: any) => {
      acc[item.name] = item;
      return acc;
    }, {});
    setGroups(groups);
  }, [categories, selectedCategory, selectedLanguage]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleUpdateCategories = async () => {
    if (!selectedCategory) {
      return;
    }
    const response = await fetch("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({
        name: selectedCategory.name,
        description: selectedCategory.description,
        language: selectedLanguage,
      }),
    });
    const data = await response.json();
    console.log(data);
    fetchCategories();
  };

  const handleUpdateGroup = async () => {
    if (!selectedCategory || !selectedGroup) {
      return;
    }
    const category = categories[selectedCategory.name];
    const response = await fetch("/api/admin/groups", {
      method: "POST",
      body: JSON.stringify({
        name: selectedGroup.name,
        description: selectedGroup.description,
        categoryId: category.id,
        language: selectedLanguage,
      }),
    });
    const data = await response.json();
    console.log(data);
    fetchGroups();
  };

  console.log(categories, groups);

  return (
    <html>
      <body>
        <div className="container mx-auto py-8">
          <div className="flex flex-col space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">分类浏览</h1>
              <div className="flex items-center space-x-2">
                <Button
                  disabled={!selectedCategory}
                  onClick={handleUpdateCategories}
                >
                  更新分类
                </Button>
                <Button
                  disabled={!selectedCategory || !selectedGroup}
                  onClick={handleUpdateGroup}
                >
                  更新分组
                </Button>
              </div>
              <LanguageSelector
                onChange={handleLanguageChange}
                defaultLanguage={selectedLanguage}
              />
            </div>

            <CategorySelector
              groupMap={groups}
              categoryMap={categories}
              language={selectedLanguage}
              onSelectCategory={handleCategorySelect}
              onSelectGroup={handleGroupSelect}
              className="mb-8"
            />

            {selectedCategory && selectedGroup && (
              <div className="mt-8">
                <div className="bg-muted p-6 rounded-lg">
                  <h2 className="text-2xl font-bold mb-4">已选择:</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">分类</h3>
                      <p className="font-medium">{selectedCategory.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedCategory.description}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">分组</h3>
                      <p className="font-medium">{selectedGroup.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedGroup.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
};

export default CategoriesPage;
