const { Parent, Student } = require("../../../models");
const { getItemById, getItems } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.parent_by_student_service = async (studentId, req) => {
  try {
    const studentItemId = await isIDGood(studentId);
    const student = await getItemById(Student, studentItemId, { path: "class", populate: { path: "professor" } });
    validateStudentExistence(student);

    if (!userHasPermissionForStudent(student, req.userId, req.role, req)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const parents = await getParentsWithChildrenForStudent(studentItemId);
    return parents;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function validateStudentExistence(student) {
  if (!student) {
    throw { code: 404, message: "Student not found" };
  }
}

function userHasPermissionForStudent(student, userId, role, req) {
  if (role.includes("parent")) {
    return userHasPermissionForParent(student, userId);
  } else if (role.includes("professor")) {
    return userHasPermissionForProfessor(student, userId);
  }
  return false;
}

function userHasPermissionForParent(student, userId) {
  return student.parents.some((parent) => parent.user.toString() === userId);
}

function userHasPermissionForProfessor(student, userId) {
  return student.class.professor.some((professor) => professor.user.toString() === userId);
}

async function getParentsWithChildrenForStudent(studentId) {
  const parents = await getItems(Parent, { children: { $elemMatch: { child: studentId } } });
  return parents;
}
