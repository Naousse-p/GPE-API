const { AcquiredSticker } = require("../../../models");
const { getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

const fs = require("fs");
const path = require("path");

exports.sticker_assigned_picture_service = async (AssignedStickerId, req) => {
  try {
    const assignedStickerItemId = await validateAssignedStickerId(AssignedStickerId);

    const assignedSticker = await getAssignedStickerById(assignedStickerItemId);
    validateAssignedStickerExistence(assignedSticker);

    if (!checkUserHasPermissionForSticker(req.userId, assignedSticker, req.role)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const filePath = getStickerFilePath(AssignedStickerId);
    const fileBuffer = fs.readFileSync(filePath);

    return fileBuffer;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateAssignedStickerId = async (id) => {
  return isIDGood(id);
};

const getAssignedStickerById = async (id) => {
  return getItemById(AcquiredSticker, id, {
    path: "student",
    populate: [
      {
        path: "class",
        populate: { path: "professor" },
      },
      {
        path: "parent",
      },
    ],
  });
};

const validateAssignedStickerExistence = (assignedSticker) => {
  if (!assignedSticker) {
    throw { code: 404, message: "Acquired sticker not found" };
  }
};
function checkUserHasPermissionForSticker(userId, assignedSticker, role) {
  if (role.includes("parents")) {
    return userHasPermissionForParent(assignedSticker, userId);
  } else if (role.includes("professor")) {
    return userHasAccessToAssignedSticker(userId, assignedSticker);
  }
}

function userHasPermissionForParent(assignedSticker, userId) {
  for (const parent of assignedSticker.student.parent) {
    if (parent.user.toString() === userId) {
      return true;
    }
  }
  return false;
}

const userHasAccessToAssignedSticker = (userId, assignedSticker) => {
  return assignedSticker.student.class.professor.some((professor) => professor.user.toString() === userId);
};

function getStickerFilePath(stickerAssignedId) {
  const uploadDir = path.join(__dirname, "../../../..", "uploads/comment-image");
  const fileName = `${stickerAssignedId}_source.jpg`;
  const filePath = path.join(uploadDir, fileName);

  if (!fs.existsSync(filePath)) {
    throw { code: 404, message: "Image not found" };
  }
  return filePath;
}
