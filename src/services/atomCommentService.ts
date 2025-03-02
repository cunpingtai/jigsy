import { AtomCommentResponse } from "./types";

// 创建通用的原子评论服务工厂函数
export const createAtomCommentService = (api: {
  get: <T>(url: string, params?: any) => Promise<T>;
  post: <T>(url: string, data?: any) => Promise<T>;
  put: <T>(url: string, data?: any) => Promise<T>;
  del: <T>(url: string) => Promise<T>;
  patch: <T>(url: string, data?: any) => Promise<T>;
}) => {
  return {
    // 获取原子评论列表
    getComments: (atomId: number, params?: any) => {
      return api.get<AtomCommentResponse>(`/atom/${atomId}/comment`, params);
    },

    // 创建评论
    createComment: (atomId: number, content: string) => {
      return api.post<any>(`/atom/${atomId}/comment`, { content });
    },

    // 获取单个评论
    getComment: (atomId: number, commentId: number) => {
      return api.get<AtomCommentResponse>(
        `/atom/${atomId}/comment/${commentId}`
      );
    },

    // 更新评论
    updateComment: (atomId: number, commentId: number, content: string) => {
      return api.put<any>(`/atom/${atomId}/comment/${commentId}`, {
        content,
      });
    },

    // 删除评论
    deleteComment: (atomId: number, commentId: number) => {
      return api.del<any>(`/atom/${atomId}/comment/${commentId}`);
    },

    // 回复评论
    replyToComment: (atomId: number, commentId: number, content: string) => {
      return api.post<any>(`/atom/${atomId}/comment/${commentId}/reply`, {
        content,
      });
    },

    // 获取评论回复
    getCommentReplies: (atomId: number, commentId: number, params?: any) => {
      return api.get<any>(`/atom/${atomId}/comment/${commentId}/reply`, params);
    },

    // 点赞评论
    likeComment: (atomId: number, commentId: number) => {
      return api.post<any>(`/atom/${atomId}/comment/${commentId}/like`);
    },

    // 取消点赞评论
    unlikeComment: (atomId: number, commentId: number) => {
      return api.del<any>(`/atom/${atomId}/comment/${commentId}/like`);
    },

    // 获取评论点赞状态
    getCommentLikeStatus: (atomId: number, commentId: number) => {
      return api.get<any>(`/atom/${atomId}/comment/${commentId}/like`);
    },
  };
};

export default createAtomCommentService;
