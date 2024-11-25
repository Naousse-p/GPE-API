const { Student, AcquiredSticker } = require("../../../models");
const { getItemById, getItems } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.sticker_book_stat_acquired_by_category_service = async (studentId, req) => {
  try {
    let student = await isIDGood(studentId);
    student = await getItemById(Student, student, { path: "class", populate: { path: "professor" } });
    if (!student) {
      throw { code: 404, message: "Student not found" };
    }

    if (!checkUserHasPermissionForStudent(student, req.userId, req.role)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const acquiredStickers = await getAcquiredStickersByCategory(studentId);
    return acquiredStickers;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const getAcquiredStickersByCategory = async (studentId) => {
  const acquiredStickers = await getItems(AcquiredSticker, { student: studentId }, { path: "sticker" });
  const stickersByCategory = {
    "Devenir élève": [],
    "Mobiliser le langage dans toutes ses dimensions": [],
    "Agir, s’exprimer, comprendre à travers les activités artistiques": [],
    "Agir, s’exprimer, comprendre à travers l’activité physique": [],
    "Construire les premiers outils pour structurer sa pensée": [],
    "Explorer le monde": [],
  };

  acquiredStickers.forEach((sticker) => {
    stickersByCategory[sticker.sticker.category].push(sticker);
  });

  return stickersByCategory;
};

function checkUserHasPermissionForStudent(student, userId, role) {
  if (role.includes("parents")) {
    return userHasPermissionForParent(student, userId);
  } else if (role.includes("professor")) {
    return userHasPermissionForProfessor(student, userId);
  }
}

function userHasPermissionForParent(student, userId) {
  for (const parent of student.parent) {
    if (parent.toString() === userId) {
      return true;
    }
  }
  return false;
}

function userHasPermissionForProfessor(student, userId) {
  for (const professor of student.class.professor) {
    if (professor.user.toString() === userId) {
      return true;
    }
  }
  return false;
}
