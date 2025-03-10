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
  onChange?: (meta: Record<string, any>) => void;
  localData?: Record<string, any>;
} & PuzzleConfigType;

export const PuzzleGenerator = forwardRef<PuzzleGameRef, PuzzleGeneratorProps>(
  ({ onLoaded, onChange, localData, ...config }, ref) => {
    const { imageUrl, preview, ...restConfig } = config;
    const [measureRef, { width: containerWidth, height: containerHeight }] =
      useMeasure<HTMLDivElement>();
    const [mounted, setMounted] = useState(false);
    const [image, setImage] = useState<fabric.Image | null>(null);
    let width = Number(config.width);
    let height = Number(config.height);

    const calculateFitSize = useCallback(
      (
        width: number,
        height: number,
        imageWidth: number,
        imageHeight: number
      ) => {
        if (!containerWidth || !containerHeight) return { width, height };

        return {
          width: Math.min(width || imageWidth, containerWidth - 32),
          height: Math.min(height || imageHeight, containerHeight - 32),
        };
      },
      [containerWidth, containerHeight]
    );

    const loadImage = useCallback(async () => {
      if (!imageUrl) return;
      const image = await fabric.Image.fromURL(imageUrl);
      setImage(image);
    }, [imageUrl]);

    useEffect(() => {
      loadImage().then(() => {
        setTimeout(() => {
          setMounted(true);
          onLoaded?.();
        }, 1000);
      });
    }, [preview, loadImage, onLoaded]);

    let fitSize = { width: 0, height: 0 };

    if (!width && !height) {
      if (config.tilesX < 4) {
        width = 200;
        height = 200;
      } else if (config.tilesX < 6) {
        width = 300;
        height = 300;
      } else if (config.tilesX < 8) {
        width = 400;
        height = 400;
      } else if (config.tilesX < 10) {
        width = 500;
        height = 500;
      } else if (config.tilesX < 12) {
        width = 600;
        height = 600;
      } else if (config.tilesX < 16) {
        width = 800;
        height = 800;
      } else if (config.tilesX < 20) {
        width = 1000;
        height = 1000;
      } else if (config.tilesX < 24) {
        width = 1200;
        height = 1200;
      }
    }

    if (image) {
      if (width || height) {
        if (width && height) {
          fitSize = calculateFitSize(width, height, image.width, image.height);
        } else {
          fitSize = calculateFitSize(
            Math.min(width || containerWidth, containerWidth),
            Math.min(height || containerHeight, containerHeight),
            image.width,
            image.height
          );
        }
      } else {
        fitSize = calculateFitSize(
          image.width,
          image.height,
          image.width,
          image.height
        );
      }
    } else {
      fitSize = { width: 0, height: 0 };
    }

    const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    };

    return (
      <div className="w-full h-full relative" onContextMenu={handleContextMenu}>
        <div className="w-full h-full" ref={measureRef}>
          {mounted && image && containerWidth && containerHeight ? (
            <PuzzleGame
              {...restConfig}
              localData={localData}
              preview={preview}
              onChange={onChange}
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
