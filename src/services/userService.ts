import {
  PaginatedData,
  QueryParams,
  User,
  CreateUserParams,
  UpdateUserParams,
} from "./types";

// 创建通用的用户服务工厂函数
export const createUserService = (api: {
  get: <T>(url: string, params?: any) => Promise<T>;
  post: <T>(url: string, data?: any) => Promise<T>;
  put: <T>(url: string, data?: any) => Promise<T>;
  del: <T>(url: string) => Promise<T>;
  patch: <T>(url: string, data?: any) => Promise<T>;
}) => {
  return {
    // 获取用户列表
    getUsers: (params?: QueryParams): Promise<PaginatedData<User>> => {
      return api.get("/users", params);
    },

    // 获取单个用户
    getUserById: (id: string): Promise<User> => {
      return api.get(`/users/${id}`);
    },

    // 创建用户
    createUser: (data: CreateUserParams): Promise<User> => {
      return api.post("/users", data);
    },

    // 更新用户
    updateUserById: (id: string, data: UpdateUserParams): Promise<User> => {
      return api.put(`/users/${id}`, data);
    },
  };
};

export default createUserService;
