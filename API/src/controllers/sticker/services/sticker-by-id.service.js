const { Sticker } = require("../../../models");
const { getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.sticker_by_id_service = async (id, req) => {
  try {
    let stickerId = await isIDGood(id);
    const sticker = await getItemById(Sticker, stickerId, { path: "class", populate: { path: "professor" } });
    if (!sticker) {
      throw { code: 404, message: "Sticker not found" };
    }
    if (!userHasPermissionForSticker(sticker, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }
    return sticker;
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
