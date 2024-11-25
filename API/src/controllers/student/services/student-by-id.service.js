const { Student } = require("../../../models");
const { getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.student_by_id_service = async (id, req) => {
  try {
    let studentId = await isIDGood(id);
    const student = await getItemById(Student, studentId, [{ path: "class", populate: { path: "professor" } }, "parent"]);
    if (!student) {
      throw { code: 404, message: "Student not found" };
    }
    if (!checkUserHasPermissionForStudent(student, req.userId, req.role)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }
    return student;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function checkUserHasPermissionForStudent(student, userId, role) {
  if (role.includes("parents")) {
    return userHasPermissionForParent(student, userId);
  } else if (role.includes("professor")) {
    return userHasPermissionForProfessor(student, userId);
  }
}

function userHasPermissionForParent(student, userId) {
  for (const parent of student.parent) {
    if (parent.user.toString() === userId) {
      return true;
    }
  }
  return false;
}

function userHasPermissionForProfessor(student, userId) {
  for (const professor of student.class.professor) {
    if (professor.user.toString() === userId) {
      return true;
    }
  }
  return false;
}
