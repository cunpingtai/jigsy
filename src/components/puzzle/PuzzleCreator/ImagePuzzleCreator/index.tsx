import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, Upload, X } from "lucide-react";
import Image from "next/image";
import { useI18n } from "@/app/[locale]/providers";

type ImagePuzzleCreatorProps = {
  onImageUpload: (image?: string | null) => void;
  imageUrl?: string | null;
};

export const ImagePuzzleCreator: FC<ImagePuzzleCreatorProps> = ({
  onImageUpload,
  imageUrl,
}) => {
  const { data } = useI18n();
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setImage(imageUrl);
      onImageUpload(imageUrl);
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
        {imageUrl || image ? (
          <div className="relative aspect-video">
            <Image
              src={image || imageUrl || ""}
              alt={data.uploadImage}
              fill
              className="object-contain rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => {
                setImage(null);
                onImageUpload(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <ImagePlus className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-sm mb-2">
              {data.dragDropImage}
            </p>
            <div className="flex flex-col items-center">
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
              <Button
                variant="secondary"
                size="sm"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {data.selectImage}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              {data.supportImageFormat}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
