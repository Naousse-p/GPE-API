const { AcquiredSticker } = require("../../../models");
const { getItemById, updateItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const fs = require("fs");
const path = require("path");

exports.sticker_remove_comment_image_service = async (acquiredStickerId, req) => {
  try {
    const acquiredStickerItemId = await validateAcquiredStickerId(acquiredStickerId);

    const acquiredSticker = await getAcquiredStickerById(acquiredStickerItemId);
    validateAcquiredStickerExistence(acquiredSticker);

    if (!userHasAccessToAssigneddSticker(req.userId, acquiredSticker)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    await deleteAcquiredStickerImage(acquiredStickerItemId);
    const updatedAcquiredSticker = await updateItem(AcquiredSticker, acquiredStickerItemId, { comment: null, source: null });

    return updatedAcquiredSticker;
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
