const { Professor } = require("../../../models");
const { getOneItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.professor_by_id_service = async (userId, req) => {
  try {
    let professorUserIdGood = await isIDGood(userId);
    const professor = await getOneItem(Professor, { user: professorUserIdGood });
    validateProfessorExistence(professor);

    if (!userCanAccessProfessor(professor, req.userId)) {
      throw { code: 403, message: "You are not allowed to access this professor" };
    }

    return professor;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function validateProfessorExistence(professor) {
  if (!professor) {
    throw { code: 404, message: "Professor not found" };
  }
}

function userCanAccessProfessor(professor, user) {
  return professor.user.toString() === user;
}
