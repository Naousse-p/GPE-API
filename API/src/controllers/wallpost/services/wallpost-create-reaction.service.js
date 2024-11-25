const { WallpostPost, WallpostReaction, Parent, Class } = require("../../../models");
const { createItem, getItemById, getOneItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.wallpost_create_reaction_service = async (postId, emoji, req) => {
  try {
    const postItemId = await validatePostId(postId);
    const postItem = await getPostById(postItemId);
    validatePostExistence(postItem);

    const classItem = await getClassById(postItem.class);
    if (!req.role.includes("parents")) {
      throw { code: 403, message: "Seuls les parents peuvent ajouter des réactions" };
    }

    if (postItem.dateTimePublish > new Date()) {
      throw { code: 403, message: "Le post n'est pas encore visible par les parents" };
    }

    const parent = await getParentByUserId(req.userId);
    if (!parentHasChildInClass(parent, classItem._id)) {
      throw { code: 403, message: "Vous n'avez pas la permission de réagir à ce post" };
    }

    const reaction = await createReactionInstance(postItemId, parent._id, emoji);
    const createdReaction = await createItem(WallpostReaction, reaction);

    return createdReaction;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validatePostId = async (id) => {
  return isIDGood(id);
};

const getPostById = async (id) => {
  return getItemById(WallpostPost, id);
};

const validatePostExistence = (postItem) => {
  if (!postItem) {
    throw { code: 404, message: "Post non trouvé" };
  }
};

const getClassById = async (id) => {
  return getItemById(Class, id, "professor");
};

const getParentByUserId = async (userId) => {
  return getOneItem(Parent, { user: userId });
};

const parentHasChildInClass = (parent, classId) => {
  return parent.children.some((child) => child.class.toString() === classId.toString());
};

const createReactionInstance = (postId, parent, emoji) => {
  return {
    post: postId,
    parent: parent,
    emoji: emoji,
    createdAt: new Date(),
  };
};
