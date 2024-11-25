const { Class } = require("../../../models");
const { getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.professor_by_class_service = async (classId, req) => {
  try {
    let classIdGood = await isIDGood(classId);
    const classRoom = await getItemById(Class, classIdGood, { path: "professor" });
    validateClassExistence(classRoom);

    if (!userCanAccessClass(classRoom, req.userId)) {
      throw { code: 403, message: "You are not allowed to access this class" };
    }

    const professors = getProfessors(classRoom);
    return professors;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function validateClassExistence(classRoom) {
  if (!classRoom) {
    throw { code: 404, message: "Class not found" };
  }
}

function userCanAccessClass(classRoom, user) {
  return classRoom.professor.some((professor) => professor.user.toString() === user);
}

function getProfessors(classRoom) {
  return classRoom.professor;
}
