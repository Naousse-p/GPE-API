const { Class, Student, Parent, School } = require("../../../models");
const { getItems, getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.classroom_members_service = async (id, req) => {
  try {
    isIDGood(id);
    const classroom = await getItemById(Class, id, "professor visitors school");
    validateClassExistence(classroom);

    if (!(await userHasAccessToClassroom(classroom, req.userId))) {
      throw { code: 403, message: "You are not allowed to access this classroom" };
    }

    const members = await getStudentsForClassroom(id);
    return members;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function validateClassExistence(classroom) {
  if (!classroom) {
    throw { code: 404, message: "Classroom not found" };
  }
}

async function userHasAccessToClassroom(classroom, userId) {
  // Vérifier si l'utilisateur est un professeur de la classe
  if (classroom.professor.some((professor) => professor.user.toString() === userId)) {
    return true;
  }

  // Vérifier si l'utilisateur est un visiteur de la classe
  if (classroom.visitors.some((visitor) => visitor.user.toString() === userId)) {
    return true;
  }

  // Récupérer l'école associée à la classe
  const school = await getItemById(School, classroom.school);
  if (!school) {
    throw { code: 404, message: "School not found" };
  }

  // Vérifier si l'utilisateur est le directeur de l'école
  if (school.director && school.director.toString() === userId) {
    return true;
  }

  return false;
}

async function getStudentsForClassroom(classroomId) {
  const members = await getItems(Student, { class: classroomId }, "parent");

  await Parent.populate(members, {
    path: "parent.user",
    select: "email lastLogin",
  });

  members.forEach((student) => {
    student.parent.forEach((parent) => {
      if (parent.user) {
        parent.email = parent.user.email;
        parent.lastLogin = parent.user.lastLogin;
      }
    });
  });

  return members;
}
