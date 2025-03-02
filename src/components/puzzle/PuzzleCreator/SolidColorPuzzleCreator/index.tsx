/* eslint-disable @next/next/no-img-element */
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { generateSolidColorImage } from "../../PuzzleGenerator/utils";
import { debounce } from "lodash";
import { useI18n } from "@/app/[locale]/providers";

type SolidColorPuzzleCreatorMeta = {
  color?: string;
};

type SolidColorPuzzleCreatorProps = {
  onGenerate: (image: string, meta: SolidColorPuzzleCreatorMeta) => void;
  width?: number;
  height?: number;
  meta?: SolidColorPuzzleCreatorMeta;
};

export const SolidColorPuzzleCreator: FC<SolidColorPuzzleCreatorProps> = ({
  width,
  height,
  onGenerate,
  meta,
}) => {
  const { data } = useI18n();
  // 预设颜色方案
  const presetColors = useMemo(
    () => [
      { name: data.mint, value: "#4ade80" },
      { name: data.skyBlue, value: "#60a5fa" },
      { name: data.lightPurple, value: "#a78bfa" },
      { name: data.coralPink, value: "#fb7185" },
      { name: data.goldenFlower, value: "#fbbf24" },
      { name: data.lavender, value: "#a855f7" },
      { name: data.tiffanyBlue, value: "#2dd4bf" },
      { name: data.roseRed, value: "#f43f5e" },
      { name: data.lemonYellow, value: "#facc15" },
      { name: data.oceanBlue, value: "#0ea5e9" },
      { name: data.graphiteBlack, value: "#334155" },
      { name: data.pearlWhite, value: "#f8fafc" },
    ],
    [data]
  );
  const [selectedColor, setSelectedColor] = useState(
    meta?.color || presetColors[0].value
  );
  const [customColor, setCustomColor] = useState(meta?.color || "");
  const [image, setImage] = useState("");
  useEffect(() => {
    generateSolidColorImage(selectedColor, 1024, 1024).then((image) => {
      setImage(image);
      onGenerate(image, {
        color: selectedColor,
      });
    });
  }, [onGenerate, selectedColor, width, height]);

  return (
    <div className="space-y-6">
      {/* 颜色预览 */}
      <div className="h-40 rounded-lg shadow-inner">
        {image ? (
          <img src={image} alt="color" className="w-full h-full object-cover" />
        ) : null}
      </div>

      {/* 预设颜色选择 */}
      <div className="space-y-2">
        <Label>{data.presetColors}</Label>
        <div className="grid grid-cols-6 gap-2">
          {presetColors.map((color) => (
            <Button
              key={color.value}
              variant="outline"
              className={cn(
                "w-full h-12 rounded-lg p-0 overflow-hidden",
                selectedColor === color.value && "ring-2 ring-primary"
              )}
              onClick={() => {
                setSelectedColor(color.value);
                setCustomColor(color.value);
              }}
            >
              <div
                className="w-full h-full"
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            </Button>
          ))}
        </div>
      </div>

      {/* 自定义颜色 */}
      <div className="space-y-2">
        <Label>{data.customColor}</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="w-9 h-9 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            placeholder={data.hexColorCode}
            className="flex-1"
          />
          <Button
            variant="secondary"
            onClick={() => setSelectedColor(customColor)}
          >
            {data.apply}
          </Button>
        </div>
      </div>
    </div>
  );
};
