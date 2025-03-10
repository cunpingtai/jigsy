// 分页请求参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 分页响应数据
export interface PaginatedData<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  sort: SortParams;
  filters: FilterParams;
}

// 排序参数
export interface SortParams {
  field: string;
  order: "ascend" | "descend" | undefined;
}

// 过滤参数
export interface FilterParams {
  [key: string]: any;
}

// 查询参数
export interface QueryParams extends Partial<PaginationParams> {
  sort?: SortParams;
  filters?: FilterParams;
  [key: string]: any;
}

// 用户接口
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// 创建用户参数
export interface CreateUserParams {
  name: string;
  email: string;
}

// 更新用户参数
export interface UpdateUserParams {
  name?: string;
  email?: string;
  avatar?: string;
}

// 分类接口
export interface Category {
  id: number;
  name: string;
  description?: string;
  groupsCount?: number;
  atomsCount?: number;
  groups: any[];
  createdAt: string;
  updatedAt: string;
}

// 创建分类参数
export interface CreateCategoryParams {
  name: string;
  description?: string;
  language: string;
}

// 更新分类参数
export interface UpdateCategoryParams {
  newName?: string;
  description?: string;
}

// 分组接口
export interface Group {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  category?: Category;
  atomsCount?: number;
  atoms?: any[];
  createdAt: string;
  updatedAt: string;
}

// 创建分组参数
export interface CreateGroupParams {
  name: string;
  description?: string;
  categoryId: number;
  language: string;
}

// 更新分组参数
export interface UpdateGroupParams {
  name?: string;
  description?: string;
  categoryId?: number;
}

// 原子接口
export interface Atom {
  id: number;
  title: string;
  content: string;
  coverImage: string;
  status: string;
  userId: number;
  user?: User;
  tags?: { tag: Tag }[];
  categoryId?: number;
  category?: Category;
  groupId?: number;
  group?: Group;
  viewCount: number;
  likesCount: number;
  favoritesCount: number;
  isLiked: boolean;
  isFavorited: boolean;
  config?: AtomConfig;
  createdAt: string;
  isFeatured: boolean;
  updatedAt: string;
}

// 原子配置接口
export interface AtomConfig {
  tilesX: number;
  tilesY: number;
  width: number;
  height: number;
  seed: number;
  tabSize: number;
  jitter: number;
  lineColor: string;
  lineWidth: number;
  background: string;
  distributionStrategy: string;
  [key: string]: any;
}

// 创建原子参数
export interface CreateAtomParams {
  title: string;
  content: string;
  coverImage: string;
  categoryId?: number;
  groupId?: number;
  tilesX?: number;
  tilesY?: number;
  width?: number;
  height?: number;
  seed?: number;
  tabSize?: number;
  jitter?: number;
  lineColor?: string;
  lineWidth?: number;
  background?: string;
  distributionStrategy?: string;
  [key: string]: any;
}

// 更新原子参数
export interface UpdateAtomParams {
  title?: string;
  content?: string;
  coverImage?: string;
  status?: string;
  categoryId?: number;
  groupId?: number;
  config?: Partial<AtomConfig>;
  [key: string]: any;
}

// 原子互动记录类型
export interface AtomInteraction {
  id: number;
  atomId: number;
  userId: number;
  type: string; // VIEW, LIKE, FAVORITE, GAME
  createdAt: string;
}

// 原子游戏记录
export interface AtomGameRecord {
  message: string;
  record: {
    id: number;
    atomId: number;
    meta: Record<string, any>;
    createdAt: string;
  };
}

// 标签接口
export interface Tag {
  id: number;
  // tagId: number;
  name: string;
  description?: string;
  atomsCount?: number;
  postsCount?: number;
  data: any[];
  posts: any[];
  createdAt: string;
  updatedAt: string;
}

// 创建标签参数
export interface CreateTagParams {
  name: string;
  description?: string;
  language: string;
}

// 更新标签参数
export interface UpdateTagParams {
  name?: string;
  description?: string;
}

// 精选原子类型
export interface AtomFeatured {
  id: number;
  reason: string;
  featuredAt: string;
  atom: {
    coverImage: string;
    id: number;
    title: string;
    tags: Tag[];
    content: string;
    user: User;
    commentsCount: number;
    likesCount: number;
    createdAt: string;
    updatedAt: string;
  };
}

// 精选帖子类型
export interface PostFeatured {
  id: number;
  reason: string;
  featuredAt: string;
  post: {
    id: number;
    title: string;
    content: string;
    user: User;
    commentsCount: number;
    likesCount: number;
    createdAt: string;
    updatedAt: string;
  };
}

// 评论用户信息
export interface CommentUser {
  id: number;
  name: string;
  avatar?: string;
}

// 评论回复类型
export interface CommentReply {
  id: number;
  content: string;
  user: CommentUser;
  createdAt: string;
  updatedAt: string;
}

// 原子评论类型
export interface AtomComment {
  id: number;
  content: string;
  user: CommentUser;
  likesCount: number;
  repliesCount: number;
  isLiked: boolean;
  replies?: CommentReply[];
  createdAt: string;
  updatedAt: string;
}

// 评论创建参数
export interface CreateCommentParams {
  content: string;
  parentId?: number;
}

// 评论更新参数
export interface UpdateCommentParams {
  content: string;
}

// 评论点赞状态
export interface CommentLikeStatus {
  liked: boolean;
  likesCount: number;
}

// 文章类型
export interface Post {
  id: number;
  isLiked: boolean;
  title: string;
  content: string;
  coverImage?: string;
  userId: number;
  user: User;
  categoryId?: number;
  category?: Category;
  tags?: Tag[];
  commentsCount: number;
  likesCount: number;
  viewsCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

// 创建文章参数
export interface CreatePostParams {
  title: string;
  content: string;
  coverImage?: string;
  categoryId?: number;
  tags?: string[];
}

// 更新文章参数
export interface UpdatePostParams {
  title?: string;
  content?: string;
  coverImage?: string;
  categoryId?: number;
  tags?: string[];
}

// 文章评论类型
export interface PostComment {
  id: number;
  content: string;
  postId: number;
  userId: number;
  user: CommentUser;
  parentId?: number;
  likesCount: number;
  isLiked: boolean;
  replies?: PostComment[];
  createdAt: string;
  updatedAt: string;
}

// 文章点赞状态
export interface PostLikeStatus {
  liked: boolean;
  likesCount: number;
}

export type AtomCommentResponse = {
  data: AtomComment[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

// AI 解析响应类型
type QAType = {
  question: string;
  title: string;
  answer: string;
};

export type ParsedResponse = Record<string, QAType>;
