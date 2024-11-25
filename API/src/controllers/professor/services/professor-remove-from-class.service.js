const { Professor, Class } = require("../../../models");
const { getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.professor_remove_from_class_service = async (classId, professorId, req) => {
  try {
    let classIdGood = await isIDGood(classId);
    let professorIdGood = await isIDGood(professorId);
    const classRoom = await getItemById(Class, classIdGood, { path: "professor" });
    const professor = await getItemById(Professor, professorIdGood);
    validateClassExistence(classRoom);
    validateProfessorExistence(professor);

    if (!userCanAccessClass(classRoom, req.userId)) {
      throw { code: 403, message: "You are not allowed to access this class" };
    }

    if (!userCanAccessProfessor(professor, req.userId)) {
      throw { code: 403, message: "You are not allowed to access this professor" };
    }

    removeProfessorFromClass(classRoom, professor);
    await classRoom.save();
    return classRoom.professor;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function validateClassExistence(classRoom) {
  if (!classRoom) {
    throw { code: 404, message: "Class not found" };
  }
}

function validateProfessorExistence(professor) {
  if (!professor) {
    throw { code: 404, message: "Professor not found" };
  }
}

function userCanAccessClass(classRoom, user) {
  return classRoom.professor.some((professor) => professor.user.toString() === user);
}

function userCanAccessProfessor(professor, user) {
  return professor.user.toString() === user;
}

function removeProfessorFromClass(classRoom, professor) {
  classRoom.professor = classRoom.professor.filter((prof) => prof._id.toString() !== professor._id.toString());
}
