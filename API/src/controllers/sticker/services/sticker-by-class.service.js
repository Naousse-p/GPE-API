const { Sticker, Class } = require("../../../models");
const { getItemById, getItems } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.sticker_by_class_service = async (id, req) => {
  try {
    let classId = await isIDGood(id);
    const classroom = await getClassroomById(classId);
    ValidateClassExistence(classroom);
    if (!userHasPermissionForClass(classroom, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }
    const sticker = await getItems(Sticker, { class: classId });
    if (!sticker.length) {
      return {}; // Retourner un objet vide si aucun sticker n'est trouvé
    }
    const stickersGroupedByCategory = await getStickersGroupedByCategory(sticker);
    return stickersGroupedByCategory;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function getClassroomById(id) {
  return getItemById(Class, id, "professor");
}

function ValidateClassExistence(classRoom) {
  if (!classRoom) {
    throw { code: 404, message: "Class not found" };
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

async function getStickersGroupedByCategory(stickers) {
  const stickersGroupedByCategory = {};
  stickers.forEach((sticker) => {
    if (!stickersGroupedByCategory[sticker.category]) {
      stickersGroupedByCategory[sticker.category] = [];
    }
    stickersGroupedByCategory[sticker.category].push(sticker);
  });
  return stickersGroupedByCategory;
}
