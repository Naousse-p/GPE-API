const { Student, School } = require("../../../models");
const { getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

const fs = require("fs");
const path = require("path");

exports.student_picture_service = async (id, req) => {
  try {
    let studentId = await isIDGood(id);
    const student = await getItemById(Student, studentId, [{ path: "class", populate: { path: "professor visitors school" } }, "parent"]);

    validateStudentExistence(student);
    const filePath = getStudentFilePath(studentId);
    const fileBuffer = fs.readFileSync(filePath);

    if (!userHasPermissionForStudent(student, req.userId, req.role, req)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }
    return fileBuffer;
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
  if (role.includes("parents")) {
    return userHasPermissionForParent(student, userId);
  } else if (role.includes("professor")) {
    return userHasPermissionForProfessor(student, userId, req);
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

async function userHasPermissionForProfessor(student, userId, req) {
  // Vérifier si l'utilisateur est un professeur de la classe
  for (const professor of student.class.professor) {
    if (professor.user.toString() === userId) {
      return true;
    }
  }

  // Vérifier si l'utilisateur est un visiteur de la classe
  for (const visitor of student.class.visitors) {
    if (visitor.user.toString() === userId) {
      return true;
    }
  }

  // Récupérer l'école associée à la classe
  const school = await getItemById(School, student.class.school);
  if (!school) {
    throw { code: 404, message: "School not found" };
  }

  // Vérifier si l'utilisateur est le directeur de l'école
  if (school.director && school.director.toString() === userId) {
    return true;
  }

  return false;
}

function getStudentFilePath(studentId) {
  const uploadDir = path.join(__dirname, "../../../..", "uploads/student");
  const fileName = `${studentId}_source.jpg`;

  const filePath = path.join(uploadDir, fileName);

  if (!fs.existsSync(filePath)) {
    throw { code: 404, message: "Image not found" };
  }
  return filePath;
}
