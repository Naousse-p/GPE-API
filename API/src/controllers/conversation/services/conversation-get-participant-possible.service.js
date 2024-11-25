const { Class, Parent } = require("../../../models");
const { getOneItem, getItems } = require("../../../utils/db-generic-services.utils");

//  return a list of users with whom the current user can have a conversation
exports.conversation_get_participant_possible_service = async (classId, req) => {
  try {
    return getUserThanCanBeAdd(classId, req.userId, req);
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const getUserThanCanBeAdd = async (classId, userId, req) => {
  const [parents, teacher] = await Promise.all([getParentOfTheClass(classId), getTeacherOfTheClass(classId, req.userId, req.role)]);
  return getUsersThanCanBeAdd(classId, parents, teacher, userId, req.role);
};

const getParentOfTheClass = async (classId) => {
  return await getItems(Parent, { children: { $elemMatch: { class: classId } } });
};

const getTeacherOfTheClass = async (classId, userId, role) => {
  const teacher = await getOneItem(Class, { _id: classId }, { path: "professor" });
  return teacher;
};

const getUsersThanCanBeAdd = async (classId, parents, teacher, userId, userRole) => {
  let parentsList = [];
  let teachersList = [];

  for (const parent of parents) {
    if (userRole.includes("parents") && parent.user.toString() === userId) {
      continue; // Exclure le parent actuel
    }
    parentsList.push({ user: parent.user, role: "parent", lastname: parent.lastname, firstname: parent.firstname });
  }

  if (teacher && !userRole.includes("professor")) {
    if (Array.isArray(teacher.professor)) {
      teacher.professor.forEach((prof) => {
        teachersList.push({ user: prof.user, role: "professor", lastname: prof.lastname, firstname: prof.firstname });
      });
    }
  } else if (teacher && userRole.includes("professor")) {
    // Exclure l'enseignant connecté
    if (Array.isArray(teacher.professor)) {
      teacher.professor.forEach((prof) => {
        if (prof.user.toString() !== userId) {
          teachersList.push({ user: prof.user, role: "professor", lastname: prof.lastname, firstname: prof.firstname });
        }
      });
    }
  }

  return { parents: parentsList, teachers: teachersList };
};
