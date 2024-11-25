// appreciation-for-student.service.js
const { Appreciation, Student } = require("../../../models");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { getItemById } = require("../../../utils/db-generic-services.utils");

exports.appreciation_for_student_service = async (studentId, req) => {
  try {
    const validatedStudentId = await validateStudentId(studentId);
    const student = await getStudentById(validatedStudentId);
    validateStudentExistence(student);
    checkUserPermissions(student, req.userId, req.role);
    const currentSchoolYearDates = getCurrentSchoolYearDates();
    const appreciations = await getAppreciationsByRole(validatedStudentId, req.role, currentSchoolYearDates);
    return appreciations;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateStudentId = async (studentId) => {
  return isIDGood(studentId);
};

const getStudentById = async (studentId) => {
  return getItemById(Student, studentId, [{ path: "class", populate: { path: "professor" } }, "parent"]);
};

const validateStudentExistence = (student) => {
  if (!student) {
    throw { code: 404, message: "Student not found" };
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

const checkUserPermissions = (student, userId, role) => {
  if (!checkUserHasPermissionForStudent(student, userId, role)) {
    throw { code: 403, message: "You don't have permission to access this resource" };
  }
};

const getCurrentSchoolYearDates = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const startOfSchoolYear = new Date(currentYear, 8, 1); // 1er septembre
  const endOfSchoolYear = new Date(currentYear + 1, 7, 31); // 31 août de l'année suivante

  if (now < startOfSchoolYear) {
    startOfSchoolYear.setFullYear(currentYear - 1);
    endOfSchoolYear.setFullYear(currentYear);
  }

  return { startOfSchoolYear, endOfSchoolYear };
};

const getAppreciationsByRole = async (studentId, role, { startOfSchoolYear, endOfSchoolYear }) => {
  const query = {
    student: studentId,
    date: { $gte: startOfSchoolYear, $lte: endOfSchoolYear },
  };

  if (role.includes("professor")) {
    return Appreciation.find(query);
  } else if (role.includes("parents")) {
    query.published = true;
    return Appreciation.find(query);
  } else {
    throw { code: 403, message: "You don't have permission to access this resource" };
  }
};
