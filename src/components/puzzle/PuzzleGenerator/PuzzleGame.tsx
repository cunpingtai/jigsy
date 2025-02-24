import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import type { PuzzleGameProps } from "./types";
import * as fabric from "fabric";
import {
  checkPuzzleCompletion,
  checkRelativePositions,
} from "./puzzleValidator";
import {
  createAnimationLoop,
  createExplosionParticles,
  createTempCanvas,
} from "./utils";
import {
  useFabricCanvas,
  useGeneratePieces,
  usePieceBackground,
  usePuzzleGenerator,
  usePuzzleSplitter,
} from "./hook";

// 在文件顶部添加类型声明
declare module "fabric" {
  interface Object {
    prevEvented?: boolean;
    prevSelectable?: boolean;
  }
  interface Canvas {
    trigger: (event: string) => void;
    toggleDragMode: (dragMode: boolean) => void;
  }
}

const STATE_IDLE = "idle";
const STATE_PANNING = "panning";

fabric.Group.prototype._controlsVisibility = {
  tl: false,
  tr: false,
  br: false,
  bl: false,
  ml: false,
  mt: false,
  mr: false,
  mb: false,
  mtr: false,
};

fabric.Canvas.prototype.toggleDragMode = function (dragMode) {
  // Remember the previous X and Y coordinates for delta calculations
  let lastClientX: number | undefined;
  let lastClientY: number | undefined;
  // Keep track of the state
  let state = STATE_IDLE;
  // We're entering dragmode
  if (dragMode) {
    // Discard any active object
    this.discardActiveObject();
    // Set the cursor to 'move'
    this.defaultCursor = "move";
    // Loop over all objects and disable events / selectable. We remember its value in a temp variable stored on each object
    this.forEachObject(function (object) {
      object.prevEvented = object.evented;
      object.prevSelectable = object.selectable;
      object.evented = false;
      object.selectable = false;
    });
    // When MouseUp fires, we set the state to idle
    this.on("mouse:up", function () {
      state = STATE_IDLE;
    });
    // When MouseDown fires, we set the state to panning
    this.on("mouse:down", (e) => {
      state = STATE_PANNING;
      lastClientX = "touches" in e.e ? e.e.touches[0].clientX : e.e.clientX;
      lastClientY = "touches" in e.e ? e.e.touches[0].clientY : e.e.clientY;
    });
    // When the mouse moves, and we're panning (mouse down), we continue
    this.on("mouse:move", (e) => {
      if (state === STATE_PANNING && e && e.e) {
        // let delta = new fabric.Point(e.e.movementX, e.e.movementY); // No Safari support for movementX and movementY
        // For cross-browser compatibility, I had to manually keep track of the delta

        // Calculate deltas
        let deltaX = 0;
        let deltaY = 0;
        if (lastClientX) {
          deltaX =
            "touches" in e.e
              ? e.e.touches[0].clientX - lastClientX
              : e.e.clientX - lastClientX;
        }
        if (lastClientY) {
          deltaY =
            "touches" in e.e
              ? e.e.touches[0].clientY - lastClientY
              : e.e.clientY - lastClientY;
        }
        // Update the last X and Y values
        lastClientX = "touches" in e.e ? e.e.touches[0].clientX : e.e.clientX;
        lastClientY = "touches" in e.e ? e.e.touches[0].clientY : e.e.clientY;
        const delta = new fabric.Point(deltaX, deltaY);
        this.relativePan(delta);
      }
    });
  } else {
    // When we exit dragmode, we restore the previous values on all objects
    this.forEachObject(function (object) {
      object.evented =
        object.prevEvented !== undefined ? object.prevEvented : object.evented;
      object.selectable =
        object.prevSelectable !== undefined
          ? object.prevSelectable
          : object.selectable;
    });
    // Reset the cursor
    this.defaultCursor = "default";
    // Remove the event listeners
    this.off("mouse:up");
    this.off("mouse:down");
    this.off("mouse:move");
  }
};

export type PuzzleGameRef = {
  handleValidate: () => Promise<boolean>;
  handleAutoComplete: () => void;
  validationStatus: "none" | "success" | "fail";
  pieceTotal: number;
};

export const PuzzleGame = forwardRef<PuzzleGameRef, PuzzleGameProps>(
  (
    {
      showGrid,
      showPreview,
      width,
      height,
      tilesX,
      tilesY,
      seed,
      tabSize,
      lineColor,
      lineWidth,
      jitter,
      distributionStrategy,
      image,
      containerWidth,
      containerHeight,
      zoom = 1,
      minZoom = 0.5,
      maxZoom = 2,
      zoomStep = 0.1,
      onZoomChange,
      enablePanning = false,
      fixCenter = false,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { fabricCanvas } = useFabricCanvas(canvasRef.current, {
      width: containerWidth,
      height: containerHeight,
      zoom,
      minZoom,
      maxZoom,
      zoomStep,
      onZoomChange,
    });

    const getDiffCenterCoords = useCallback(() => {
      if (!fabricCanvas) return { x: 0, y: 0 };
      const rect = containerRef.current!.getBoundingClientRect();

      const x = (fabricCanvas.width! - rect.width) / 2;
      const y = (fabricCanvas.height! - rect.height) / 2;

      return {
        x,
        y,
      };
    }, [fabricCanvas]);

    const { path, puzzleGenerator } = usePuzzleGenerator({
      width,
      height,
      tilesX,
      tilesY,
      seed,
      tabSize,
      jitter,
    });

    const { pieces, positions } = usePuzzleSplitter(puzzleGenerator, {
      width: containerWidth,
      height: containerHeight,
      distributionStrategy,
    });

    const { pieceBackground } = usePieceBackground(image, {
      fabricCanvas,
      lineColor,
      lineWidth,
      container: containerRef.current,
      width,
      height,
      path,
    });

    const { groups } = useGeneratePieces(image, {
      width,
      height,
      pieces,
      positions,
      fabricCanvas,
    });

    useEffect(() => {
      if (!pieceBackground) return;
      if (!fabricCanvas) return;

      pieceBackground.path.set({
        visible: showGrid,
      });

      pieceBackground.image.set({
        visible: showPreview,
      });

      if (fixCenter) {
        fabricCanvas.absolutePan(new fabric.Point(0, 0));
      }

      fabricCanvas.renderAll();
    }, [
      fixCenter,
      showGrid,
      showPreview,
      pieceBackground,
      fabricCanvas,
      getDiffCenterCoords,
    ]);

    useEffect(() => {
      if (!fabricCanvas) return;

      fabricCanvas.toggleDragMode(enablePanning);
      fabricCanvas.renderAll();
    }, [enablePanning, fabricCanvas]);

    const [validationStatus, setValidationStatus] = useState<
      "none" | "success" | "fail"
    >("none");

    const handleGroupsAnimation = useCallback(async () => {
      if (!fabricCanvas || !containerRef.current) return;

      const canvas = fabricCanvas;
      const animationLoop = createAnimationLoop(canvas);
      const { x, y } = getDiffCenterCoords();

      // 所有拼图块同时移动到正确位置
      groups.forEach(({ target, piece }) => {
        const newLeft = piece.x + x;
        const newTop = piece.y + y;

        animationLoop.addAnimation({
          obj: target,
          startProps: {
            left: target.left || 0,
            top: target.top || 0,
            angle: target.angle || 0,
          },
          endProps: {
            left: newLeft,
            top: newTop,
            angle: 0,
          },
          duration: 500,
        });
      });

      return new Promise((resolve) => {
        setTimeout(() => {
          animationLoop.clear();
          resolve(true);
        }, 500);
      });
    }, [fabricCanvas, getDiffCenterCoords, groups]);

    const playCompletionAnimation = useCallback(
      async (image: fabric.Image, canvas: fabric.Canvas) => {
        const animationLoop = createAnimationLoop(canvas);
        const { x, y } = getDiffCenterCoords();

        await handleGroupsAnimation();

        // 创建爆炸效果
        const particles = createExplosionParticles(
          canvas,
          x + width / 2,
          y + height / 2
        );

        // 粒子动画
        let frame = 0;
        const animate = () => {
          frame++;
          particles.forEach((particle) => {
            if (particle.obj.opacity! <= 0) return;

            particle.velocity.y += 0.5; // 重力
            particle.obj.left! += particle.velocity.x;
            particle.obj.top! += particle.velocity.y;
            particle.obj.opacity! = Math.max(
              0,
              particle.initialOpacity - frame / 50
            );
            particle.obj.radius! = Math.max(0, particle.radius - frame / 30);

            if (particle.obj.opacity! > 0) {
              particle.obj.setCoords();
            }
          });

          canvas.renderAll();

          if (frame < 60) {
            requestAnimationFrame(animate);
          } else {
            // 清理粒子
            particles.forEach((particle) => canvas.remove(particle.obj));
          }
        };

        animate();

        // 最终图片淡入
        const tempCanvas = createTempCanvas(image, width, height);
        const finalImage = new fabric.Image(tempCanvas);

        finalImage.set({
          left: x,
          top: y,
          width: width,
          height: height,
          opacity: 0,
          angle: 0,
          hasBorders: false,
          hasControls: false,
          selectable: false,
          evented: false,
        });
        canvas.add(finalImage);

        await new Promise<void>((resolve) => {
          animationLoop.addAnimation({
            obj: finalImage,
            startProps: { opacity: 0 },
            endProps: { opacity: 1 },
            duration: 1000,
          });

          setTimeout(() => {
            canvas.forEachObject((obj) => {
              if (obj !== finalImage) {
                canvas.remove(obj);
              }
            });
            canvas.renderAll();
            resolve();
          }, 1000);
        });

        animationLoop.clear();
      },
      [getDiffCenterCoords, handleGroupsAnimation, height, width]
    );

    const playFailAnimation = useCallback((canvas: fabric.Canvas) => {
      const objects = canvas.getObjects();

      // 震动动画
      const shakeAnimation = async () => {
        for (let i = 0; i < 1; i++) {
          // 震动3次
          for (const obj of objects) {
            const originalLeft = obj.left || 0;
            const originalTop = obj.top || 0;

            // 左右和上下震动
            await new Promise((resolve) => {
              obj.animate(
                {
                  left: originalLeft - 10,
                  top: originalTop - 5,
                },
                {
                  duration: 50,
                  onChange: canvas.renderAll.bind(canvas),
                  onComplete: () => {
                    obj.animate(
                      {
                        left: originalLeft + 10,
                        top: originalTop + 5,
                      },
                      {
                        duration: 100,
                        onChange: canvas.renderAll.bind(canvas),
                        onComplete: () => {
                          obj.animate(
                            {
                              left: originalLeft,
                              top: originalTop,
                            },
                            {
                              duration: 50,
                              onChange: canvas.renderAll.bind(canvas),
                              onComplete: resolve,
                            }
                          );
                        },
                      }
                    );
                  },
                }
              );
            });
          }
        }
      };

      // 红色闪烁效果
      objects.forEach((obj) => {
        obj.set(
          "shadow",
          new fabric.Shadow({
            color: "rgba(255,0,0,0.5)",
            blur: 20,
            offsetX: 0,
            offsetY: 0,
          })
        );
      });
      canvas.renderAll();

      shakeAnimation().then(() => {
        // 动画结束后恢复原始阴影
        requestAnimationFrame(() => {
          objects.forEach((obj) => {
            obj.set(
              "shadow",
              new fabric.Shadow({
                color: "rgba(0,0,0,0.3)",
                blur: 10,
                offsetX: 5,
                offsetY: 5,
              })
            );
          });
          canvas.renderAll();
        });
      });
    }, []);
    const handleValidate = useCallback(async () => {
      if (!fabricCanvas) return false;
      if (!image) return false;

      const currentPositions: Record<
        string,
        {
          x: number;
          y: number;
          width: number;
          height: number;
          target: fabric.Object;
        }
      > = {};
      groups.forEach(({ id, target }) => {
        currentPositions[id] = {
          x: target.left || 0,
          y: target.top || 0,
          width: target.width || 0,
          height: target.height || 0,
          target,
        };
      });
      const { x, y } = getDiffCenterCoords();

      const completed = checkPuzzleCompletion(x, y, pieces, currentPositions);
      const completed2 = checkRelativePositions(pieces, currentPositions);
      if (completed || completed2) {
        setValidationStatus("success");
        await playCompletionAnimation(image, fabricCanvas);
      } else {
        setValidationStatus("fail");
        playFailAnimation(fabricCanvas);
      }

      return completed || completed2;
    }, [
      fabricCanvas,
      image,
      groups,
      getDiffCenterCoords,
      pieces,
      playCompletionAnimation,
      playFailAnimation,
    ]);

    const handleAutoComplete = useCallback(() => {
      handleGroupsAnimation().then(() => {
        handleValidate();
      });
    }, [handleGroupsAnimation, handleValidate]);

    useImperativeHandle(ref, () => ({
      handleValidate,
      handleAutoComplete,
      validationStatus,
      pieceTotal: pieces.length,
    }));

    return (
      <div className="relative flex flex-col h-full">
        <div className="relative flex-1">
          <div className="absolute flex justify-center overflow-hidden items-center left-0 top-0 w-full h-full right-0 bottom-0">
            <div
              ref={containerRef}
              className="relative"
              style={{
                width,
                height,
              }}
            ></div>
            <div className="absolute left-0 top-0 w-full h-full right-0 bottom-0 flex justify-center items-center">
              <canvas ref={canvasRef}></canvas>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PuzzleGame.displayName = "PuzzleGame";
