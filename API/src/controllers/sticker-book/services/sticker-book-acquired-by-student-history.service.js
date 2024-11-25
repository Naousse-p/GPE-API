const { Student, AcquiredSticker } = require("../../../models/");
const { getItemById, getItems } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.sticker_book_acquired_by_student_history_service = async (studentId, req) => {
  try {
    let student = await isIDGood(studentId);
    student = await getItemById(Student, student, [{ path: "class", populate: { path: "professor" } }, "parent"]);
    if (!student) {
      throw { code: 404, message: "Student not found" };
    }

    if (!checkUserHasPermissionForStudent(student, req.userId, req.role)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const acquiredStickers = await getAcquiredStickersByLevel(studentId, req.role);
    return acquiredStickers;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const getAcquiredStickersByLevel = async (studentId, role) => {
  const query = { student: studentId };
  if (role.includes("parents")) {
    query["isPublished"] = true;
  }

  const acquiredStickers = await getItems(AcquiredSticker, query, { path: "sticker" });
  const stickersByLevel = {
    ps: [],
    ms: [],
    gs: [],
  };

  acquiredStickers.forEach((sticker) => {
    stickersByLevel[sticker.level].push(sticker);
  });

  return stickersByLevel;
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
