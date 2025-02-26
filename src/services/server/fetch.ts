// 创建不走代理的 fetch 函数
export const directFetch = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  // 确保完整的 URL（包含协议和主机名）
  if (!url.startsWith("http")) {
    throw new Error("directFetch 需要完整的 URL，包含协议和主机名");
  }

  const fetchOptions: RequestInit = {
    ...options,
    // 关键设置：不使用代理
    mode: "cors",
    credentials: "include",
    cache: "no-store",
    redirect: "follow",
  };

  console.log("直连 fetch 请求:", url);

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    // 处理错误响应
    const errorData = await response.json().catch(() => ({}));
    console.error(`API 请求失败: ${response.status}`, response.url, errorData);
    throw new Error(errorData.message || `请求失败: ${response.status}`);
  }

  return response.json();
};
