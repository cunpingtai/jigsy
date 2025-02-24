"use client";
import { FC, useEffect, useRef, useMemo, useCallback, useState } from "react";
import * as fabric from "fabric";
import { gradientStrategies } from "../Gradient/strategies";

interface TextureProps {
  width?: number;
  height?: number;
}

export const Texture: FC<TextureProps> = ({ width = 1000, height = 1000 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

  const currentStrategy = useMemo(() => {
    return gradientStrategies["fractalNoise"];
  }, []);

  const drawGradient = useCallback(
    (fabricCanvas: fabric.Canvas) => {
      if (!fabricCanvas || !currentStrategy) return;
      const config = currentStrategy.templates["desertSands"];
      currentStrategy.createGradient(fabricCanvas, config);
    },
    [currentStrategy]
  );

  useEffect(() => {
    if (canvasRef.current) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        skipTargetFind: true,
        preserveObjectStacking: true,
        selection: false,
      });
      setCanvas(fabricCanvas);
      return () => {
        fabricCanvas.dispose();
      };
    }
  }, []);

  useEffect(() => {
    if (canvas) {
      const timer = setTimeout(() => {
        canvas.setWidth(width);
        canvas.setHeight(height);
        drawGradient(canvas);
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [width, height, canvas, drawGradient]);

  return <canvas ref={canvasRef} />;
};
