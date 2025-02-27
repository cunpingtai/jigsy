import { Featured, StandardAtomStatus } from "@prisma/client";
import {
  PaginatedData,
  QueryParams,
  Atom,
  CreateAtomParams,
  UpdateAtomParams,
  AtomInteraction,
  AtomGameRecord,
} from "./types";

// 创建通用的原子服务工厂函数
export const createAtomService = (api: {
  get: <T>(url: string, params?: any) => Promise<T>;
  post: <T>(url: string, data?: any) => Promise<T>;
  put: <T>(url: string, data?: any) => Promise<T>;
  del: <T>(url: string) => Promise<T>;
  patch: <T>(url: string, data?: any) => Promise<T>;
}) => {
  return {
    // 获取用户的所有原子
    getAtoms: (params?: QueryParams): Promise<PaginatedData<Atom>> => {
      return api.get(`/atoms`, params);
    },

    // 获取单个原子
    getAtomById: (id: number): Promise<Atom> => {
      return api.get(`/atom/${id}`);
    },

    // 获取单个原子
    getAtomByTitle: (title: string): Promise<Atom> => {
      return api.get(`/atom`, { title });
    },

    // 创建原子
    createAtom: (data: CreateAtomParams): Promise<Atom> => {
      return api.post("/atom", data);
    },

    // 更新原子
    updateAtomById: (id: number, data: UpdateAtomParams): Promise<Atom> => {
      return api.put(`/atom/${id}`, data);
    },

    // 删除原子
    deleteAtomById: (id: number): Promise<void> => {
      return api.del(`/atom/${id}`);
    },

    // 记录原子访问
    recordAtomVisit: (atomId: number): Promise<AtomInteraction> => {
      return api.post(`/atom/${atomId}/visit`);
    },

    // 点赞原子
    likeAtom: (atomId: number): Promise<AtomInteraction> => {
      return api.post(`/atom/${atomId}/like`);
    },

    // 取消点赞原子
    unlikeAtom: (atomId: number): Promise<void> => {
      return api.del(`/atom/${atomId}/like`);
    },

    // 收藏原子
    favoriteAtom: (atomId: number): Promise<AtomInteraction> => {
      return api.post(`/atom/${atomId}/favorite`);
    },

    // 取消收藏原子
    unfavoriteAtom: (atomId: number): Promise<void> => {
      return api.del(`/atom/${atomId}/favorite`);
    },

    // 更新原子状态
    updateAtomStatus: (
      atomId: number,
      status: StandardAtomStatus
    ): Promise<Atom> => {
      return api.patch(`/atom/${atomId}/status`, { status });
    },

    // 添加精选
    addAtomToFeatured: (
      atomId: number,
      reason: string,
      order: number
    ): Promise<Featured> => {
      return api.post(`/atom/${atomId}/featured`, { reason, order });
    },

    // 取消精选
    removeAtomFromFeatured: (atomId: number): Promise<void> => {
      return api.del(`/atom/${atomId}/featured`);
    },

    // 开始游戏
    startAtomGame: (
      atomId: number,
      meta: Record<string, any>
    ): Promise<AtomGameRecord> => {
      return api.post(`/atom/${atomId}/play`, { meta });
    },

    // 完成游戏
    completeAtomGame: (
      atomId: number,
      recordId: string,
      meta: Record<string, any>
    ): Promise<AtomGameRecord> => {
      return api.put(`/atom/${atomId}/play/${recordId}`, {
        meta,
      });
    },

    // 删除游戏记录
    deleteAtomGameRecord: (atomId: number, recordId: string): Promise<void> => {
      return api.del(`/atom/${atomId}/play/${recordId}`);
    },

    // 获取原子游戏记录
    getAtomGameRecords: (
      atomId: number,
      params?: QueryParams
    ): Promise<PaginatedData<AtomGameRecord>> => {
      return api.get(`/atom/${atomId}/play/records`, params);
    },

    // 获取用户的原子游戏记录
    getUserGameRecords: (
      params?: QueryParams
    ): Promise<PaginatedData<AtomGameRecord>> => {
      return api.get(`/user/records`, params);
    },

    // 获取分类下的原子
    getCategoryAtoms: (
      categoryId: number,
      params?: QueryParams
    ): Promise<PaginatedData<Atom>> => {
      return api.get(`/category/${categoryId}/atoms`, params);
    },

    // 获取分组下的原子
    getGroupAtoms: (
      groupId: number,
      params?: QueryParams
    ): Promise<PaginatedData<Atom>> => {
      return api.get(`/group/${groupId}/atoms`, params);
    },

    // 获取用户创建的原子
    getUserAtoms: (params?: QueryParams): Promise<PaginatedData<Atom>> => {
      return api.get(`/user/atoms`, params);
    },

    // 获取用户点赞的原子
    getUserLikedAtoms: (params?: QueryParams): Promise<PaginatedData<Atom>> => {
      return api.get(`/user/atoms/liked`, params);
    },

    // 获取用户收藏的原子
    getUserFavoriteAtoms: (
      params?: QueryParams
    ): Promise<PaginatedData<Atom>> => {
      return api.get(`/user/atoms/favorite`, params);
    },

    // 获取原子统计信息
    getAtomStats: (
      atomId: number
    ): Promise<{
      viewCount: number;
      likeCount: number;
      favoriteCount: number;
      gameCount: number;
      completionRate: number;
      averageDuration: number;
      averageMoves: number;
    }> => {
      return api.get(`/atom/${atomId}/stats`);
    },
  };
};

export default createAtomService;
