import axios, { get, post, put, del, patch } from "./api";
import createUserService from "../userService";
import createCategoryService from "../categoryService";
import createGroupService from "../groupService";
import createAtomService from "../atomService";
import createTagService from "../tagService";
import createFeatureService from "../featureService";
import createAtomCommentService from "../atomCommentService";
import createPostService from "../postService";

// 创建客户端用户服务
const userService = createUserService({ get, post, put, del, patch });
const categoryService = createCategoryService({ get, post, put, del, patch });
const groupService = createGroupService({ get, post, put, del, patch });
const atomService = createAtomService({ get, post, put, del, patch });
const tagService = createTagService({ get, post, put, del });
const featureService = createFeatureService({ get, post, put, del, patch });
const atomCommentService = createAtomCommentService({
  get,
  post,
  put,
  del,
  patch,
});
const postService = createPostService({ get, post, put, del, patch });
export {
  axios,
  get,
  post,
  put,
  del,
  patch,
  userService,
  postService,
  categoryService,
  groupService,
  atomService,
  tagService,
  featureService,
  atomCommentService,
};
