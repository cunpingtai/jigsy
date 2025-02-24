interface PuzzleConfig {
  seed: number;
  tabSize: number;
  jitter: number;
  tilesX: number;
  tilesY: number;
  width: number;
  height: number;
}

// 定义边缘类型枚举
export enum EdgeType {
  FLAT = "FLAT",
  TAB = "TAB", // 凸起
  HOLE = "HOLE", // 凹陷
}

// 定义边缘参数接口
interface EdgeParams {
  type: EdgeType;
  params: {
    // 第一个控制点的水平偏移量
    a: number;

    // 中间控制点的水平偏移量
    b: number;

    // 所有控制点的垂直偏移量
    c: number;

    // 第二个控制点的水平偏移量
    d: number;

    // 最后一个控制点的垂直偏移量
    e: number;

    // 是否翻转边缘形状（true表示凹陷，false表示凸起）
    flip: boolean;
  };
}

// 定义piece边缘信息接口
export interface PieceEdges {
  top: EdgeParams;
  right: EdgeParams;
  bottom: EdgeParams;
  left: EdgeParams;
}

interface PieceDimension {
  baseWidth: number; // 基础宽度
  baseHeight: number; // 基础高度
  totalWidth: number; // 包含凸起的总宽度
  totalHeight: number; // 包含凸起的总高度
  tabHeight: number; // 凸起的高度
}

export class PuzzleGenerator {
  private seed: number = 1;
  private a: number = 0;
  private b: number = 0;
  private c: number = 0;
  private d: number = 0;
  private e: number = 0;
  private t: number = 0;
  private j: number = 0;
  private flip: boolean = false;
  private xi: number = 0;
  private yi: number = 0;
  private xn: number = 0;
  private yn: number = 0;
  private vertical: number = 0;
  offset: number = 0;

  private width: number = 0;
  private height: number = 0;

  // 添加一个存储所有piece路径的Map
  private piecePaths: Map<string, string> = new Map();

  // 添加存储边缘信息的Map
  private edgeInfoMap: Map<string, PieceEdges> = new Map();

  pieceWidth: number = 0;
  pieceHeight: number = 0;

  private random(): number {
    const x = Math.sin(this.seed) * 10000;
    this.seed += 1;
    return x - Math.floor(x);
  }

  private rbool(): boolean {
    // 使用 seed 生成随机布尔值
    const x = Math.sin(this.seed) * 43758.5453123;
    // 取小数部分，如果大于0.5返回true，否则返回false
    return x - Math.floor(x) > 0.5;
  }

  private sl(): number {
    return this.vertical ? this.pieceHeight : this.pieceWidth;
  }

  private sw(): number {
    return this.vertical ? this.pieceWidth : this.pieceHeight;
  }

  private ol(): number {
    return this.offset + this.sl() * (this.vertical ? this.yi : this.xi);
  }

  private ow(): number {
    return this.offset + this.sw() * (this.vertical ? this.xi : this.yi);
  }

  private formatNumber(num: number): string {
    return Math.round(Math.round(num * 10) / 10) + "";
  }

  private l(v: number): string {
    const ret = this.ol() + this.sl() * v;
    return this.formatNumber(ret);
  }

  private w(v: number): string {
    const ret = this.ow() + this.sw() * v * (this.flip ? -1.0 : 1.0);
    return this.formatNumber(ret);
  }

  private p1l(): string {
    return this.l(0.2);
  }
  private p1w(): string {
    return this.w(this.a);
  }
  private p2l(): string {
    return this.l(0.5 + this.b + this.d);
  }
  private p2w(): string {
    return this.w(-this.t + this.c);
  }
  private p3l(): string {
    return this.l(0.5 - this.t + this.b);
  }
  private p3w(): string {
    return this.w(this.t + this.c);
  }
  private p4l(): string {
    return this.l(0.5 - 2.0 * this.t + this.b - this.d);
  }
  private p4w(): string {
    return this.w(3.0 * this.t + this.c);
  }
  private p5l(): string {
    return this.l(0.5 + 2.0 * this.t + this.b - this.d);
  }
  private p5w(): string {
    return this.w(3.0 * this.t + this.c);
  }
  private p6l(): string {
    return this.l(0.5 + this.t + this.b);
  }
  private p6w(): string {
    return this.w(this.t + this.c);
  }
  private p7l(): string {
    return this.l(0.5 + this.b + this.d);
  }
  private p7w(): string {
    return this.w(-this.t + this.c);
  }
  private p8l(): string {
    return this.l(0.8);
  }
  private p8w(): string {
    return this.w(this.e);
  }

  config: PuzzleConfig;

  constructor(config: PuzzleConfig) {
    this.config = config;

    // 初始化参数
    this.initializeParameters(this.config);
    // 第一步：生成并存储所有边缘的凹凸信息
    this.generateEdgeInformation();
  }

  generatePath(): string {
    return this.generateWholePuzzlePath();
  }

  private initializeParameters(config: PuzzleConfig): void {
    this.seed = Math.round(config.seed);
    this.t = Math.round(config.tabSize * 10) / 2000.0;
    this.j = Math.round(config.jitter * 10) / 1000.0;
    this.xn = Math.round(config.tilesX);
    this.yn = Math.round(config.tilesY);
    this.width = Math.round(config.width);
    this.height = Math.round(config.height);
    this.offset = 0;

    // 计算每个拼图片的实际尺寸
    this.pieceWidth = this.width / this.xn;
    this.pieceHeight = this.height / this.yn;
  }

  private generateEdgeInformation(): void {
    // 首先初始化所有格子的边缘信息
    for (let y = 0; y < this.yn; y++) {
      for (let x = 0; x < this.xn; x++) {
        const key = `${y}-${x}`;
        this.edgeInfoMap.set(key, {
          top: {
            type: EdgeType.FLAT,
            params: this.getStandardEdgeParams(),
          },
          right: {
            type: EdgeType.FLAT,
            params: this.getStandardEdgeParams(),
          },
          bottom: {
            type: EdgeType.FLAT,
            params: this.getStandardEdgeParams(),
          },
          left: {
            type: EdgeType.FLAT,
            params: this.getStandardEdgeParams(),
          },
        });
      }
    }

    // 处理水平边缘（上下边缘之间的连接）
    for (let y = 0; y < this.yn - 1; y++) {
      for (let x = 0; x < this.xn; x++) {
        const isTab = this.rbool();
        const edgeParams = this.getStandardEdgeParams();

        // 当前格子的底边
        this.updatePieceEdgeInfo(y, x, "bottom", {
          type: isTab ? EdgeType.TAB : EdgeType.HOLE,
          params: edgeParams,
        });

        // 下一个格子的顶边
        this.updatePieceEdgeInfo(y + 1, x, "top", {
          type: isTab ? EdgeType.HOLE : EdgeType.TAB,
          params: edgeParams,
        });
      }
    }

    // 处理垂直边缘（左右边缘之间的连接）
    for (let y = 0; y < this.yn; y++) {
      for (let x = 0; x < this.xn - 1; x++) {
        const isTab = this.rbool();
        const edgeParams = this.getStandardEdgeParams();

        // 当前格子的右边
        this.updatePieceEdgeInfo(y, x, "right", {
          type: isTab ? EdgeType.TAB : EdgeType.HOLE,
          params: edgeParams,
        });

        // 右侧格子的左边
        this.updatePieceEdgeInfo(y, x + 1, "left", {
          type: isTab ? EdgeType.HOLE : EdgeType.TAB,
          params: edgeParams,
        });
      }
    }

    // 确保外边缘是平的
    // 处理顶部和底部外边缘
    for (let x = 0; x < this.xn; x++) {
      // 顶部边缘
      this.updatePieceEdgeInfo(0, x, "top", {
        type: EdgeType.FLAT,
        params: this.getStandardEdgeParams(),
      });

      // 底部边缘
      this.updatePieceEdgeInfo(this.yn - 1, x, "bottom", {
        type: EdgeType.FLAT,
        params: this.getStandardEdgeParams(),
      });
    }

    // 处理左右外边缘
    for (let y = 0; y < this.yn; y++) {
      // 左侧边缘
      this.updatePieceEdgeInfo(y, 0, "left", {
        type: EdgeType.FLAT,
        params: this.getStandardEdgeParams(),
      });

      // 右侧边缘
      this.updatePieceEdgeInfo(y, this.xn - 1, "right", {
        type: EdgeType.FLAT,
        params: this.getStandardEdgeParams(),
      });
    }
  }

  private getStandardEdgeParams(): EdgeParams["params"] {
    // 使用随机数和抖动参数来生成边缘形状
    return {
      a: this.random() * this.j - this.j / 2,
      b: this.random() * this.j - this.j / 2,
      c: this.random() * this.j - this.j / 2,
      d: this.random() * this.j - this.j / 2,
      e: this.random() * this.j - this.j / 2,
      flip: this.rbool(),
    };
  }

  private updatePieceEdgeInfo(
    row: number,
    col: number,
    edge: keyof PieceEdges,
    params: EdgeParams
  ): void {
    const key = `${row}-${col}`;
    const currentEdges = this.edgeInfoMap.get(key) || {
      top: { type: EdgeType.FLAT, params: {} as any },
      right: { type: EdgeType.FLAT, params: {} as any },
      bottom: { type: EdgeType.FLAT, params: {} as any },
      left: { type: EdgeType.FLAT, params: {} as any },
    };

    currentEdges[edge] = params;
    this.edgeInfoMap.set(key, currentEdges);
  }

  private getPieceEdges(row: number, col: number): PieceEdges | undefined {
    const key = `${row}-${col}`;
    return this.edgeInfoMap.get(key);
  }

  generatePiecePath(
    row: number,
    col: number
  ): {
    path: string;
    edges: PieceEdges;
  } {
    const edges = this.getPieceEdges(row, col);

    if (!edges) {
      throw new Error(
        `No edge information found for piece at row ${row}, col ${col}`
      );
    }

    const path = this.generateSinglePiecePath(row, col, edges);

    return { path, edges };
  }

  private generateSinglePiecePath(
    row: number,
    col: number,
    edges: PieceEdges
  ): string {
    let path = "";
    const startX = this.offset + col * this.pieceWidth;
    const startY = this.offset + row * this.pieceHeight;

    // 开始路径 - 移动到左上角
    path = `M${this.formatNumber(startX)},${this.formatNumber(startY)} `;

    // 绘制上边缘
    if (edges.top.type === EdgeType.FLAT) {
      path += `L${this.formatNumber(
        startX + this.pieceWidth
      )},${this.formatNumber(startY)} `;
    } else {
      const { a, b, c, d, e, flip } = edges.top.params;
      this.vertical = 0;
      this.xi = col;
      this.yi = row;
      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
      this.e = e;
      this.flip = flip;

      path +=
        `C${this.p1l()},${this.p1w()} ${this.p2l()},${this.p2w()} ${this.p3l()},${this.p3w()} ` +
        `C${this.p4l()},${this.p4w()} ${this.p5l()},${this.p5w()} ${this.p6l()},${this.p6w()} ` +
        `C${this.p7l()},${this.p7w()} ${this.p8l()},${this.p8w()} ${this.formatNumber(
          startX + this.pieceWidth
        )},${this.formatNumber(startY)} `;
    }

    // 绘制右边缘
    if (edges.right.type === EdgeType.FLAT) {
      path += `L${this.formatNumber(
        startX + this.pieceWidth
      )},${this.formatNumber(startY + this.pieceHeight)} `;
    } else {
      const { a, b, c, d, e, flip } = edges.right.params;
      this.vertical = 1;
      this.xi = col + 1;
      this.yi = row;
      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
      this.e = e;
      this.flip = flip;

      path +=
        `C${this.p1w()},${this.p1l()} ${this.p2w()},${this.p2l()} ${this.p3w()},${this.p3l()} ` +
        `C${this.p4w()},${this.p4l()} ${this.p5w()},${this.p5l()} ${this.p6w()},${this.p6l()} ` +
        `C${this.p7w()},${this.p7l()} ${this.p8w()},${this.p8l()} ${this.formatNumber(
          startX + this.pieceWidth
        )},${this.formatNumber(startY + this.pieceHeight)} `;
    }

    // 绘制下边缘
    if (edges.bottom.type === EdgeType.FLAT) {
      path += `L${this.formatNumber(startX)},${this.formatNumber(
        startY + this.pieceHeight
      )} `;
    } else {
      const { a, b, c, d, e, flip } = edges.bottom.params;
      this.vertical = 0;
      this.xi = col;
      this.yi = row + 1;
      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
      this.e = e;
      this.flip = flip; // 注意这里需要翻转flip

      path +=
        `C${this.p8l()},${this.p8w()} ${this.p7l()},${this.p7w()} ${this.p6l()},${this.p6w()} ` +
        `C${this.p5l()},${this.p5w()} ${this.p4l()},${this.p4w()} ${this.p3l()},${this.p3w()} ` +
        `C${this.p2l()},${this.p2w()} ${this.p1l()},${this.p1w()} ${this.formatNumber(
          startX
        )},${this.formatNumber(startY + this.pieceHeight)} `;
    }

    // 绘制左边缘
    if (edges.left.type === EdgeType.FLAT) {
      path += `L${this.formatNumber(startX)},${this.formatNumber(startY)} `;
    } else {
      const { a, b, c, d, e, flip } = edges.left.params;
      this.vertical = 1;
      this.xi = col;
      this.yi = row;
      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
      this.e = e;
      this.flip = flip; // 注意这里需要翻转flip

      path +=
        `C${this.p8w()},${this.p8l()} ${this.p7w()},${this.p7l()} ${this.p6w()},${this.p6l()} ` +
        `C${this.p5w()},${this.p5l()} ${this.p4w()},${this.p4l()} ${this.p3w()},${this.p3l()} ` +
        `C${this.p2w()},${this.p2l()} ${this.p1w()},${this.p1l()} ${this.formatNumber(
          startX
        )},${this.formatNumber(startY)} `;
    }

    // 闭合路径
    path += "Z";

    return path;
  }

  private generateWholePuzzlePath(): string {
    let wholePath = "";

    // 添加外边框路径
    wholePath += this.generateOuterBorderPath();

    // 生成水平分割线
    this.vertical = 0;
    for (this.yi = 1; this.yi < this.yn; ++this.yi) {
      for (this.xi = 0; this.xi < this.xn; ++this.xi) {
        const edgeInfo = this.edgeInfoMap.get(
          `${this.yi - 1}-${this.xi}`
        )?.bottom;

        if (!edgeInfo || edgeInfo.type === EdgeType.FLAT) continue;

        const { a, b, c, d, e, flip } = edgeInfo.params;
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.flip = flip;

        const startX = this.offset + this.xi * this.pieceWidth;
        const startY = this.offset + this.yi * this.pieceHeight;

        wholePath +=
          `M${this.formatNumber(startX)},${this.formatNumber(startY)} ` +
          `C${this.p1l()},${this.p1w()} ${this.p2l()},${this.p2w()} ${this.p3l()},${this.p3w()} ` +
          `C${this.p4l()},${this.p4w()} ${this.p5l()},${this.p5w()} ${this.p6l()},${this.p6w()} ` +
          `C${this.p7l()},${this.p7w()} ${this.p8l()},${this.p8w()} ${this.formatNumber(
            startX + this.pieceWidth
          )},${this.formatNumber(startY)} `;
      }
    }

    // 生成垂直分割线
    this.vertical = 1;
    for (this.xi = 1; this.xi < this.xn; ++this.xi) {
      for (this.yi = 0; this.yi < this.yn; ++this.yi) {
        const edgeInfo = this.edgeInfoMap.get(
          `${this.yi}-${this.xi - 1}`
        )?.right;

        if (!edgeInfo || edgeInfo.type === EdgeType.FLAT) continue;

        const { a, b, c, d, e, flip } = edgeInfo.params;
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.flip = flip;

        const startX = this.offset + this.xi * this.pieceWidth;
        const startY = this.offset + this.yi * this.pieceHeight;

        wholePath +=
          `M${this.formatNumber(startX)},${this.formatNumber(startY)} ` +
          `C${this.p1w()},${this.p1l()} ${this.p2w()},${this.p2l()} ${this.p3w()},${this.p3l()} ` +
          `C${this.p4w()},${this.p4l()} ${this.p5w()},${this.p5l()} ${this.p6w()},${this.p6l()} ` +
          `C${this.p7w()},${this.p7l()} ${this.p8w()},${this.p8l()} ${this.formatNumber(
            startX
          )},${this.formatNumber(startY + this.pieceHeight)} `;
      }
    }

    return wholePath;
  }

  private generateOuterBorderPath(): string {
    return (
      `M${this.formatNumber(this.offset)},${this.formatNumber(this.offset)} ` +
      `L${this.formatNumber(this.offset + this.width)},${this.formatNumber(
        this.offset
      )} ` +
      `L${this.formatNumber(this.offset + this.width)},${this.formatNumber(
        this.offset + this.height
      )} ` +
      `L${this.formatNumber(this.offset)},${this.formatNumber(
        this.offset + this.height
      )} ` +
      `L${this.formatNumber(this.offset)},${this.formatNumber(this.offset)} `
    );
  }

  getPieceDimensions(row: number, col: number): PieceDimension {
    const edges = this.getPieceEdges(row, col);
    if (!edges) {
      throw new Error(
        `No edge information found for piece at row ${row}, col ${col}`
      );
    }

    // 基础尺寸
    const baseWidth = this.pieceWidth;
    const baseHeight = this.pieceHeight;

    // 计算凸起高度 - 移除多余的 3.0 倍数
    const tabHeight = this.pieceWidth * this.t;

    // 计算每个边的实际延伸（考虑凹凸）
    const leftExtend =
      edges.left.type === EdgeType.TAB
        ? tabHeight
        : edges.left.type === EdgeType.HOLE
        ? -tabHeight
        : 0;
    const rightExtend =
      edges.right.type === EdgeType.TAB
        ? tabHeight
        : edges.right.type === EdgeType.HOLE
        ? -tabHeight
        : 0;
    const topExtend =
      edges.top.type === EdgeType.TAB
        ? tabHeight
        : edges.top.type === EdgeType.HOLE
        ? -tabHeight
        : 0;
    const bottomExtend =
      edges.bottom.type === EdgeType.TAB
        ? tabHeight
        : edges.bottom.type === EdgeType.HOLE
        ? -tabHeight
        : 0;

    // 计算总的尺寸（基础尺寸加上凸起或凹陷的影响）
    const totalWidth =
      baseWidth + Math.max(0, leftExtend) + Math.max(0, rightExtend);
    const totalHeight =
      baseHeight + Math.max(0, topExtend) + Math.max(0, bottomExtend);

    return {
      baseWidth,
      baseHeight,
      totalWidth,
      totalHeight,
      tabHeight,
    };
  }
}
