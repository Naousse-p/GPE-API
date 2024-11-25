// sticker/services/student-create.service.js
const { Student, Class } = require("../../../models");
const { getOneItem, createItem, getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { saveSourceFile } = require("../../../utils/multer");

const crypto = require("crypto");

exports.student_create_service = async (lastname, firstname, sexe, birthdate, level, classId, req) => {
  try {
    const classItemId = await validateClassId(classId);
    const fileBuffer = getFileBufferFromRequest(req);

    const classroom = await getClassroomById(classItemId);
    validateClassroomExistence(classroom);

    if (!userHasPermissionForClass(classroom, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const md5 = calculateMD5(fileBuffer, firstname, birthdate, lastname, classItemId);
    await validateStudentUniqueness(md5, firstname, birthdate, lastname);

    const student = createStudentInstance(firstname, birthdate, lastname, sexe, level, classItemId, md5);
    const createdStudent = await saveStudentToDatabase(student, fileBuffer);

    return createdStudent;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateStudentUniqueness = async (md5, firstname, birthdate, lastname) => {
  const existingStudent = await getOneItem(Student, { md5, firstname, birthdate, lastname });
  if (existingStudent) {
    throw { code: 409, message: "Student already exists" };
  }
};

const saveStudentToDatabase = async (student, fileBuffer) => {
  const filePath = await saveSourceFile(fileBuffer, student._id, "student", "jpg", false);
  student.source = filePath;
  return await createItem(Student, student);
};

const validateClassId = async (id) => {
  return isIDGood(id);
};

const getClassroomById = async (id) => {
  return getItemById(Class, id, "professor");
};

const validateClassroomExistence = (classroom) => {
  if (!classroom) {
    throw { code: 404, message: "Class not found" };
  }
};

const userHasPermissionForClass = (cls, userId) => {
  for (const professor of cls.professor) {
    if (professor.user.toString() === userId) {
      return true;
    }
  }
  return false;
};

const calculateMD5 = (fileBuffer, firstname, birthdate, lastname, classItemId) => {
  return crypto
    .createHash("md5")
    .update(fileBuffer + firstname + birthdate + lastname + classItemId)
    .digest("hex");
};

const getFileBufferFromRequest = (req) => {
  if (!req.file?.buffer) {
    throw { code: 422, message: "Source file is required" };
  }
  return req.file.buffer;
};

const createStudentInstance = (firstname, birthdate, lastname, sexe, level, classId, md5) => {
  return new Student({ firstname, birthdate, lastname, sexe, level, class: classId, md5 });
};
