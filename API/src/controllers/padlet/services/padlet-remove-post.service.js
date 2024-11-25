const { PadletPost } = require("../../../models");
const { getItemById, deleteItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const fs = require("fs");
const path = require("path");

exports.padlet_post_remove_service = async (postId, req) => {
  try {
    const postItemId = await validatePostId(postId);
    const postItem = await getItemById(PadletPost, postItemId, { path: "board", populate: { path: "class", populate: { path: "professor" } } });
    if (!postItem) {
      throw { code: 404, message: "Post not found" };
    }

    if (!userHasPermissionForPost(postItem, req.userId, req.role)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }
    if (postItem.source) {
      const filePath = getPostFilePath(postItemId, postItem.source);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await removeItems(PadletPost, postItemId);
    return { message: "Post deleted successfully" };
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function getPostFilePath(postId, file) {
  const uploadDir = path.join(__dirname, "../../../..", "uploads/padlet-posts");
  const extension = file.split(".").pop();
  const fileName = `${postId}_source.${extension}`;

  return path.join(uploadDir, fileName);
}

const validatePostId = async (id) => {
  return isIDGood(id);
};

function userHasPermissionForPost(postItem, userId, role) {
  if (role.includes("parents")) {
    throw { code: 403, message: "You don't have permission to do this" };
  } else if (role.includes("professor")) {
    return userHasPermissionForProfessor(postItem, userId);
  }
}

function userHasPermissionForProfessor(postItem, userId) {
  return postItem.board.class.professor.some((professor) => professor.user.toString() === userId);
}

const removeItems = async (model, id) => {
  await deleteItem(model, id);
};
