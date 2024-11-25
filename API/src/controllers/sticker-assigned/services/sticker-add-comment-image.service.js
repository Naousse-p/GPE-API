const { AcquiredSticker } = require("../../../models");
const { getItemById, updateItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { saveSourceFile } = require("../../../utils/multer");

exports.sticker_add_comment_image_service = async (AssignedStickerId, data, req) => {
  try {
    const assignedStickerItemId = await validateAssignedStickerId(AssignedStickerId);

    const assignedSticker = await getAssignedStickerById(assignedStickerItemId);
    validateAssignedStickerExistence(assignedSticker);

    if (!userHasAccessToAssigneddSticker(req.userId, assignedSticker)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }
    const updateData = await prepareUpdateData(assignedSticker, data, req);
    const updatedAssignedSticker = await updateAssignedSticker(assignedSticker, updateData);

    return updatedAssignedSticker;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateAssignedStickerId = async (id) => {
  return isIDGood(id);
};

const getAssignedStickerById = async (id) => {
  return getItemById(AcquiredSticker, id, { path: "student", populate: { path: "class", populate: { path: "professor" } } });
};

const validateAssignedStickerExistence = (assignedSticker) => {
  if (!assignedSticker) {
    throw { code: 404, message: "Acquired sticker not found" };
  }
};

const userHasAccessToAssigneddSticker = (userId, assignedSticker) => {
  return assignedSticker.student.class.professor.some((professor) => professor.user.toString() === userId);
};

async function prepareUpdateData(assignedSticker, data, req) {
  const { comment } = data;
  const updateData = {};

  if (comment) {
    updateData.comment = comment;
  }

  if (req.file?.buffer) {
    const filePath = await saveSourceFile(req.file.buffer, assignedSticker._id, "comment-image", "jpg", false);
    updateData.source = filePath;
  }
  return updateData;
}

const updateAssignedSticker = async (assignedStickerId, updateData) => {
  return await updateItem(AcquiredSticker, { _id: assignedStickerId._id }, updateData);
};
