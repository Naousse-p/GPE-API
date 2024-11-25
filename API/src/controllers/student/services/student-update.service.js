const { Student } = require("../../../models");
const { getItemById, updateItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { saveSourceFile } = require("../../../utils/multer");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

exports.student_update_service = async (id, data, req) => {
  try {
    const studentId = await validateStudentId(id);
    const student = await getStudentById(studentId);
    validateStudentExistence(student);
    if (!userHasPermissionForStudent(student, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }
    const updateData = await prepareUpdateData(data, student, req);
    const updatedStudent = await updateStudent(studentId, updateData);
    return updatedStudent;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function userHasPermissionForStudent(student, userId) {
  for (const professor of student.class.professor) {
    if (professor.user.toString() === userId) {
      return true;
    }
  }
  return false;
}

async function validateStudentId(id) {
  return await isIDGood(id);
}

async function getStudentById(id) {
  return await getItemById(Student, id, { path: "class", populate: { path: "professor" } });
}

function validateStudentExistence(student) {
  if (!student) {
    throw { code: 404, message: "Student not found" };
  }
}

async function prepareUpdateData(data, student, req) {
  const { firstname, lastname, birthdate, sexe, level, classId } = data;

  const updateData = {};
  if (!firstname && !lastname && !birthdate && !sexe && !level && !classId && !req.file?.buffer) {
    throw { code: 422, message: "No data to update" };
  }

  if (firstname) updateData.firstname = firstname;
  if (lastname) updateData.lastname = lastname;
  if (birthdate) updateData.birthdate = birthdate;
  if (sexe) updateData.sexe = sexe;
  if (level) updateData.level = level;
  if (classId) updateData.class = classId;

  if (req.file?.buffer) {
    const md5 = calculateMD5(req.file.buffer, firstname, birthdate, lastname, classId);
    const existingStudent = await Student.findOne({ md5 });
    if (existingStudent) {
      throw { code: 409, message: "Student already exists" };
    }

    const uploadDir = path.join(__dirname, "../../../", "uploads/student");
    const existingFilePath = path.join(uploadDir, student.source);
    if (fs.existsSync(existingFilePath)) {
      fs.unlinkSync(existingFilePath);
    }
    updateData.md5 = md5;
    const filePath = await saveSourceFile(req.file.buffer, student._id, "student", "jpg", false);
    updateData.source = filePath;
  }

  return updateData;
}

const calculateMD5 = (fileBuffer, firstname, birthdate, lastname, classItemId) => {
  return crypto
    .createHash("md5")
    .update(fileBuffer + firstname + birthdate + lastname + classItemId)
    .digest("hex");
};

async function updateStudent(id, data) {
  return await updateItem(Student, id, data);
}
