import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// 创建客户端 axios 实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token (仅在客户端)
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理错误响应
    if (error.response) {
      // 服务器返回错误状态码
      const { status } = error.response;

      if (status === 401) {
        // 未授权，可能需要重新登录
        if (typeof window !== "undefined") {
          // 清除本地存储的认证信息
          localStorage.removeItem("token");
          // 可以在这里添加重定向到登录页面的逻辑
        }
      }
    }

    return Promise.reject(error);
  }
);

// 封装 GET 请求
export const get = <T = any>(
  url: string,
  params?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return axiosInstance
    .get(url, { params, ...config })
    .then((response: AxiosResponse<T>) => response.data);
};

export const patch = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return axiosInstance
    .patch(url, data, config)
    .then((response: AxiosResponse<T>) => response.data);
};

// 封装 POST 请求
export const post = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return axiosInstance
    .post(url, data, config)
    .then((response: AxiosResponse<T>) => response.data);
};

// 封装 PUT 请求
export const put = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return axiosInstance
    .put(url, data, config)
    .then((response: AxiosResponse<T>) => response.data);
};

// 封装 DELETE 请求
export const del = <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  return axiosInstance
    .delete(url, config)
    .then((response: AxiosResponse<T>) => response.data);
};

// 导出客户端 axios 实例
export default axiosInstance;
