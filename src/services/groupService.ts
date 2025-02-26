import {
  PaginatedData,
  QueryParams,
  Group,
  CreateGroupParams,
  UpdateGroupParams,
} from "./types";

// 创建通用的分组服务工厂函数
export const createGroupService = (api: {
  get: <T>(url: string, params?: any) => Promise<T>;
  post: <T>(url: string, data?: any) => Promise<T>;
  put: <T>(url: string, data?: any) => Promise<T>;
  del: <T>(url: string) => Promise<T>;
  patch: <T>(url: string, data?: any) => Promise<T>;
}) => {
  return {
    // 获取分组列表
    getGroups: (params?: QueryParams): Promise<PaginatedData<Group>> => {
      return api.get("/groups", params);
    },

    // 获取单个分组
    getGroupById: (id: number): Promise<Group> => {
      return api.get(`/groups/${id}`);
    },

    // 获取单个分组（通过名称）
    getGroupByName: (name: string): Promise<Group> => {
      return api.get(`/group/${encodeURIComponent(name)}`);
    },

    // 创建分组
    createGroup: (data: CreateGroupParams): Promise<Group> => {
      return api.post("/groups", data);
    },

    // 更新分组
    updateGroupById: (id: number, data: UpdateGroupParams): Promise<Group> => {
      return api.put(`/groups/${id}`, data);
    },

    // 删除分组
    deleteGroupById: (id: number): Promise<void> => {
      return api.del(`/group/${id}`);
    },

    // 获取分类下的分组
    getGroupsByCategory: (
      categoryId: number,
      params?: QueryParams
    ): Promise<PaginatedData<Group>> => {
      return api.get(`/categories/${categoryId}/groups`, params);
    },

    // 获取分组下的原子
    getGroupAtoms: (
      groupId: number,
      params?: QueryParams
    ): Promise<PaginatedData<any>> => {
      return api.get(`/groups/${groupId}/atoms`, params);
    },
  };
};

export default createGroupService;
