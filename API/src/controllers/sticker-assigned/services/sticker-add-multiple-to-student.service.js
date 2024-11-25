const { Student, Sticker, AcquiredSticker } = require("../../../models");
const { createItem, getItemById, getOneItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.sticker_add_multiple_to_student_service = async (stickersIds, studentId, req) => {
  try {
    const validatedStickerIds = await Promise.all(stickersIds.map((id) => validateStickerId(id)));
    const studentItemId = await validateStudentId(studentId);

    const student = await getStudentById(studentItemId);
    validateStudentExistence(student);

    if (!userHasAccessToStudent(req.userId, student)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const createdAcquiredStickers = [];
    for (const stickerId of validatedStickerIds) {
      const sticker = await getStickerById(stickerId);
      validateStickerExistence(sticker);
      const acquiredStickerByStudentExist = await getOneItem(AcquiredSticker, { sticker: sticker._id, student: student._id });

      handleStudentAlreadyHasSticker(acquiredStickerByStudentExist);

      if (!userHasAccessToStudentAndSticker(req.userId, student, sticker)) {
        throw { code: 403, message: "You don't have permission to access this resource" };
      }

      const acquiredSticker = createAcquiredStickerInstance(stickerId, studentId, student.level);
      const createdAcquiredSticker = await saveAcquiredStickerToDatabase(acquiredSticker);
      createdAcquiredStickers.push(createdAcquiredSticker);
    }

    return createdAcquiredStickers;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateStickerId = async (id) => {
  return isIDGood(id);
};

const validateStudentId = async (id) => {
  return isIDGood(id);
};

const getStickerById = async (id) => {
  return getItemById(Sticker, id, "class");
};

const getStudentById = async (id) => {
  return getItemById(Student, id, { path: "class", populate: { path: "professor" } });
};

const userHasAccessToStudent = (userId, student) => {
  for (const professor of student.class.professor) {
    if (professor.user.toString() === userId) {
      return true;
    }
  }

  return false;
};

const userHasAccessToStudentAndSticker = (userId, student, sticker) => {
  // Convertir student.class en un tableau s'il n'est pas déjà un tableau
  const studentClasses = Array.isArray(student.class) ? student.class : [student.class];

  // Récupérer les ID des classes où le sticker est attribué
  const stickerClassIds = sticker.class.map((classItem) => classItem._id.toString());

  // Vérifier si l'utilisateur a accès à au moins une classe où le sticker est attribué
  const hasAccessToSticker = studentClasses.some((classItem) => {
    const classId = classItem._id.toString();
    return stickerClassIds.includes(classId) && classItem.professor.some((professor) => professor.user.toString() === userId);
  });

  return hasAccessToSticker;
};

const validateStickerExistence = (sticker) => {
  if (!sticker) {
    throw { code: 404, message: "Sticker not found" };
  }
};

const validateStudentExistence = (student) => {
  if (!student) {
    throw { code: 404, message: "Student not found" };
  }
};

const handleStudentAlreadyHasSticker = (acquiredStickerByStudentExist) => {
  if (acquiredStickerByStudentExist) {
    throw { code: 409, message: "Student already has this sticker" };
  }
};

const createAcquiredStickerInstance = (stickerId, studentId, level) => {
  return new AcquiredSticker({ sticker: stickerId, student: studentId, level });
};

const saveAcquiredStickerToDatabase = async (acquiredSticker) => {
  return createItem(AcquiredSticker, acquiredSticker);
};
