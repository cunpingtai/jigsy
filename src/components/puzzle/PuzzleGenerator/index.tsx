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
  width?: number;
  height?: number;
  onLoaded?: () => void;
  preview?: boolean;
} & PuzzleConfigType;

export const PuzzleGenerator = forwardRef<PuzzleGameRef, PuzzleGeneratorProps>(
  ({ onLoaded, ...config }, ref) => {
    const { imageUrl, width, height, preview, ...restConfig } = config;
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
        loadImage().then(() => {
          setTimeout(() => {
            setMounted(true);
            onLoaded?.();
          }, 1000);
        });
      }
    }, [image, preview, loadImage, onLoaded]);

    let fitSize = { width: 0, height: 0 };

    if (width || height) {
      if (width && height) {
        fitSize = calculateFitSize(width, height);
      } else {
        fitSize = calculateFitSize(
          Math.min(width || containerWidth, containerWidth),
          Math.min(height || containerHeight, containerHeight)
        );
      }
    } else {
      fitSize = image
        ? calculateFitSize(image.width!, image.height!)
        : { width: 0, height: 0 };
    }

    return (
      <div className="w-full h-full relative">
        <div className="w-full h-full" ref={measureRef}>
          {preview && mounted && image ? (
            <PuzzleGame
              {...restConfig}
              preview={preview}
              ref={ref}
              image={image}
              width={Math.max(Math.min(fitSize.width, 4096), 200)}
              height={Math.max(Math.min(fitSize.height, 4096), 200)}
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
