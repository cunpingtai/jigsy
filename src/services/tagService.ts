import {
  PaginatedData,
  QueryParams,
  Tag,
  CreateTagParams,
  UpdateTagParams,
  Atom,
} from "./types";

// 创建标签服务工厂函数
export const createTagService = (api: {
  get: <T>(url: string, params?: any) => Promise<T>;
  post: <T>(url: string, data?: any) => Promise<T>;
  put: <T>(url: string, data?: any) => Promise<T>;
  del: <T>(url: string) => Promise<T>;
}) => {
  return {
    // 获取所有标签
    getTags: (params?: { language?: string }): Promise<Tag[]> => {
      return api.get("/tags", params);
    },

    // 获取单个标签
    getTag: (id: number): Promise<Tag> => {
      return api.get(`/tags/${id}`);
    },

    getTagByName: (
      name: string,
      params?: { page?: number; pageSize?: number }
    ): Promise<{
      id: number;
      name: string;
      description: string;
      atomsCount: number;
      data: Atom[];
      createdAt: string;
      updatedAt: string;
      posts: any[];
      postsCount: number;
      pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
      };
    }> => {
      return api.get(`/tag/${encodeURIComponent(name)}`, params);
    },

    // 创建标签
    createTag: (data: CreateTagParams): Promise<Tag> => {
      return api.post("/tags", data);
    },

    // 更新标签
    updateTag: (id: number, data: UpdateTagParams): Promise<Tag> => {
      return api.put(`/tags/${id}`, data);
    },

    // 删除标签
    deleteTag: (id: number): Promise<{ message: string }> => {
      return api.del(`/tags/${id}`);
    },

    // 搜索标签
    searchTags: (
      query: string,
      params?: { language?: string }
    ): Promise<Tag[]> => {
      return api.get(`/tags/search?q=${encodeURIComponent(query)}`, params);
    },
  };
};

export default createTagService;
