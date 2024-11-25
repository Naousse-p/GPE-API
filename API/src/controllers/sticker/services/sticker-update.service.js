const { Sticker } = require("../../../models");
const { getItemById, updateItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { saveSourceFile } = require("../../../utils/multer");
const crypto = require("crypto");

exports.sticker_update_service = async (id, data, req) => {
  try {
    const stickerId = await validateStickerId(id);
    const sticker = await getStickerById(stickerId);
    validateStickerExistence(sticker);
    if (!userHasPermissionForSticker(sticker, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }
    const updateData = await prepareUpdateData(data, sticker, req);
    const updatedSticker = await updateSticker(stickerId, updateData);
    return updatedSticker;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

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

async function validateStickerId(id) {
  return await isIDGood(id);
}

async function getStickerById(id) {
  return await getItemById(Sticker, id, { path: "class", populate: { path: "professor" } });
}

function validateStickerExistence(sticker) {
  if (!sticker) {
    throw { code: 404, message: "Sticker not found" };
  }
}

async function prepareUpdateData(data, sticker, req) {
  const { name, description, category } = data;
  const updateData = {};

  if (!name && !description && !category && !req.file?.buffer) {
    throw { code: 422, message: "No data to update" };
  }

  if (name) updateData.name = name;
  if (description) updateData.description = description;
  if (category) updateData.category = category;

  if (req.file?.buffer) {
    const md5 = calculateMD5(req.file.buffer + name + sticker.class);
    const existingSticker = await Sticker.findOne({ md5 });

    if (existingSticker) {
      throw { code: 409, message: "Sticker already exists" };
    }

    updateData.md5 = md5;
    const filePath = await saveSourceFile(req.file.buffer, sticker._id, "sticker", "jpg", false);
    updateData.source = filePath;
  }

  return updateData;
}

async function updateSticker(stickerId, updateData) {
  return await updateItem(Sticker, stickerId, updateData);
}

function calculateMD5(data) {
  return crypto.createHash("md5").update(data).digest("hex");
}
