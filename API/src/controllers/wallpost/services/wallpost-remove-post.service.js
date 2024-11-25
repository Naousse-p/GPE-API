const { WallpostPost, WallpostReaction, WallpostComment } = require("../../../models");
const { getItemById, deleteItem, getItems, deleteItems } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const fs = require("fs");
const path = require("path");

exports.wallpost_remove_post_service = async (postId, req) => {
  try {
    const postItemId = await validatePostId(postId);
    const postItem = await getItemById(WallpostPost, postItemId, { path: "class", populate: { path: "professor" } });
    if (!postItem) {
      throw { code: 404, message: "Post non trouvé" };
    }

    if (!userHasPermissionForPost(postItem, req.userId)) {
      throw { code: 403, message: "Vous n'avez pas la permission d'accéder à cette ressource" };
    }

    if (postItem.source) {
      postItem.source.forEach((file) => {
        const filePath = getPostFilePath(file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    await removeItems(WallpostPost, postItemId);

    await deleteItems(WallpostComment, { post: postItemId });
    await deleteItems(WallpostReaction, { post: postItemId });

    return { message: "Post supprimé avec succès" };
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validatePostId = async (id) => {
  return isIDGood(id);
};

const getPostFilePath = (file) => {
  const uploadDir = path.join(__dirname, "../../../..", "uploads/wallpost-posts");
  return path.join(uploadDir, file);
};

const userHasPermissionForPost = (postItem, userId) => {
  return postItem.class.professor.some((professor) => professor.user.toString() === userId);
};

const removeItems = async (model, id) => {
  await deleteItem(model, id);
};

const hasComments = async (postId) => {
  const count = await WallpostComment.countDocuments({ post: postId });
  return count > 0;
};

const hasReactions = async (postId) => {
  const count = await WallpostReaction.countDocuments({ post: postId });
  return count > 0;
};
