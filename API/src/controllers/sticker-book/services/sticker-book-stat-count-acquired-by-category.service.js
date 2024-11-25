const { Student, AcquiredSticker, Sticker } = require("../../../models");
const { getItemById, getItems } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.sticker_book_stat_count_acquired_by_category_service = async (studentId, req) => {
  try {
    let student = await isIDGood(studentId);
    student = await getItemById(Student, student, { path: "class", populate: { path: "professor" } });
    if (!student) {
      throw { code: 404, message: "Student not found" };
    }

    if (!checkUserHasPermissionForStudent(student, req.userId, req.role)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }
    const stickersCountByCategory = await getStickersCountByCategory(student);
    const acquiredStickerCountByCategory = await getAcquiredStickersCountByCategory(student);
    const stickersClassAndAcquiredCountByCategory = await getStickersClassAndAcquiredCountByCategory(stickersCountByCategory, acquiredStickerCountByCategory);

    return stickersClassAndAcquiredCountByCategory;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
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

const getStickersCountByCategory = async (student) => {
  const stickersCountByCategory = await getItems(Sticker, { class: student.class._id });
  return stickersCountByCategory.reduce((acc, cur) => {
    acc[cur.category] = { countInClass: acc[cur.category] ? acc[cur.category].countInClass + 1 : 1 };
    return acc;
  }, {});
};

const getAcquiredStickersCountByCategory = async (student) => {
  const acquiredStickers = await getItems(AcquiredSticker, { student: student._id }, { path: "sticker" });
  return acquiredStickers.reduce((acc, cur) => {
    acc[cur.sticker.category] = { countAcquired: acc[cur.sticker.category] ? acc[cur.sticker.category].countAcquired + 1 : 1 };
    return acc;
  }, {});
};

const getStickersClassAndAcquiredCountByCategory = (countInClassByCategory, countAcquiredByCategory) => {
  const result = {};
  Object.keys(countInClassByCategory).forEach((category) => {
    result[category] = {
      countInClass: countInClassByCategory[category].countInClass,
      countAcquired: countAcquiredByCategory[category] ? countAcquiredByCategory[category].countAcquired : 0,
    };
  });
  return result;
};
