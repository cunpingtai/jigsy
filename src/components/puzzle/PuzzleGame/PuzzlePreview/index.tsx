/* eslint-disable @next/next/no-img-element */
import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface PuzzlePreviewProps {
  image: string;
  title: string;
  onClose: () => void;
}

export const PuzzlePreview: FC<PuzzlePreviewProps> = ({
  image,
  title,
  onClose,
}) => {
  return (
    <Card className="absolute top-4 right-4 w-64 shadow-xl border-border">
      <CardHeader className="p-2 bg-card flex flex-row items-center justify-between">
        <span className="text-sm text-muted-foreground">预览图</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-primary"
          onClick={onClose}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="aspect-video relative">
          <img src={image} alt={title} className="w-full object-cover" />
          <div className="absolute inset-0 bg-foreground/0 hover:bg-foreground/20 transition-colors duration-200" />
        </div>
      </CardContent>
    </Card>
  );
};
