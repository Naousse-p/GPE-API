const { AcquiredSticker } = require("../../../models");
const { getItemById, deleteItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const fs = require("fs");
const path = require("path");

exports.sticker_remove_from_student_service = async (body, studentId, req) => {
  try {
    if (!Array.isArray(body.AssignedStickerIds)) {
      throw { code: 400, message: "AssignedStickerIds should be an array" };
    }

    for (const AssignedStickerId of body.AssignedStickerIds) {
      const acquiredStickerItemId = await validateAcquiredStickerId(AssignedStickerId);

      const acquiredSticker = await getAcquiredStickerById(acquiredStickerItemId);
      validateAcquiredStickerExistence(acquiredSticker);

      if (!userHasAccessToAssigneddSticker(req.userId, acquiredSticker)) {
        throw { code: 403, message: "You don't have permission to access this resource" };
      }

      if (acquiredSticker.student._id.toString() !== studentId) {
        throw { code: 403, message: "The sticker does not belong to the specified student" };
      }

      await deleteAcquiredStickerImage(acquiredStickerItemId);
      await deleteItem(AcquiredSticker, acquiredStickerItemId);
    }
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateAcquiredStickerId = async (id) => {
  return isIDGood(id);
};

const getAcquiredStickerById = async (id) => {
  return getItemById(AcquiredSticker, id, { path: "student", populate: { path: "class", populate: { path: "professor" } } });
};

const validateAcquiredStickerExistence = (acquiredSticker) => {
  if (!acquiredSticker) {
    throw { code: 404, message: "Acquired sticker not found" };
  }
};

const userHasAccessToAssigneddSticker = (userId, assignedSticker) => {
  return assignedSticker.student.class.professor.some((professor) => professor.user.toString() === userId);
};

const getAssignedStickerFilePath = async (acquiredStickerId) => {
  const imagePath = path.join(__dirname, "../../../../", "uploads/comment-image");
  const fileName = `${acquiredStickerId}_source.jpg`;
  const filePath = path.join(imagePath, fileName);
  return filePath;
};

const deleteAcquiredStickerImage = async (acquiredStickerId) => {
  const filePath = await getAssignedStickerFilePath(acquiredStickerId);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
