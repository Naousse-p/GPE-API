const { Student, Class, School } = require("../../../models");
const { getItemById, getItems } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.student_by_class_service = async (classId, req) => {
  try {
    let classIdGood = await isIDGood(classId);
    const cls = await getItemById(Class, classIdGood, { path: "professor visitors" });
    if (!cls) {
      throw { code: 404, message: "Class not found" };
    }
    if (!(await checkUserHasPermissionForClass(cls, req.userId))) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }
    const students = await getItems(Student, { class: classIdGood });
    return students;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

async function checkUserHasPermissionForClass(cls, userId) {
  // Vérifier si l'utilisateur est un professeur de la classe
  for (const professor of cls.professor) {
    if (professor.user.toString() === userId) {
      return true;
    }
  }

  // Vérifier si l'utilisateur est un visiteur de la classe
  for (const visitor of cls.visitors) {
    if (visitor.user.toString() === userId) {
      return true;
    }
  }

  // Récupérer l'école associée à la classe
  const school = await getItemById(School, cls.school);
  if (!school) {
    throw { code: 404, message: "School not found" };
  }

  // Vérifier si l'utilisateur est le directeur de l'école
  if (school.director && school.director.toString() === userId) {
    return true;
  }

  return false;
}
