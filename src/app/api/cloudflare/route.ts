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
    // 获取表单数据
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    // 获取目录路径，如果没有提供则使用默认目录
    const directory =
      (formData.get("directory") as string) ||
      process.env.CLOUDFLARE_DEFAULT_DIRECTORY ||
      "uploads";

    // 验证文件是否存在
    if (!file) {
      return NextResponse.json({ error: "未提供文件" }, { status: 400 });
    }

    // 验证文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "不支持的文件类型，仅支持 JPEG, PNG, GIF 和 WebP" },
        { status: 400 }
      );
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "文件大小超过限制 (10MB)" },
        { status: 400 }
      );
    }

    // 生成唯一文件名
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    // 构建包含目录的完整路径
    const filePath = directory.endsWith("/")
      ? `${directory}${fileName}`
      : `${directory}/${fileName}`;

    // 读取文件内容
    const fileBuffer = await file.arrayBuffer();

    // 上传到 R2
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "";
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: filePath,
        Body: Buffer.from(fileBuffer),
        ContentType: file.type,
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
  } catch (error) {
    console.error("上传文件时出错:", error);
    return NextResponse.json({ error: "上传文件时出错" }, { status: 500 });
  }
}

// 获取已上传图片的信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("filePath");
    const fileName = searchParams.get("fileName");

    if (!filePath && !fileName) {
      return NextResponse.json(
        { error: "未提供文件路径或文件名" },
        { status: 400 }
      );
    }

    // 构建公共访问 URL
    const path = filePath || fileName;
    const publicUrl = `${process.env.CLOUDFLARE_PUBLIC_URL_PREFIX}/${path}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filePath: path,
    });
  } catch (error) {
    console.error("获取文件信息时出错:", error);
    return NextResponse.json({ error: "获取文件信息时出错" }, { status: 500 });
  }
}
