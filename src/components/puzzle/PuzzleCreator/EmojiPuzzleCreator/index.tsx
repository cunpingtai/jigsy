import { FC, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// 预设 Emoji 分类和表情
const emojiCategories = {
  faces: {
    name: "表情",
    emojis: ["😀", "😊", "🥰", "😎", "🤔", "😴", "😂", "🥳", "😇", "🤩"],
  },
  nature: {
    name: "自然",
    emojis: ["🌸", "🌺", "🌼", "🌻", "🌹", "🍀", "🌳", "🌈", "⭐", "🌙"],
  },
  food: {
    name: "美食",
    emojis: ["🍎", "🍕", "🍦", "🍰", "🍜", "🍱", "🍩", "🥐", "🥗", "🍪"],
  },
  animals: {
    name: "动物",
    emojis: ["🐱", "🐶", "🐼", "🐨", "🦊", "🐰", "🦁", "🐯", "🐮", "🐷"],
  },
  objects: {
    name: "物品",
    emojis: ["💝", "🎈", "🎨", "📚", "🎮", "🎵", "⚽", "🎪", "🎭", "🎪"],
  },
};

export const EmojiPuzzleCreator: FC = () => {
  const [selectedEmoji, setSelectedEmoji] = useState("😊");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [emojiSize, setEmojiSize] = useState(100);
  const [emojiRotation, setEmojiRotation] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("faces");

  return (
    <div className="space-y-6">
      {/* Emoji 预览 */}
      <div
        className="h-40 rounded-lg shadow-inner flex items-center justify-center"
        style={{ backgroundColor }}
      >
        <div
          style={{
            fontSize: `${emojiSize}px`,
            transform: `rotate(${emojiRotation}deg)`,
            transition: "all 0.3s ease",
          }}
        >
          {selectedEmoji}
        </div>
      </div>

      {/* Emoji 分类选择 */}
      <div className="space-y-2">
        <Label>选择分类</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(emojiCategories).map(([key, category]) => (
              <SelectItem key={key} value={key}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Emoji 选择器 */}
      <div className="space-y-2">
        <Label>选择表情</Label>
        <div className="grid grid-cols-10 gap-2">
          {emojiCategories[
            selectedCategory as keyof typeof emojiCategories
          ].emojis.map((emoji) => (
            <Button
              key={emoji}
              variant="outline"
              className={cn(
                "w-10 h-10 p-0 text-xl",
                selectedEmoji === emoji && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedEmoji(emoji)}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </div>

      {/* 背景颜色 */}
      <div className="space-y-2">
        <Label>背景颜色</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="w-9 h-9 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      {/* Emoji 大小 */}
      <div className="space-y-2">
        <Label>表情大小: {emojiSize}px</Label>
        <Slider
          value={[emojiSize]}
          onValueChange={(value) => setEmojiSize(value[0])}
          min={50}
          max={200}
          step={10}
        />
      </div>

      {/* Emoji 旋转 */}
      <div className="space-y-2">
        <Label>旋转角度: {emojiRotation}°</Label>
        <Slider
          value={[emojiRotation]}
          onValueChange={(value) => setEmojiRotation(value[0])}
          min={0}
          max={360}
          step={15}
        />
      </div>
    </div>
  );
};
