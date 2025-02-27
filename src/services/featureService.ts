import {
  AtomFeatured,
  PaginatedData,
  PostFeatured,
  QueryParams,
} from "./types";

// 创建通用的精选服务工厂函数
export const createAtomService = (api: {
  get: <T>(url: string, params?: any) => Promise<T>;
  post: <T>(url: string, data?: any) => Promise<T>;
  put: <T>(url: string, data?: any) => Promise<T>;
  del: <T>(url: string) => Promise<T>;
  patch: <T>(url: string, data?: any) => Promise<T>;
}) => {
  return {
    // 获取所有精选原子
    getFeaturedAtoms: (
      params?: QueryParams
    ): Promise<PaginatedData<AtomFeatured>> => {
      return api.get(`/atom/featureds`, params);
    },

    // 获取所有精选帖子
    getFeaturedPosts: (
      params?: QueryParams
    ): Promise<PaginatedData<PostFeatured>> => {
      return api.get(`/post/featureds`, params);
    },
  };
};

export default createAtomService;
