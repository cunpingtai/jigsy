import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus, Upload, X } from "lucide-react";
import Image from "next/image";

export const ImagePuzzleCreator: FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-4">
      <div
        className={`
          border-2 border-dashed rounded-lg p-6
          ${isDragging ? "border-primary" : "border-border"}
          ${image ? "bg-background" : "bg-muted"}
          transition-colors duration-200
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {image ? (
          <div className="relative aspect-video">
            <Image
              src={image}
              alt="上传的图片"
              fill
              className="object-contain rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => setImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <ImagePlus className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-sm mb-2">
              拖放图片到这里，或者
            </p>
            <Label htmlFor="image-upload" className="cursor-pointer">
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
              <Button variant="secondary" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                选择图片
              </Button>
            </Label>
            <p className="text-xs text-muted-foreground mt-4">
              支持 JPG、PNG、WebP 格式，建议尺寸 1920x1080 像素
            </p>
          </div>
        )}
      </div>

      {image && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>图片滤镜</Label>
              {/* 添加滤镜选项 */}
            </div>
            <div>
              <Label>图片效果</Label>
              {/* 添加效果选项 */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
