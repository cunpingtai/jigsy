import {
  PaginatedData,
  QueryParams,
  Category,
  CreateCategoryParams,
  UpdateCategoryParams,
} from "./types";

// 创建通用的分类服务工厂函数
export const createCategoryService = (api: {
  get: <T>(url: string, params?: any) => Promise<T>;
  post: <T>(url: string, data?: any) => Promise<T>;
  put: <T>(url: string, data?: any) => Promise<T>;
  del: <T>(url: string) => Promise<T>;
  patch: <T>(url: string, data?: any) => Promise<T>;
}) => {
  return {
    // 获取分类列表
    getCategories: (params?: QueryParams): Promise<PaginatedData<Category>> => {
      return api.get("/categories", params);
    },

    // 获取单个分类
    getCategoryById: (id: number): Promise<Category> => {
      return api.get(`/categories/${id}`);
    },

    // 获取单个分类（通过名称）
    getCategoryByName: (name: string): Promise<Category> => {
      return api.get(`/category/${encodeURIComponent(name)}`);
    },

    // 创建分类
    createCategory: (data: CreateCategoryParams): Promise<Category> => {
      return api.post("/categories", data);
    },

    // 更新分类
    updateCategoryById: (
      id: number,
      data: UpdateCategoryParams
    ): Promise<Category> => {
      return api.put(`/categories/${id}`, data);
    },

    // 删除分类
    deleteCategoryById: (id: number): Promise<void> => {
      return api.del(`/categories/${id}`);
    },

    // 获取分类统计信息
    getCategoryStats: (): Promise<any> => {
      return api.post("/categories/stats");
    },

    // 获取分类下的分组
    getCategoryGroups: (
      categoryId: number,
      params?: QueryParams
    ): Promise<PaginatedData<any>> => {
      return api.get(`/categories/${categoryId}/groups`, params);
    },

    // 获取分类下的原子
    getCategoryAtoms: (
      categoryId: number,
      params?: QueryParams
    ): Promise<PaginatedData<any>> => {
      return api.get(`/categories/${categoryId}/atoms`, params);
    },
  };
};

export default createCategoryService;
