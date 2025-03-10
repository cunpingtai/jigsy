"use client";

import { data } from "@/data";
import "../globals.css";
import { LanguageSelector } from "./LanguageSelector";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shuffle, MessageSquare } from "lucide-react";
import { createAiService } from "@/services/aiService";
import { ParsedResponse } from "@/services/types";
import { SchedulerControl } from "@/components/shared/SchedulerControl";

interface LanguageData {
  prompt: string;
  country: string;
  tags: {
    name: string;
    description: string;
  }[];
  categories: {
    name: string;
    description: string;
    groups: {
      name: string;
      description: string;
    }[];
  }[];
}

export default function GeneratePage() {
  const [lang, setLang] = useState<keyof typeof data>("zh-CN");
  const [examText, setExamText] = useState<string>("");
  const [parsedResult, setParsedResult] = useState<ParsedResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [randomIndex, setRandomIndex] = useState<{
    randomCategoryIndex: number;
    randomGroupIndex: number;
    tagIndices: number[];
  } | null>(null);

  const langData = useMemo(() => {
    return data[lang] as LanguageData;
  }, [lang]);

  const generateRandomIndex = useCallback(() => {
    // 随机选择一个分类
    const randomCategoryIndex = Math.floor(
      Math.random() * langData.categories.length
    );
    const randomCategory = langData.categories[randomCategoryIndex];
    // 随机选择该分类下的一个分组
    const randomGroupIndex = Math.floor(
      Math.random() * randomCategory.groups.length
    );

    // 随机选择2-4个标签
    const tagCount = Math.floor(Math.random() * 3) + 2; // 2到4之间的随机数
    // 创建一个随机的标签索引数组
    const tagIndices = Array.from({ length: tagCount }, () =>
      Math.floor(Math.random() * langData.tags.length)
    );

    setRandomIndex({
      randomCategoryIndex,
      randomGroupIndex,
      tagIndices,
    });
  }, [langData.categories, langData.tags]);

  const getGeneratedContent = useCallback(
    (data: any) => {
      if (!randomIndex) return null;

      const { randomCategoryIndex, randomGroupIndex, tagIndices } = randomIndex;

      const randomCategory = data.categories[randomCategoryIndex];
      const randomGroup = randomCategory.groups[randomGroupIndex];
      const randomTags = tagIndices.map((index) => data.tags[index]);

      return {
        category: randomCategory,
        group: randomGroup,
        tags: randomTags,
      };
    },
    [randomIndex]
  );

  const generatedContent = useMemo(() => {
    if (!langData) return null;
    return getGeneratedContent(langData);
  }, [getGeneratedContent, langData]);

  const prompt = useMemo(() => {
    if (!langData || !generatedContent) return "";
    return langData?.prompt
      .replace("{category}", generatedContent.category.name)
      .replace("{group}", generatedContent.group.name)
      .replace("{tags}", generatedContent.tags.map((t) => t.name).join(", "));
  }, [langData, generatedContent]);

  // 创建 AI 服务实例
  const aiService = createAiService();

  // 解析问题和答案
  const parseExamText = async () => {
    if (!examText.trim()) {
      setError("请输入考试文本");
      return;
    }

    setIsLoading(true);
    setError(null);
    setParsedResult(null);

    try {
      const result = await aiService.parseQuestionAnswerDirect(examText);
      console.log(result);
      setParsedResult(result);
      // 使用 SSE 流式获取结果
      // aiService.parseQuestionAnswer(examText, {
      //   onMessage: (data) => {
      //     // 实时更新解析结果
      //     setParsedResult(data);
      //   },
      //   onError: (error) => {
      //     setError(error.message);
      //     setIsLoading(false);
      //   },
      //   onComplete: () => {
      //     setIsLoading(false);
      //   },
      // });
    } catch (err) {
      setError(err instanceof Error ? err.message : "解析失败");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (prompt) {
      setExamText(prompt);
    }
  }, [prompt]);

  // 添加保存生成内容的函数
  const saveGeneratedContent = async () => {
    if (!generatedContent || !parsedResult || !langData) return;

    setIsLoading(true);
    setError(null);

    try {
      const datas = Object.entries(data).map(([k, d]) => {
        const content = getGeneratedContent(d);
        if (!content) return;
        return {
          title: parsedResult[k].title,
          language: k,
          content: parsedResult[k].answer,
          category: content.category.name,
          group: content.group.name,
          tags: content.tags.map((t) => t.name).join(","),
          image: "", // 可以后续添加图片
        };
      });
      const response = await fetch("/api/admin/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: datas,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "保存失败");
      }

      // 保存成功提示
      alert("内容保存成功！");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <html>
      <body>
        <div className="p-6 max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Generate</h1>
          <div className="flex items-center gap-4 mb-6">
            <LanguageSelector defaultLanguage={lang} onChange={setLang} />
            <Button
              onClick={generateRandomIndex}
              className="flex items-center gap-2"
            >
              <Shuffle className="h-4 w-4" />
              随机生成
            </Button>
          </div>

          {/* 添加 AI 解析区域 */}
          <div className="mb-8 bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <MessageSquare className="h-6 w-6 mr-2 text-blue-500" />
              AI 问答解析
            </h2>

            <div className="space-y-4">
              <textarea
                value={examText}
                onChange={(e) => setExamText(e.target.value)}
                placeholder="请输入考试文本，例如：哪个是世界上最高的山？珠穆朗玛峰。"
                className="w-full p-3 border rounded-md h-24"
              />

              <div className="flex justify-between items-center">
                <Button
                  onClick={parseExamText}
                  disabled={isLoading || !examText.trim()}
                  className="flex items-center gap-2"
                >
                  {isLoading ? "解析中..." : "解析问答"}
                </Button>

                {error && <div className="text-red-500">{error}</div>}
              </div>

              {parsedResult && (
                <div className="mt-4 border-t pt-4">
                  <div className="bg-white p-4 rounded-md border">
                    <div className="mb-3">
                      <span className="font-medium text-blue-600">标题：</span>
                      <span>{parsedResult[lang].title}</span>
                    </div>
                    <div className="mb-3">
                      <span className="font-medium text-blue-600">问题：</span>
                      <span>{parsedResult[lang].question}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-600">答案：</span>
                      <span>{parsedResult[lang].answer}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 左侧：数据展示 */}
            <div className="space-y-6">
              {langData && (
                <>
                  {/* 基本信息 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h2 className="text-2xl font-semibold mb-4">基本信息</h2>
                    <div className="space-y-2">
                      <div className="border-b pb-2">
                        <span className="font-medium">提示词: </span>
                        <span>{langData.prompt}</span>
                      </div>
                      <div className="border-b pb-2">
                        <span className="font-medium">国家/地区: </span>
                        <span>{langData.country}</span>
                      </div>
                    </div>
                  </div>

                  {/* 标签 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h2 className="text-2xl font-semibold mb-4">标签</h2>
                    <div className="grid grid-cols-1 gap-4">
                      {langData.tags.map((tag, index) => (
                        <div key={index} className="border p-3 rounded-md">
                          <div className="font-medium text-lg">{tag.name}</div>
                          <div className="text-gray-600">{tag.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 分类 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h2 className="text-2xl font-semibold mb-4">分类</h2>
                    <div className="space-y-6">
                      {langData.categories.map((category, catIndex) => (
                        <div
                          key={catIndex}
                          className="border-t pt-4 first:border-t-0 first:pt-0"
                        >
                          <h3 className="text-xl font-medium mb-2">
                            {category.name}
                          </h3>
                          <p className="mb-4 text-gray-700">
                            {category.description}
                          </p>

                          <h4 className="font-medium mb-2">分组:</h4>
                          <div className="grid grid-cols-1 gap-3 pl-4">
                            {category.groups.map((group, groupIndex) => (
                              <div
                                key={groupIndex}
                                className="border p-2 rounded"
                              >
                                <div className="font-medium">{group.name}</div>
                                <div className="text-sm text-gray-600">
                                  {group.description}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 右侧：随机生成的内容 */}
            <div>
              {generatedContent ? (
                <div className="bg-white border-2 border-blue-200 rounded-lg p-6 sticky top-6">
                  <div className="pb-4">
                    <Button
                      onClick={saveGeneratedContent}
                      disabled={isLoading || !parsedResult}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      {isLoading ? "保存中..." : "保存生成内容"}
                    </Button>
                  </div>
                  <h2 className="text-2xl font-bold mb-6 text-blue-600">
                    随机生成结果
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2 flex items-center">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                          分类
                        </span>
                        {generatedContent.category.name}
                      </h3>
                      <p className="text-gray-700 pl-4">
                        {generatedContent.category.description}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2 flex items-center">
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded mr-2">
                          分组
                        </span>
                        {generatedContent.group.name}
                      </h3>
                      <p className="text-gray-700 pl-4">
                        {generatedContent.group.description}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
                          标签
                        </span>
                        已选择 {generatedContent.tags.length} 个
                      </h3>
                      <div className="space-y-3 pl-4">
                        {generatedContent.tags.map((tag, index) => (
                          <div
                            key={index}
                            className="border border-green-200 p-3 rounded-md bg-green-50"
                          >
                            <div className="font-medium text-lg">
                              {tag.name}
                            </div>
                            <div className="text-gray-600">
                              {tag.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-semibold mb-2">
                        生成的提示词
                      </h3>
                      <div className="bg-gray-100 p-3 rounded-md">
                        <p>
                          {langData?.prompt
                            .replace(
                              "{category}",
                              generatedContent.category.name
                            )
                            .replace("{group}", generatedContent.group.name)
                            .replace(
                              "{tags}",
                              generatedContent.tags
                                .map((t) => t.name)
                                .join(", ")
                            )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 h-64 flex flex-col items-center justify-center text-center">
                  <ArrowRight className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg text-gray-500">
                    点击&quot;随机生成&quot;按钮创建内容
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
