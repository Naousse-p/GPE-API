// sticker-picture.service.js
const { Sticker, Parent } = require("../../../models");
const { getItemById, getOneItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

const fs = require("fs");
const path = require("path");

exports.sticker_picture_service = async (id, req) => {
  try {
    let stickerId = await isIDGood(id);
    const sticker = await getItemById(Sticker, stickerId, { path: "class", populate: { path: "professor" } });
    validateStickerExistence(sticker);

    if (!userHasPermissionForSticker(sticker, req.userId, req.role)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const filePath = getStickerFilePath(stickerId);
    const fileBuffer = fs.readFileSync(filePath);

    return fileBuffer;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function validateStickerExistence(sticker) {
  if (!sticker) {
    throw { code: 404, message: "Sticker not found" };
  }
}

async function userHasPermissionForSticker(sticker, userId, role) {
  // Vérifier si l'utilisateur a accès à au moins une classe associée au sticker
  if (role.includes("professor")) {
    for (const cls of sticker.class) {
      // Vérifier si l'utilisateur a accès à la classe
      if (userHasPermissionForClass(cls, userId)) {
        return true;
      }
    }
    return false;
  } else if (role.includes("parents")) {
    const parent = await getOneItem(Parent, { user: userId });
    // check if the parent has a child in the class of the sticker
    for (const cls of sticker.class) {
      for (const child of parent.children) {
        if (child.class.toString() === cls._id.toString()) {
          return true;
        }
      }
    }
    return false;
  }
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

function getStickerFilePath(stickerId) {
  const uploadDir = path.join(__dirname, "../../../..", "uploads/sticker");
  const fileName = `${stickerId}_source.jpg`;
  const filePath = path.join(uploadDir, fileName);

  if (!fs.existsSync(filePath)) {
    throw { code: 404, message: "Image not found" };
  }
  return filePath;
}
