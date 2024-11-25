const { Class } = require("../../../models");
const { getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.classroom_by_id_service = async (id, req) => {
  try {
    isIDGood(id);
    const classroom = await getItemById(Class, id, "professor");
    validateClassExistence(classroom);

    if (!userHasAccessToClassroom(classroom, req.userId)) {
      throw { code: 403, message: "You are not allowed to access this classroom" };
    }

    return classroom;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function validateClassExistence(classroom) {
  if (!classroom) {
    throw { code: 404, message: "Classroom not found" };
  }
}

function userHasAccessToClassroom(classroom, user) {
  return classroom.professor.some((professor) => professor.user.toString() === user);
}
