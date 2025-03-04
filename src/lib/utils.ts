import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { StaticData } from "./data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type PuzzleType =
  | "image"
  | "solid"
  | "gradient"
  | "emoji"
  | "pattern"
  | "text"
  | "shape";

// 将难度计算逻辑提取为通用函数
export const calculatePuzzleDifficulty = (
  pieces: number,
  puzzleType: PuzzleType,
  data: StaticData
) => {
  const puzzleTypeComplexity = {
    image: 1, // 普通图片
    solid: 1.5, // 纯色背景更难
    gradient: 1.3, // 渐变背景
    emoji: 0.9, // Emoji相对简单
    pattern: 1.4, // 图案
    text: 1.1, // 文字
    shape: 1.3, // 形状
  };

  const complexityFactor = puzzleTypeComplexity[puzzleType];
  const effectivePieces = pieces * complexityFactor;
  let difficulty = "veryHard";
  if (effectivePieces <= 50) difficulty = "easy";
  if (effectivePieces <= 200) difficulty = "medium";
  if (effectivePieces <= 1000) difficulty = "hard";
  return getDifficultyLabel(data, difficulty);
};

// 将难度标签转换逻辑提取为通用函数
export const getDifficultyLabel = (data: StaticData, difficulty: string) => {
  const label = data[difficulty as keyof typeof data] as string;
  return label;
};

// 将预计用时计算逻辑提取为通用函数
export const calculateEstimatedTime = (pieces: number) => {
  let timeInMinutes;

  if (pieces < 10) {
    // 少于10片：基础时间 + 每片增加时间
    timeInMinutes = Math.max(1, 0.5 + 0.1 * pieces);
  } else if (pieces <= 100) {
    // 10-100片：线性增长
    timeInMinutes = 0.1 * pieces + 1;
  } else if (pieces <= 300) {
    // 100-300片
    timeInMinutes = 0.2 * pieces + 1;
  } else if (pieces <= 500) {
    // 300-500片
    timeInMinutes = 0.4 * pieces + 1;
  } else if (pieces <= 1000) {
    // 500-1000片
    timeInMinutes = 0.7 * pieces + 1;
  } else {
    // 1000片以上
    timeInMinutes = 0.9 * pieces + 1;
  }

  // 四舍五入到整数分钟
  return Math.round(timeInMinutes);
};

export function getImageUrl(image: string) {
  return /^https?:\/\//.test(image)
    ? image
    : `${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGE_URL}/${image}`;
}
