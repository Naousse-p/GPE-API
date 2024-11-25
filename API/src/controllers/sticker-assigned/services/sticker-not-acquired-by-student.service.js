const { Student, Sticker, AcquiredSticker } = require("../../../models");
const { getItemById, getItems } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.sticker_not_acquired_by_student_service = async (studentId, req) => {
  try {
    const studentItemId = await validateStudentId(studentId);

    const student = await getStudentById(studentItemId);
    validateStudentExistence(student);

    if (!userHasAccessToSticker(student, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }
    const stickers = await getStickersNotAcquiredByStudent(student);
    return stickers;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateStudentId = async (id) => {
  return isIDGood(id);
};

const getStudentById = async (id) => {
  return getItemById(Student, id, { path: "class", populate: { path: "professor" } });
};

const validateStudentExistence = (student) => {
  if (!student) {
    throw { code: 404, message: "Student not found" };
  }
};

const userHasAccessToSticker = (student, userId) => {
  return student.class.professor.some((professor) => professor.user.toString() === userId);
};

const getStickersNotAcquiredByStudent = async (student) => {
  const acquiredStickers = await getItems(AcquiredSticker, { student: student._id }, "sticker");
  const MissingStickers = await getItems(Sticker, { _id: { $nin: acquiredStickers.map((acquiredSticker) => acquiredSticker.sticker) }, class: student.class }, "class");
  return MissingStickers;
};
