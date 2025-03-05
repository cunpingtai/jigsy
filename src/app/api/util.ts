import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function getCurrentUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (!user) {
    return null;
  }

  return user;
}

export async function currentUserId() {
  const user = await getCurrentUser();
  return user?.id;
}

export const uploadImage = async (
  file: File,
  directory: string = "images/profile"
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("directory", directory);

  const response = await fetch("/api/resource/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (data.success) {
    // 使用返回的图片URL
    console.log("上传成功，图片URL:", data.url);
    console.log("文件路径:", data.filePath);
  } else {
    console.error("上传失败:", data.error);
  }
};

export const getImageInfo = async (filePath: string) => {
  const response = await fetch(`/api/resource/upload?filePath=${filePath}`);
  const data = await response.json();

  if (data.success) {
    console.log("图片URL:", data.url);
  } else {
    console.error("获取图片信息失败:", data.error);
  }
};
