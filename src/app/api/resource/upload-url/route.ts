import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

// 配置 S3 客户端连接到 Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || "",
  },
});

// 允许的图片类型
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
// 最大文件大小 (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const {
      url,
      directory = process.env.CLOUDFLARE_DEFAULT_DIRECTORY || "uploads",
    } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "未提供图片URL" }, { status: 400 });
    }

    // 下载远程图片
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json(
        { error: `下载图片失败: ${response.statusText}` },
        { status: 400 }
      );
    }

    // 获取文件类型
    const contentType = response.headers.get("content-type") || "image/png";
    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json(
        {
          error: `不支持的文件类型: ${contentType}，仅支持 JPEG, PNG, GIF 和 WebP`,
        },
        { status: 400 }
      );
    }

    // 读取图片内容
    const fileBuffer = await response.arrayBuffer();
    const fileContent = Buffer.from(fileBuffer);

    // 验证文件大小
    if (fileContent.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `文件大小超过限制 (10MB)，当前大小: ${(
            fileContent.length /
            (1024 * 1024)
          ).toFixed(2)}MB`,
        },
        { status: 400 }
      );
    }

    // 生成唯一文件名
    const fileExtension = contentType.split("/")[1] || "png";
    const fileName = `${uuidv4()}.${fileExtension}`;

    // 构建包含目录的完整路径
    const filePath = directory.endsWith("/")
      ? `${directory}${fileName}`
      : `${directory}/${fileName}`;

    // 上传到 R2
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "";
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: filePath,
        Body: fileContent,
        ContentType: contentType,
      })
    );

    // 构建公共访问 URL
    const publicUrl = `${process.env.CLOUDFLARE_PUBLIC_URL_PREFIX}/${filePath}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
      filePath: filePath,
    });
  } catch (error: any) {
    console.error("上传URL图片时出错:", error);
    // 提供更详细的错误信息
    return NextResponse.json(
      {
        error: "上传URL图片时出错",
        message: error.message || "未知错误",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
