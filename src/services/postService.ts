// 创建通用的文章服务工厂函数
export const createPostService = (api: {
  get: <T>(url: string, params?: any) => Promise<T>;
  post: <T>(url: string, data?: any) => Promise<T>;
  put: <T>(url: string, data?: any) => Promise<T>;
  del: <T>(url: string) => Promise<T>;
  patch: <T>(url: string, data?: any) => Promise<T>;
}) => {
  return {
    // 获取文章列表
    getPosts: (params?: any) => {
      return api.get<any>("/posts", params);
    },

    // 获取单个文章
    getPost: (postId: number) => {
      return api.get<any>(`/posts/${postId}`);
    },

    // 创建文章
    createPost: (data: any) => {
      return api.post<any>("/posts", data);
    },

    // 更新文章
    updatePost: (postId: number, data: any) => {
      return api.put<any>(`/posts/${postId}`, data);
    },

    // 删除文章
    deletePost: (postId: number) => {
      return api.del<any>(`/posts/${postId}`);
    },

    // 点赞文章
    likePost: (postId: number) => {
      return api.post<any>(`/posts/${postId}/like`);
    },

    // 取消点赞文章
    unlikePost: (postId: number) => {
      return api.del<any>(`/posts/${postId}/like`);
    },

    // 获取文章点赞状态
    getPostLikeStatus: (postId: number) => {
      return api.get<any>(`/posts/${postId}/like`);
    },

    // 获取文章评论
    getPostComments: (postId: number, params?: any) => {
      return api.get<any>(`/posts/${postId}/comment`, params);
    },

    // 创建文章评论
    createPostComment: (postId: number, content: string) => {
      return api.post<any>(`/posts/${postId}/comment`, { content });
    },

    // 更新文章评论
    updatePostComment: (commentId: number, content: string) => {
      return api.put<any>(`/comment/${commentId}`, {
        content,
      });
    },

    // 删除文章评论
    deletePostComment: (commentId: number) => {
      return api.del<any>(`/comment/${commentId}`);
    },

    // 点赞文章评论
    likePostComment: (commentId: number) => {
      return api.post<any>(`/comment/${commentId}/like`);
    },

    // 取消点赞文章评论
    unlikePostComment: (commentId: number) => {
      return api.del<any>(`/comment/${commentId}/like`);
    },

    // 获取精选文章
    getFeaturedPosts: (params?: any) => {
      return api.get<any>("/post/featureds", params);
    },

    // 设置文章为精选
    addPostToFeatured: (postId: number, reason?: string, order?: number) => {
      return api.post<any>(`/posts/${postId}/featured`, { reason, order });
    },

    // 取消文章精选
    removePostFromFeatured: (postId: number) => {
      return api.del<any>(`/posts/${postId}/featured`);
    },

    // 创建评论回复
    createCommentReply: (commentId: number, content: string) => {
      return api.post<any>(`/comment/${commentId}/reply`, { content });
    },
  };
};

export default createPostService;
