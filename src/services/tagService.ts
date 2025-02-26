import {
  PaginatedData,
  QueryParams,
  Tag,
  CreateTagParams,
  UpdateTagParams,
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
    getTags: (): Promise<Tag[]> => {
      return api.get("/tags");
    },

    // 获取单个标签
    getTag: (id: number): Promise<Tag> => {
      return api.get(`/tags/${id}`);
    },

    // 根据名称获取标签
    getTagByName: (name: string): Promise<Tag> => {
      return api.get(`/tag/${encodeURIComponent(name)}`);
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
    searchTags: (query: string): Promise<Tag[]> => {
      return api.get(`/tags/search?q=${encodeURIComponent(query)}`);
    },
  };
};

export default createTagService;
