"use client";

import React, { forwardRef, useCallback, useEffect, useState } from "react";
import { PuzzleGame, PuzzleGameRef } from "./PuzzleGame";
import { useMeasure } from "react-use";
import { PuzzleLoading } from "@/components/ui/puzzle-loading";
import { PuzzleGameProps } from "./types";
import * as fabric from "fabric";
export type PuzzleConfigType = Omit<
  PuzzleGameProps,
  "containerWidth" | "containerHeight" | "image"
>;

type PuzzleGeneratorProps = {
  imageUrl: string;
} & PuzzleConfigType;

export const PuzzleGenerator = forwardRef<PuzzleGameRef, PuzzleGeneratorProps>(
  ({ ...config }, ref) => {
    const { imageUrl, ...restConfig } = config;
    const [measureRef, { width: containerWidth, height: containerHeight }] =
      useMeasure<HTMLDivElement>();
    const [mounted, setMounted] = useState(false);
    const [image, setImage] = useState<fabric.Image | null>(null);

    const calculateFitSize = useCallback(
      (imageWidth: number, imageHeight: number) => {
        if (!containerWidth || !containerHeight)
          return { width: imageWidth, height: imageHeight };

        const maxWidth = containerWidth - 32; // 减去内边距
        const maxHeight = containerHeight - 32;

        const ratio = Math.min(maxWidth / imageWidth, maxHeight / imageHeight);

        return {
          width: Math.floor(imageWidth * ratio),
          height: Math.floor(imageHeight * ratio),
        };
      },
      [containerWidth, containerHeight]
    );

    const loadImage = useCallback(async () => {
      const image = await fabric.Image.fromURL(imageUrl);
      setImage(image);
    }, [imageUrl]);

    useEffect(() => {
      if (!image) {
        loadImage();
      }
    }, [image, loadImage]);

    useEffect(() => {
      setTimeout(() => {
        setMounted(true);
      }, 1000);
    }, []);

    const fitSize = image
      ? calculateFitSize(image.width!, image.height!)
      : { width: 0, height: 0 };

    return (
      <div className="w-full h-full relative">
        <div className="w-full h-full" ref={measureRef}>
          {mounted && image ? (
            <PuzzleGame
              {...restConfig}
              ref={ref}
              image={image}
              width={fitSize.width}
              height={fitSize.height}
              containerWidth={containerWidth}
              containerHeight={containerHeight}
            />
          ) : (
            <PuzzleLoading />
          )}
        </div>
      </div>
    );
  }
);

PuzzleGenerator.displayName = "PuzzleGenerator";
