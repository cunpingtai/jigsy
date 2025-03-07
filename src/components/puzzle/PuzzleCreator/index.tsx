/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { FC, useCallback, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImagePuzzleCreator } from "./ImagePuzzleCreator";
import { SolidColorPuzzleCreator } from "./SolidColorPuzzleCreator";
import { GradientPuzzleCreator } from "./GradientPuzzleCreator";
import { EmojiPuzzleCreator } from "./EmojiPuzzleCreator";
import { PuzzlePreview } from "./PuzzlePreview";
import { PuzzleMeta, PuzzleSettings } from "./PuzzleSettings";
import debounce from "lodash/debounce";
import {
  Image as ImageIcon,
  Palette,
  PaintRoller,
  Smile,
  Type,
  Grid,
  Circle,
} from "lucide-react";
import { DistributionStrategy } from "../PuzzleGenerator/types";
import { Button } from "@/components/ui/button";
import * as client from "@/services/client";
import { toast } from "sonner";
import { PatternPuzzleCreator } from "./PatternPuzzleCreator";
import { TextPuzzleCreator } from "./TextPuzzleCreator";
import { ShapePuzzleCreator } from "./ShapePuzzleCreator";
import { cloudflareService } from "@/services/client";
import zod, { ZodFormattedError } from "zod";
import { Atom } from "@/services";
import { useRouter } from "next/navigation";
import {
  calculateEstimatedTime,
  calculatePuzzleDifficulty,
  getImageUrl,
} from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useI18n } from "@/app/[locale]/providers";
import { SignedOut } from "@/components/shared/SignedOut";

export type PuzzleType =
  | "image"
  | "solid"
  | "gradient"
  | "emoji"
  | "pattern"
  | "text"
  | "shape";

export const atomSchema = zod.object({
  title: zod.string().min(1),
  content: zod.string().min(1),
  coverImage: zod.string().min(1),
  categoryId: zod.number().min(1),
  groupId: zod.number().min(1),
  tilesX: zod.number().min(1),
  tilesY: zod.number().min(1),
  tags: zod.array(zod.number()).min(1),
});

export enum ImageResizeMode {
  FIT_WIDTH = "fit_width", // 宽度全显，高度自适应
  FIT_HEIGHT = "fit_height", // 高度全显，宽度自适应
  FIT_BOTH = "fit_both", // 合适比例缩放
  FILL = "fill", // 全占满
}

type PuzzleCreatorProps = {
  atom?: Atom;
  id?: string;
  locale: string;
  isAdmin: boolean;
};

export const PuzzleCreator: FC<PuzzleCreatorProps> = ({
  atom,
  id,
  locale,
  isAdmin,
}) => {
  const { data } = useI18n();

  const tabs = useMemo(
    () => [
      {
        id: "image" as PuzzleType,
        label: data.imagePuzzle,
        icon: ImageIcon,
      },
      {
        id: "solid" as PuzzleType,
        label: data.solidPuzzle,
        icon: Palette,
      },
      {
        id: "gradient" as PuzzleType,
        label: data.gradientPuzzle,
        icon: PaintRoller,
      },
      {
        id: "emoji" as PuzzleType,
        label: data.emojiPuzzle,
        icon: Smile,
      },
      {
        id: "pattern" as PuzzleType,
        label: data.patternPuzzle,
        icon: Grid,
      },
      {
        id: "text" as PuzzleType,
        label: data.textPuzzle,
        icon: Type,
      },
      {
        id: "shape" as PuzzleType,
        label: data.shapePuzzle,
        icon: Circle,
      },
    ],
    [data]
  );

  const imageUrl = atom?.coverImage ? getImageUrl(atom?.coverImage) : null;

  const router = useRouter();

  const [activeTab, setActiveTab] = useState<PuzzleType>(
    (atom?.config?.type as PuzzleType) || "image"
  );
  const [image, setImage] = useState<string | undefined | null>(imageUrl);
  const [config, setConfig] = useState<PuzzleMeta>(() => {
    const pieces =
      atom && atom.config ? atom.config.tilesX * atom.config.tilesY : 4;
    return atom
      ? Object.assign(
          {
            tilesX: 2,
            tilesY: 2,
            width: 0,
            height: 0,
            distributionStrategy: DistributionStrategy.SURROUNDING,
            seed: 2048,
            tabSize: 20,
            jitter: 4,
            showGrid: true,
            showPreview: false,
            zoomStep: 0.1,
            minZoom: 0.5,
            maxZoom: 2,
            lineColor: "#000000",
            lineWidth: 2,
            title: "",
            description: "",
            difficulty: "",
            pieces: pieces,
            tags: [],
          },
          {
            title: atom.title,
            description: atom.content,
            coverImage: "",
            categoryId: atom.categoryId,
            groupId: atom.groupId,
            tilesX: Number(atom.config?.tilesX) || 2,
            tilesY: Number(atom.config?.tilesY) || 2,
            width: Number(atom.config?.width) || 0,
            height: Number(atom.config?.height) || 0,
            distributionStrategy: atom.config?.distributionStrategy,
            seed: Number(atom.config?.seed) || 2048,
            tabSize: Number(atom.config?.tabSize) || 20,
            jitter: Number(atom.config?.jitter) || 4,
            lineWidth: Number(atom.config?.lineWidth) || 2,
            lineColor: atom.config?.lineColor,
            type: atom.config?.type,
            tags: atom.tags || [],
            pieces: pieces,
          }
        )
      : {
          tilesX: 2,
          tilesY: 2,
          width: 0,
          height: 0,
          distributionStrategy: DistributionStrategy.SURROUNDING,
          seed: 2048,
          tabSize: 20,
          jitter: 4,
          showGrid: true,
          showPreview: false,
          zoomStep: 0.1,
          minZoom: 0.5,
          maxZoom: 2,
          lineColor: "#000000",
          lineWidth: 2,
          title: "",
          description: "",
          difficulty: "",
          pieces: 4,
          tags: [],
        };
  });
  const [meta, setMeta] = useState<any>(() => {
    if (atom?.config?.meta) {
      return JSON.parse(atom.config.meta);
    }
    return {};
  });

  const [loading, setLoading] = useState(false);

  const [fileInfo, setFileInfo] = useState<string | undefined | null>(imageUrl);

  const [error, setError] = useState<ZodFormattedError<PuzzleMeta>>();

  const handleConfigChange = (config: PuzzleMeta) => {
    setConfig({
      ...config,
      width: config.width || 1024,
      height: config.height || 1024,
    });
  };

  const difficulty = useMemo(() => {
    return calculatePuzzleDifficulty(config.pieces, activeTab, data);
  }, [config.pieces, activeTab, data]);

  const useTime = useMemo(() => {
    return data.useTime.replace(
      "{value}",
      calculateEstimatedTime(config.tilesX * config.tilesY).toString()
    );
  }, [config.tilesX, config.tilesY]);

  const handleCreatePuzzle = async () => {
    if (!image) {
      toast.error(data.pleaseUploadImage);
      return;
    }
    setLoading(true);

    try {
      const atomData = {
        title: config.title,
        content: config.description,
        coverImage: image,
        categoryId: config.categoryId,
        groupId: config.groupId,
        tilesX: config.tilesX,
        tilesY: config.tilesY,
        width: config.width,
        height: config.height,
        distributionStrategy: config.distributionStrategy,
        seed: config.seed,
        tabSize: config.tabSize,
        jitter: config.jitter,
        lineColor: config.lineColor,
        lineWidth: config.lineWidth,
        tags: config.tags.map((tag) => tag.id),
        type: activeTab,
      };

      const parsedAtomData = atomSchema.safeParse(atomData);

      if (!parsedAtomData || !parsedAtomData.success) {
        toast.error(data.atomDataValidationFailed);
        setError(parsedAtomData.error.format());
        console.log(parsedAtomData.error.format());
        return;
      } else {
        setError(undefined);
      }

      let path = fileInfo;
      if (!path) {
        const fileInfo = await cloudflareService.uploadImageFromBase64(image);
        path = fileInfo.filePath;
      }

      if (id) {
        client.atomService
          .updateAtomById(Number(id), {
            ...parsedAtomData.data,
            jitter: config.jitter,
            seed: config.seed,
            tabSize: config.tabSize,
            lineWidth: config.lineWidth,
            lineColor: config.lineColor,
            type: activeTab,
            coverImage: path,
            meta: JSON.stringify(meta),
          })
          .then((res) => {
            toast.success(data.atomUpdatedSuccess);
            router.push(`/${locale}/puzzle/${res.id}`);
          })
          .catch(() => {
            toast.error(data.atomUpdatedFailed);
          });
      } else {
        client.atomService
          .createAtom({
            ...parsedAtomData.data,
            language: locale,
            jitter: config.jitter,
            seed: config.seed,
            tabSize: config.tabSize,
            lineWidth: config.lineWidth,
            lineColor: config.lineColor,
            type: activeTab,
            coverImage: path,
            meta: JSON.stringify(meta),
          })
          .then((res) => {
            toast.success(data.atomCreatedSuccess);
            router.push(`/${locale}/puzzle/${res.id}`);
          })
          .catch((err) => {
            toast.error(data.atomCreatedFailed);
          });
      }
    } catch (err: any) {
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = useCallback(
    debounce((image?: string | null, meta?: any) => {
      setImage(image);
      setFileInfo(null);
      setMeta({
        [activeTab]: meta,
      });
    }, 80),
    [activeTab]
  );

  return (
    <div className="container mx-auto space-y-6">
      <SignedOut>
        <Alert variant="destructive">
          <AlertTitle>{data.pleaseLogin}</AlertTitle>
          <AlertDescription>{data.pleaseLoginDescription}</AlertDescription>
        </Alert>
      </SignedOut>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：创建器 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <Tabs
                value={activeTab}
                onValueChange={(v) => {
                  setActiveTab(v as PuzzleType);
                  setImage(null);
                }}
              >
                <TabsList className="grid grid-cols-3 lg:grid-cols-7 gap-2">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex flex-col items-center gap-1 py-2"
                    >
                      <tab.icon className="h-5 w-5" />
                      <span className="text-xs">{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="mt-6">
                  <TabsContent value="image">
                    <ImagePuzzleCreator
                      imageUrl={image}
                      onImageUpload={handleImageUpload}
                    />
                  </TabsContent>
                  <TabsContent value="solid">
                    <SolidColorPuzzleCreator
                      meta={meta?.solid}
                      width={config.width}
                      height={config.height}
                      onGenerate={handleImageUpload}
                    />
                  </TabsContent>
                  <TabsContent value="gradient">
                    <GradientPuzzleCreator
                      meta={meta?.gradient}
                      width={config.width}
                      height={config.height}
                      onGenerate={handleImageUpload}
                    />
                  </TabsContent>
                  <TabsContent value="emoji">
                    <EmojiPuzzleCreator
                      meta={meta?.emoji}
                      width={config.width}
                      height={config.height}
                      onGenerate={handleImageUpload}
                    />
                  </TabsContent>
                  <TabsContent value="pattern">
                    <PatternPuzzleCreator
                      meta={meta?.pattern}
                      width={config.width}
                      height={config.height}
                      onGenerate={handleImageUpload}
                    />
                  </TabsContent>

                  <TabsContent value="text">
                    <TextPuzzleCreator
                      meta={meta?.text}
                      width={config.width}
                      height={config.height}
                      onGenerate={handleImageUpload}
                    />
                  </TabsContent>
                  <TabsContent value="shape">
                    <ShapePuzzleCreator
                      meta={meta?.shape}
                      width={config.width}
                      height={config.height}
                      onGenerate={handleImageUpload}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <PuzzleSettings
                isAdmin={isAdmin}
                locale={locale}
                error={error}
                config={config}
                onChange={handleConfigChange}
              />
            </CardContent>
          </Card>
        </div>

        {/* 右侧：预览 */}
        <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardContent className="p-6">
              <PuzzlePreview
                config={config}
                type={activeTab}
                image={image}
                useTime={useTime}
                difficulty={difficulty}
              />
            </CardContent>
          </Card>
          {image ? (
            <>
              <Card>
                <CardContent className="p-6">
                  <Button
                    disabled={loading || !image}
                    onClick={handleCreatePuzzle}
                    className="w-full"
                  >
                    {id ? data.updatePuzzle : data.createPuzzle}
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
