// appreciation-delete.service.js
const { Appreciation, Student } = require("../../../models");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { getItemById, deleteItem } = require("../../../utils/db-generic-services.utils");

exports.appreciation_remove_service = async (appreciationId, req) => {
  try {
    const validatedAppreciationId = await validateAppreciationId(appreciationId);
    const appreciation = await getAppreciationById(validatedAppreciationId);
    validateAppreciationExistence(appreciation);
    const student = await getStudentById(appreciation.student);
    validateStudentExistence(student);
    checkUserPermissions(student, req.userId, req.role);
    await deleteAppreciation(validatedAppreciationId);
    return { message: "Appreciation deleted successfully" };
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateAppreciationId = async (appreciationId) => {
  return isIDGood(appreciationId);
};

const getAppreciationById = async (appreciationId) => {
  return getItemById(Appreciation, appreciationId);
};

const validateAppreciationExistence = (appreciation) => {
  if (!appreciation) {
    throw { code: 404, message: "Appreciation not found" };
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

const getStudentById = async (studentId) => {
  return getItemById(Student, studentId, [{ path: "class", populate: { path: "professor" } }, "parent"]);
};

const validateStudentExistence = (student) => {
  if (!student) {
    throw { code: 404, message: "Student not found" };
  }
};

const checkUserPermissions = (student, userId, role) => {
  if (!checkUserHasPermissionForStudent(student, userId, role)) {
    throw { code: 403, message: "You don't have permission to access this resource" };
  }
};

const deleteAppreciation = async (appreciationId) => {
  return deleteItem(Appreciation, appreciationId);
};
