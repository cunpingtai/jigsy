import { FC } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/app/[locale]/providers";

interface TextureSelectorProps {
  selectedTexture: string;
  onSelect: (texture: string) => void;
}

export const TextureSelector: FC<TextureSelectorProps> = ({
  selectedTexture,
  onSelect,
}) => {
  const textureGroups = {
    solid: [
      { className: "bg-primary/50" },
      { className: "bg-slate-100" },
      { className: "bg-zinc-100" },
      { className: "bg-neutral-100" },
      { className: "bg-red-100" },
      { className: "bg-green-100" },
      { className: "bg-blue-100" },
      { className: "bg-yellow-100" },
      { className: "bg-purple-100" },
      { className: "bg-pink-100" },
      { className: "bg-orange-100" },
      { className: "bg-gray-100" },
      { className: "bg-indigo-100" },
      { className: "bg-teal-100" },
      { className: "bg-cyan-100" },
      { className: "bg-emerald-100" },
    ],
    gradient: [
      { className: "bg-gradient-to-r from-slate-100 to-slate-200" },
      { className: "bg-gradient-to-r from-blue-50 to-blue-100" },
      { className: "bg-gradient-to-r from-green-50 to-green-100" },
      { className: "bg-gradient-to-br from-rose-50 to-rose-100" },
      { className: "bg-gradient-to-r from-purple-50 to-purple-100" },
      { className: "bg-gradient-to-r from-yellow-50 to-yellow-100" },
      { className: "bg-gradient-to-br from-indigo-50 to-indigo-100" },
      { className: "bg-gradient-to-br from-pink-50 to-pink-100" },
      { className: "bg-gradient-to-r from-teal-50 to-teal-100" },
      { className: "bg-gradient-to-r from-orange-50 to-orange-100" },
      { className: "bg-gradient-to-br from-cyan-50 to-cyan-100" },
      { className: "bg-gradient-to-br from-emerald-50 to-emerald-100" },
      { className: "bg-gradient-to-r from-gray-50 to-gray-100" },
      { className: "bg-gradient-to-br from-slate-50 to-blue-100" },
      { className: "bg-gradient-to-br from-green-50 to-teal-100" },
      { className: "bg-gradient-to-r from-rose-50 to-pink-100" },
    ],
    pattern: [
      {
        className:
          "bg-[url('/textures/suede1.jpg')] bg-no-repeat bg-cover bg-center bg-primary/50",
      },
      {
        className:
          "bg-[url('/textures/suede2.jpg')] bg-no-repeat bg-cover bg-center bg-primary/50",
      },
      {
        className:
          "bg-[url('/textures/suede3.jpg')] bg-no-repeat bg-cover bg-center bg-primary/50",
      },
      {
        className:
          "bg-[url('/textures/suede4.jpg')] bg-no-repeat bg-cover bg-center bg-primary/50",
      },
      {
        className:
          "bg-[url('/textures/suede5.avif')] bg-no-repeat bg-cover bg-center bg-primary/50",
      },
      {
        className:
          "bg-[url('/textures/suede6.jpg')] bg-no-repeat bg-cover bg-center bg-primary/50",
      },
      {
        className:
          "bg-[url('/textures/suede7.jpg')] bg-no-repeat bg-cover bg-center bg-primary/50",
      },
      {
        className:
          "bg-[url('/textures/suede8.jpg')] bg-no-repeat bg-cover bg-center bg-primary/50",
      },
      {
        className:
          "bg-[url('/textures/suede9.jpg')] bg-no-repeat bg-cover bg-center bg-primary/50",
      },
      {
        className:
          "bg-[url('/textures/suede10.webp')] bg-no-repeat bg-cover bg-center bg-primary/50",
      },
      {
        className:
          "bg-[url('/textures/suede11.jpg')] bg-no-repeat bg-cover bg-center bg-primary/50",
      },
      {
        className:
          "bg-[url('/textures/suede12.jpg')] bg-no-repeat bg-cover bg-center bg-primary/50",
      },
      {
        className:
          "bg-[url('/textures/suede13.avif')] bg-no-repeat bg-cover bg-center bg-primary/50",
      },
      {
        className:
          "bg-[url('/textures/suede14.jpg')] bg-no-repeat bg-cover bg-center bg-primary/50",
      },
      {
        className:
          "bg-[url('/textures/suede15.jpg')] bg-no-repeat bg-cover bg-center bg-primary/50",
      },
      {
        className:
          "bg-[url('/textures/suede16.jpg')] bg-no-repeat bg-cover bg-center bg-primary/50",
      },
    ],
  };

  const { data } = useI18n();

  return (
    <Tabs defaultValue="solid" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="solid">{data.solid}</TabsTrigger>
        <TabsTrigger value="gradient">{data.gradient}</TabsTrigger>
        <TabsTrigger value="pattern">{data.pattern}</TabsTrigger>
      </TabsList>
      {Object.entries(textureGroups).map(([key, textures]) => (
        <TabsContent key={key} value={key}>
          <div className="grid grid-cols-4 gap-4">
            {textures.map((texture, index) => (
              <Button
                key={index}
                variant={
                  selectedTexture === texture.className ? "default" : "outline"
                }
                className="h-24 p-0 overflow-hidden bg-card"
                onClick={() => onSelect(texture.className)}
              >
                <div className={cn("w-full h-full", texture.className)} />
              </Button>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};
