const { WallpostPost, WallpostComment, Parent, Class, Professor } = require("../../../models");
const { createItem, getItemById, getOneItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.wallpost_create_comment_service = async (postId, content, req) => {
  try {
    const postItemId = await validatePostId(postId);
    const postItem = await getPostById(postItemId);
    validatePostExistence(postItem);

    if (!postItem.allowComments) {
      throw { code: 403, message: "Les commentaires ne sont pas autorisés pour ce post" };
    }

    const classItem = await getClassById(postItem.class);

    const userRoleField = await getUserRoleField(req, postItem, classItem);

    const comment = createCommentInstance(postItemId, req.userId, content, userRoleField);
    const createdComment = await createItem(WallpostComment, comment);

    return createdComment;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validatePostId = async (id) => {
  const isValid = await isIDGood(id);
  if (!isValid) {
    throw { code: 422, message: "L'identifiant du post est invalide" };
  }
  return id;
};

const getPostById = async (id) => {
  const post = await getItemById(WallpostPost, id);
  if (!post) {
    throw { code: 404, message: "Post non trouvé" };
  }
  return post;
};

const validatePostExistence = (postItem) => {
  if (!postItem) {
    throw { code: 404, message: "Post non trouvé" };
  }
};

const getClassById = async (id) => {
  const classItem = await getItemById(Class, id, "professor");
  if (!classItem) {
    throw { code: 404, message: "Classe non trouvée" };
  }
  return classItem;
};

const getParentByUserId = async (userId) => {
  const parent = await getOneItem(Parent, { user: userId });
  if (!parent) {
    throw { code: 404, message: "Parent non trouvé" };
  }
  return parent;
};

const parentHasChildInClass = (parent, classId) => {
  return parent.children.some((child) => child.class.toString() === classId.toString());
};

const userIsProfessorOfClass = (classItem, userId) => {
  return classItem.professor.some((professor) => professor.user.toString() === userId);
};

const getUserRoleField = async (req, postItem, classItem) => {
  if (req.role.includes("professor")) {
    if (!userIsProfessorOfClass(classItem, req.userId)) {
      throw { code: 403, message: "Vous n'avez pas la permission de commenter ce post" };
    }
    const professor = await getOneItem(Professor, { user: req.userId });
    return { professor: professor._id };
  } else if (req.role.includes("parents")) {
    if (postItem.dateTimePublish > new Date()) {
      throw { code: 403, message: "Le post n'est pas encore visible par les parents" };
    }
    const parent = await getParentByUserId(req.userId);
    if (!parentHasChildInClass(parent, classItem._id)) {
      throw { code: 403, message: "Vous n'avez pas la permission de commenter ce post" };
    }
    return { parent: parent._id };
  } else {
    throw { code: 403, message: "Vous n'avez pas la permission de commenter ce post" };
  }
};

const createCommentInstance = (postId, userId, content, userRoleField) => {
  return {
    post: postId,
    user: userId,
    content: content,
    createdAt: new Date(),
    ...userRoleField,
  };
};
