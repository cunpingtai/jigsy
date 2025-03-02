import { cookies, headers } from "next/headers";
import { directFetch } from "./fetch";
// 服务端 API 基础 URL
const API_BASE_URL = process.env.SERVER_API_BASE_URL || "/api";

// 创建请求头
const createHeaders = async () => {
  const headersList = await headers();
  const cookieStore = await cookies();

  // 获取服务端 cookie 中的 token
  const token = cookieStore.get("token")?.value;

  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Cookie: cookieStore.toString(),
  };

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  // 可以从客户端请求中转发一些头信息
  const forwardHeaders = ["x-forwarded-for", "user-agent"];
  forwardHeaders.forEach((header) => {
    const value = headersList.get(header);
    if (value) {
      requestHeaders[header] = value;
    }
  });

  return requestHeaders;
};

// 处理响应
const handleResponse = async <T>(response: T): Promise<T> => {
  return response;
};

// 封装 GET 请求
export const get = async <T = any>(
  url: string,
  params?: Record<string, any>
): Promise<T> => {
  // 确保 URL 以 / 开头
  const normalizedUrl = url.startsWith("/") ? url : `/${url}`;

  const queryString = params
    ? `?${new URLSearchParams(params as any).toString()}`
    : "";

  const fullUrl = `${API_BASE_URL}${normalizedUrl}${queryString}`;

  console.log("服务端 GET 请求:", fullUrl);

  const response = await directFetch(fullUrl, {
    method: "GET",
    headers: await createHeaders(),
    cache: "no-store", // 禁用缓存，确保获取最新数据
    next: { revalidate: 0 }, // 确保不使用缓存
  });

  return handleResponse<T>(response);
};

// 封装 POST 请求
export const post = async <T = any>(url: string, data?: any): Promise<T> => {
  // 确保 URL 以 / 开头
  const normalizedUrl = url.startsWith("/") ? url : `/${url}`;

  const fullUrl = `${API_BASE_URL}${normalizedUrl}`;
  console.log("服务端 POST 请求:", fullUrl);

  const response = await directFetch(fullUrl, {
    method: "POST",
    headers: await createHeaders(),
    body: data ? JSON.stringify(data) : undefined,
    cache: "no-store",
    next: { revalidate: 0 },
  });

  return handleResponse<T>(response);
};

// 封装 PATCH 请求
export const patch = async <T = any>(url: string, data?: any): Promise<T> => {
  // 确保 URL 以 / 开头
  const normalizedUrl = url.startsWith("/") ? url : `/${url}`;

  const fullUrl = `${API_BASE_URL}${normalizedUrl}`;
  console.log("服务端 PATCH 请求:", fullUrl);

  const response = await directFetch(fullUrl, {
    method: "PATCH",
    headers: await createHeaders(),
    body: data ? JSON.stringify(data) : undefined,
    cache: "no-store",
    next: { revalidate: 0 },
  });

  return handleResponse<T>(response);
};

// 封装 PUT 请求
export const put = async <T = any>(url: string, data?: any): Promise<T> => {
  // 确保 URL 以 / 开头
  const normalizedUrl = url.startsWith("/") ? url : `/${url}`;

  const fullUrl = `${API_BASE_URL}${normalizedUrl}`;
  console.log("服务端 PUT 请求:", fullUrl);

  const response = await directFetch(fullUrl, {
    method: "PUT",
    headers: await createHeaders(),
    body: data ? JSON.stringify(data) : undefined,
    cache: "no-store",
    next: { revalidate: 0 },
  });

  return handleResponse<T>(response);
};

// 封装 DELETE 请求
export const del = async <T = any>(url: string): Promise<T> => {
  // 确保 URL 以 / 开头
  const normalizedUrl = url.startsWith("/") ? url : `/${url}`;

  const fullUrl = `${API_BASE_URL}${normalizedUrl}`;
  console.log("服务端 DELETE 请求:", fullUrl);

  const response = await directFetch(fullUrl, {
    method: "DELETE",
    headers: await createHeaders(),
    cache: "no-store",
    next: { revalidate: 0 },
  });

  return handleResponse<T>(response);
};
