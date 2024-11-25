const { WallpostPost, Parent } = require("../../../models");
const { getItemById, getOneItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.wallpost_mark_as_read_post_service = async (postId, req) => {
  try {
    await validatePostId(postId);

    const post = await fetchPostById(postId);
    const parent = await fetchParentByUserId(req.userId);

    validateParentAccessToPost(parent, post);

    await markPostAsRead(post, parent);

    return post;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validatePostId = async (id) => {
  const isValid = await isIDGood(id);
  if (!isValid) {
    throw { code: 422, message: "L'identifiant du post est invalide" };
  }
};

const fetchPostById = async (postId) => {
  const post = await getItemById(WallpostPost, postId);
  if (!post) {
    throw { code: 404, message: "Post non trouvé" };
  }
  return post;
};

const fetchParentByUserId = async (userId) => {
  const parent = await getOneItem(Parent, { user: userId });
  if (!parent) {
    throw { code: 404, message: "Parent non trouvé" };
  }
  return parent;
};

const validateParentAccessToPost = (parent, post) => {
  const child = parent.children.find((child) => child.class.toString() === post.class.toString());
  if (!child) {
    throw { code: 403, message: "Vous n'avez pas la permission d'accéder à cette ressource" };
  }
};

const markPostAsRead = async (post, parent) => {
  if (!post.views.includes(parent._id)) {
    post.views.push(parent._id);
    await post.save();
  }
};
