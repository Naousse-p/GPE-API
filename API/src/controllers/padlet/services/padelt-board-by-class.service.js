const { PadletBoard, Parent, Class, School } = require("../../../models");
const { getItems, getItemById, getOneItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.padlet_board_by_class_service = async (classId, req) => {
  try {
    const classItemId = await validateClassId(classId);
    const classItem = await getItemById(Class, classItemId, "professor visitors school");
    if (!classItem) {
      throw { code: 404, message: "Class not found" };
    }

    if (!(await userHasPermissionForClass(classItem, req.userId, req.role))) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }
    const boards = await getBoardsByClass(classItemId, req.role);
    return boards;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateClassId = async (id) => {
  return isIDGood(id);
};

const userHasPermissionForClass = async (classItem, userId, role) => {
  if (role.includes("parents")) {
    return userHasPermissionForParent(classItem, userId);
  } else if (role.includes("professor")) {
    return await userHasPermissionForProfessor(classItem, userId);
  }
};

const userHasPermissionForProfessor = async (classItem, userId) => {
  // Vérifier si l'utilisateur est un professeur de la classe
  if (classItem.professor.some((professor) => professor.user.toString() === userId)) {
    return true;
  }

  // Vérifier si l'utilisateur est un visiteur de la classe
  if (classItem.visitors.some((visitor) => visitor.user.toString() === userId)) {
    return true;
  }

  // Récupérer l'école associée à la classe
  const school = await getItemById(School, classItem.school);
  if (!school) {
    throw { code: 404, message: "School not found" };
  }

  // Vérifier si l'utilisateur est le directeur de l'école
  if (school.director && school.director.toString() === userId) {
    return true;
  }

  return false;
};

const userHasPermissionForParent = async (classItem, userId) => {
  const parent = await getOneItem(Parent, { user: userId });
  return parent.children.some((child) => child.class.toString() === classItem._id.toString());
};

const getBoardsByClass = async (classItemId, role) => {
  const query = {
    $or: [{ class: classItemId }, { sharedWithClasses: classItemId }],
  };

  if (role.includes("parents")) {
    query.visibleToParents = true;
  }

  return getItems(PadletBoard, query);
};
