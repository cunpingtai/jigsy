import axios, { get, post, put, del, patch } from "./api";
import createUserService from "../userService";
import createCategoryService from "../categoryService";
import createGroupService from "../groupService";
import createAtomService from "../atomService";
import createTagService from "../tagService";

// 创建客户端用户服务
const userService = createUserService({ get, post, put, del, patch });
const categoryService = createCategoryService({ get, post, put, del, patch });
const groupService = createGroupService({ get, post, put, del, patch });
const atomService = createAtomService({ get, post, put, del, patch });
const tagService = createTagService({ get, post, put, del });

export {
  axios,
  get,
  post,
  put,
  del,
  patch,
  userService,
  categoryService,
  groupService,
  atomService,
  tagService,
};
