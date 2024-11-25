const { WallpostComment, Parent, Professor } = require("../../../models");
const { getItemById, updateItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.wallpost_update_comment_service = async (commentId, newContent, req) => {
  try {
    const commentItemId = await validateCommentId(commentId);
    const commentItem = await getCommentById(commentItemId);
    validateCommentExistence(commentItem);

    if (!isUserAuthorizedToUpdateComment(commentItem, req)) {
      throw { code: 403, message: "Vous n'avez pas la permission de modifier ce commentaire" };
    }

    const updatedComment = await updateCommentContent(commentItemId, newContent);
    return updatedComment;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateCommentId = async (id) => {
  const isValid = await isIDGood(id);
  if (!isValid) {
    throw { code: 422, message: "L'identifiant du commentaire est invalide" };
  }
  return id;
};

const getCommentById = async (id) => {
  const comment = await getItemById(WallpostComment, id, "professor parent");
  if (!comment) {
    throw { code: 404, message: "Commentaire non trouvé" };
  }
  return comment;
};

const validateCommentExistence = (commentItem) => {
  if (!commentItem) {
    throw { code: 404, message: "Commentaire non trouvé" };
  }
};

const isUserAuthorizedToUpdateComment = (commentItem, req) => {
  if (req.role.includes("professor") && commentItem.professor && commentItem.professor.user.toString() === req.userId) {
    return true;
  }
  if (req.role.includes("parents") && commentItem.parent && commentItem.parent.user.toString() === req.userId) {
    return true;
  }
  return false;
};

const updateCommentContent = async (commentId, newContent) => {
  const updatedComment = await updateItem(WallpostComment, commentId, { content: newContent });
  return updatedComment;
};
