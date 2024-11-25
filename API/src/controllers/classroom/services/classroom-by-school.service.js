const { Class, School } = require("../../../models");
const { getItemById, getItems } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.classroom_by_school_service = async (schoolId, req) => {
  try {
    isIDGood(schoolId);
    const school = await getItemById(School, schoolId, "professor");
    validateSchoolExistence(school);

    if (!userHasAccessToSchool(school, req.userId)) {
      throw { code: 403, message: "You are not allowed to access this school" };
    }

    const classrooms = await getItems(Class, { school: schoolId }, "professor");
    return classrooms;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function validateSchoolExistence(school) {
  if (!school) {
    throw { code: 404, message: "School not found" };
  }
}

function userHasAccessToSchool(school, user) {
  return school.professor.some((professor) => professor.user.toString() === user);
}
