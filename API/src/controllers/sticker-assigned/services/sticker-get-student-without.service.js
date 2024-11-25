const { Student, Sticker, AcquiredSticker } = require("../../../models");
const { getItemById, getItems } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { get } = require("mongoose");

exports.sticker_get_student_without_service = async (stickerId, classId, req) => {
  try {
    const stickerItemId = await validateStickerId(stickerId);

    const sticker = await getStickerById(stickerItemId);
    validateStickerExistence(sticker);

    if (!userHasAccessToSticker(sticker, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const students = await getStudentsWithoutSticker(stickerItemId, classId);
    return students;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateStickerId = async (id) => {
  return isIDGood(id);
};

const getStickerById = async (id) => {
  return getItemById(Sticker, id, { path: "class", populate: { path: "professor" } });
};

const validateStickerExistence = (sticker) => {
  if (!sticker) {
    throw { code: 404, message: "Sticker not found" };
  }
};

const userHasAccessToSticker = (sticker, userId) => {
  for (const professor of sticker.class) {
    for (const prof of professor.professor) {
      if (prof.user.toString() === userId) {
        return true;
      }
    }
  }
  return false;
};

const getStudentsWithoutSticker = async (stickerId, classId) => {
  const acquiredStickers = await getItems(AcquiredSticker, { sticker: stickerId }, "student");
  const studentIds = acquiredStickers.map((acquiredSticker) => acquiredSticker.student);
  const students = await getItems(Student, { _id: { $nin: studentIds }, class: classId }, "class");
  return students;
};
