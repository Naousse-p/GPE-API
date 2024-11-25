const { WallpostComment, Class, School, Parent, Professor } = require("../../../models");
const { getItemById, deleteItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.wallpost_remove_comment_service = async (commentId, req) => {
  try {
    const commentItemId = await validateCommentId(commentId);
    const commentItem = await getCommentById(commentItemId);
    validateCommentExistence(commentItem);

    const classItem = await getClassById(commentItem.post);

    if (commentItem.parent?.user.toString() === req.userId || (await userIsProfessorOfClass(classItem, req.userId)) || (await userIsProfessorOfSchool(classItem.school, req.userId))) {
      await deleteItem(WallpostComment, commentItemId);
      return { message: "Commentaire supprimé avec succès" };
    } else {
      throw { code: 403, message: "Vous n'avez pas la permission de supprimer ce commentaire" };
    }
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
  const comment = await getItemById(WallpostComment, id, "post parent professor");
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

const getClassById = async (id) => {
  const classItem = await getItemById(Class, id.class, "professor");
  if (!classItem) {
    throw { code: 404, message: "Classe non trouvée" };
  }
  return classItem;
};

const userIsProfessorOfClass = async (classItem, userId) => {
  return classItem.professor.some((professor) => professor.user.toString() === userId);
};

const userIsProfessorOfSchool = async (schoolId, userId) => {
  const school = await School.findById(schoolId).populate("professor");
  return school.professor.some((professor) => professor.user.toString() === userId);
};
