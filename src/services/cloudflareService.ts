// 创建 Cloudflare 文件上传服务
export const createCloudflareService = (api: {
  get: <T>(url: string, params?: any) => Promise<T>;
  post: <T>(url: string, data?: any, config?: any) => Promise<T>;
}) => {
  const obj = {
    // 上传文件到 Cloudflare R2
    uploadFile: (
      file: File,
      directory?: string
    ): Promise<{
      success: boolean;
      url: string;
      fileName: string;
      filePath: string;
    }> => {
      const formData = new FormData();
      formData.append("file", file);
      if (directory) {
        formData.append("directory", directory);
      }

      return api.post("/resource/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },

    // 将 base64 转换为文件后上传
    uploadImageFromBase64: (
      base64: string,
      directory?: string
    ): Promise<{
      success: boolean;
      url: string;
      fileName: string;
      filePath: string;
    }> => {
      // 从 base64 字符串中提取 MIME 类型
      const mimeMatch = base64.match(/^data:([^;]+);base64,/);
      if (!mimeMatch) {
        return Promise.reject(new Error("无效的 base64 格式"));
      }

      const mimeType = mimeMatch[1];
      const base64Data = base64.replace(/^data:[^;]+;base64,/, "");
      const byteString = atob(base64Data);

      // 将 base64 转换为 Blob
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeType });

      // 确定文件扩展名
      const extensionMap: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/webp": "webp",
      };
      const extension = extensionMap[mimeType] || "jpg";

      // 创建文件对象
      const fileName = `image_${Date.now()}.${extension}`;
      const file = new File([blob], fileName, { type: mimeType });

      // 使用已有的 uploadFile 方法上传文件
      return obj.uploadFile(file, directory);
    },

    // 获取已上传文件的信息
    getFileInfo: (
      filePathOrName: string
    ): Promise<{
      success: boolean;
      url: string;
      filePath: string;
    }> => {
      const isPath = filePathOrName.includes("/");
      const queryParam = isPath ? "filePath" : "fileName";

      return api.get(
        `/resource/upload?${queryParam}=${encodeURIComponent(filePathOrName)}`
      );
    },
  };

  return obj;
};

export default createCloudflareService;
