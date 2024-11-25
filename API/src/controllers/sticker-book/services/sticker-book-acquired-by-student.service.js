const { Student, AcquiredSticker } = require("../../../models");
const { getItemById, getItems } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.sticker_book_acquired_by_student_service = async (studentId, req) => {
  try {
    let student = await isIDGood(studentId);
    student = await getItemById(Student, student, [{ path: "class", populate: { path: "professor" } }, "parent"]);
    if (!student) {
      throw { code: 404, message: "Student not found" };
    }

    if (!checkUserHasPermissionForStudent(student, req.userId, req.role)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const acquiredStickers = await getAcquiredStickers(studentId, student.level, req.role);
    const stickersGroupedByCategory = await getStickersGroupedByCategory(acquiredStickers);
    return stickersGroupedByCategory;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const getAcquiredStickers = async (studentId, level, role) => {
  const query = { student: studentId, level };
  if (role.includes("parents")) {
    query["isPublished"] = true;
  }

  const acquiredStickers = await getItems(AcquiredSticker, query, { path: "sticker" });
  return acquiredStickers;
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
    if (parent.user.toString() === userId) {
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

async function getStickersGroupedByCategory(stickers) {
  const stickersGroupedByCategory = {};
  stickers.forEach((sticker) => {
    if (sticker && sticker.sticker && sticker.sticker.category) {
      if (!stickersGroupedByCategory[sticker.sticker.category]) {
        stickersGroupedByCategory[sticker.sticker.category] = [];
      }
      stickersGroupedByCategory[sticker.sticker.category].push(sticker);
    }
  });
  return stickersGroupedByCategory;
}
