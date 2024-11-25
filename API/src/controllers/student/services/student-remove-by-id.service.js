const { Student } = require("../../../models");
const { deleteItem, getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const fs = require("fs");
const path = require("path");

exports.student_remove_by_id_service = async (id, req) => {
  try {
    const studentId = await isIDGood(id);
    const student = await getItemById(Student, studentId, { path: "class", populate: { path: "professor" } });
    validateStudentExistence(student);
    if (!userHasPermissionForStudent(student, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }
    await deleteStudentImage(studentId);
    await deleteItem(Student, studentId);

    return { message: "Student deleted successfully" };
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function validateStudentExistence(student) {
  if (!student) {
    throw { code: 404, message: "Student not found" };
  }
}

function userHasPermissionForStudent(student, userId) {
  for (const professor of student.class.professor) {
    if (professor.user.toString() === userId) {
      return true;
    }
  }

  return false;
}

async function deleteStudentImage(studentId) {
  const filePath = getStudentFilePath(studentId);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

function getStudentFilePath(studentId) {
  const uploadDir = path.join(__dirname, "../../../..", "uploads/student");
  const fileName = `${studentId}_source.jpg`;

  return path.join(uploadDir, fileName);
}
