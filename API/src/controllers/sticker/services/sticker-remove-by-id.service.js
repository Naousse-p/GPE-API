// sticker-remove.service.js
const { Sticker } = require("../../../models");
const { deleteItem, getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const fs = require("fs");
const path = require("path");

// ANCHOR : 1 sticker peut etre dans plusieurs classes, donc si le sticker est lié a plusieurs classes, il ne faut pas le supprimer de la base de données mais juste le retirer de la classe
exports.sticker_remove_by_id_service = async (id, req) => {
  try {
    const stickerId = await isIDGood(id);
    const sticker = await getItemById(Sticker, stickerId, { path: "class", populate: { path: "professor" } });
    validateStickerExistence(sticker);
    if (!userHasPermissionForSticker(sticker, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }
    await deleteStickerImage(stickerId);
    await deleteItem(Sticker, stickerId);

    return { message: "Sticker deleted successfully" };
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function validateStickerExistence(sticker) {
  if (!sticker) {
    throw { code: 404, message: "Sticker not found" };
  }
}

function userHasPermissionForSticker(sticker, userId) {
  // Vérifier si l'utilisateur a accès à au moins une classe associée au sticker
  for (const cls of sticker.class) {
    // Vérifier si l'utilisateur a accès à la classe
    if (userHasPermissionForClass(cls, userId)) {
      return true;
    }
  }
  return false;
}

function userHasPermissionForClass(cls, userId) {
  // Vérifier si l'utilisateur a accès à au moins un professeur de la classe
  for (const professor of cls.professor) {
    if (professor.user.toString() === userId) {
      return true;
    }
  }
  return false;
}

async function deleteStickerImage(stickerId) {
  const filePath = getStickerFilePath(stickerId);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

function getStickerFilePath(stickerId) {
  const uploadDir = path.join(__dirname, "../../../..", "uploads/sticker");
  const fileName = `${stickerId}_source.jpg`;
  const filePath = path.join(uploadDir, fileName);
  return filePath;
}
