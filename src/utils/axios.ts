import { HOST_API, WEBSITE_ID } from "../config-global";

// 定义请求方法类型
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// 定义API端点
export const endpoints = {
  script: "c/script",
  meta: "c/meta",
  i18n: "c/i18n",
  langs: "langs",
  website: "website",
  configLangs: "c/langs",
  concat: "concat",
  subscribe: "subscribe",
  staticData: "c/STATIC_DATA",
  widget: "c/widget",
  widgetResources: "c/{name}",
  allNavigations: "all/navigations/all",
  hotNavigations: "hot-navigations",
  topNavigations: "top-navigations",
  tagNavigations: `tag/{name}/navigations`,
  navigation: `navigation/{name}`,
  info: "c/info",
  field: "c/{name}/f/{field}",
  allArticles: "allArticles",
  articles: "articles",
  navigationCategories: "navigationCategories",
  categoryNavigations: "navigations/{name}",
  categoryIdNavigations: "navigations/id/{ids}",
  tops: "tops",
  article: `article?path={path}`,
} as const;

// 环境变量
const isDev =
  process.env.NODE_ENV !== "production" || process.env.NOT_CACHE === "true";

// 错误处理
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// 基础请求函数
async function fetchWithTimeout<T>(
  input: RequestInfo,
  init?: RequestInit,
  timeout: number = 10000
): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      console.log(input);

      throw new ApiError(response.status, errorMessage || "请求失败");
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(id);
  }
}

// 创建请求实例
function createFetchInstance(baseURL: string) {
  const request = async <T>(
    method: HttpMethod,
    url: string,
    body?: any,
    options?: RequestInit
  ): Promise<T> => {
    const fullUrl = baseURL + url.replace(/^\//, "");
    const fetchOptions: RequestInit = {
      ...options,
      method,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    if (isDev) {
      fetchOptions.cache = "no-store";
    } else {
      fetchOptions.next = { revalidate: 600 };
    }

    return fetchWithTimeout<T>(fullUrl, fetchOptions);
  };

  return {
    get: <T>(url: string, options?: RequestInit) =>
      request<T>("GET", url, undefined, options),
    post: <T>(url: string, body: any, options?: RequestInit) =>
      request<T>("POST", url, body, options),
    put: <T>(url: string, body: any, options?: RequestInit) =>
      request<T>("PUT", url, body, options),
    delete: <T>(url: string, options?: RequestInit) =>
      request<T>("DELETE", url, undefined, options),
    patch: <T>(url: string, body: any, options?: RequestInit) =>
      request<T>("PATCH", url, body, options),
  };
}

// 获取特定网站的请求实例
export function getFetchInstance(id?: string) {
  const baseURL = `${HOST_API}/web-start/v1/api/nhs-client/s/${
    id || WEBSITE_ID
  }/`;
  return createFetchInstance(baseURL);
}

// 获取通用请求实例
export function getCommonFetchInstance() {
  const baseURL = `${HOST_API}/web-start/v1/api/nhs-client/`;
  return createFetchInstance(baseURL);
}

export default getFetchInstance();
