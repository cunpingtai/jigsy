"use client";

import { FC, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Smile, Hash, X, Image as ImageIcon } from "lucide-react";
import { CreateTopicDialog } from "../CreateTopicDialog";
import Image from "next/image";

interface CreatePostProps {
  user: {
    name: string;
    avatar: string;
  };
}

export const CreatePost: FC<CreatePostProps> = ({ user }) => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: 实现图片上传逻辑
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages([...images, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // TODO: 实现发布逻辑
    console.log({ content, images, selectedTopic });
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex gap-3">
          <Avatar>
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="分享你的想法..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>

        {/* 图片预览区 */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden"
              >
                <Image
                  src={img}
                  alt=""
                  width={1920}
                  height={1080}
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={() =>
                    setImages(images.filter((_, i) => i !== index))
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* 选中的话题标签 */}
        {selectedTopic && (
          <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full w-fit">
            <Hash className="w-4 h-4" />
            <span className="text-sm">{selectedTopic}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-1"
              onClick={() => setSelectedTopic(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
            >
              <label className="cursor-pointer">
                <ImageIcon className="h-5 w-5" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
            >
              <Smile className="h-5 w-5" />
            </Button>
            <CreateTopicDialog />
          </div>
          <Button onClick={handleSubmit} disabled={!content.trim()}>
            发布
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
