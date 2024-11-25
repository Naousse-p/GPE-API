const { School, Class } = require("../../../models");
const { getItemById, getOneItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.professor_by_school_service = async (schoolId, req) => {
  try {
    let schoolIdGood = await isIDGood(schoolId);
    const school = await getItemById(School, schoolIdGood, { path: "professor" });
    validateSchoolExistence(school);

    if (!userCanAccessSchool(school, req.userId)) {
      throw { code: 403, message: "You are not allowed to access this school" };
    }

    const userClasses = await getUserClasses(req.userId, schoolId);
    const professors = getProfessors(school, req.userId, userClasses);
    return professors;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function validateSchoolExistence(school) {
  if (!school) {
    throw { code: 404, message: "School not found" };
  }
}

function userCanAccessSchool(school, user) {
  return school.professor.some((professor) => professor.user.toString() === user);
}

async function getUserClasses(userId, schoolId) {
  const classes = await Class.find({
    school: schoolId,
  }).populate("professor");

  return classes
    .filter((classe) => {
      return classe.professor.some((professor) => professor.user.toString() === userId);
    })
    .map((classe) => classe._id.toString());
}

async function getProfessors(school, currentUserId, userClasses) {
  const classroom = await getItemById(Class, userClasses);
  return {
    schoolName: school.name,
    professor: school.professor.map((professor) => ({
      ...professor.toObject(),
      isCurrentUser: professor.user.toString() === currentUserId,
      isSameClass: userClasses.includes(professor._id.toString()),
      isVisitor: classroom.visitors.includes(professor._id.toString()),
    })),
  };
}
