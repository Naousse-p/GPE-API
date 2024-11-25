const { TreasuryClassroom, Class, School } = require("../../../models");
const { getItemById, getOneItem, createItem, getItems } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.treasury_get_classroom_service = async (classId, req) => {
  try {
    const classItemId = await validateClassId(classId);

    const classroom = await getClassroomById(classItemId);
    validateClassroomExistence(classroom);

    const isUserHasPermissionForClass = await userHasPermissionForClass(classroom, req.userId, req.role);
    if (!isUserHasPermissionForClass) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }
    let classroomTreasury = await getClassroomTreasuryByClassId(classItemId);
    if (!classroomTreasury) {
      classroomTreasury = await createClassroomTreasury(classItemId);
    }

    return classroomTreasury;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateClassId = async (id) => {
  return isIDGood(id);
};

const getClassroomById = async (id) => {
  return getItemById(Class, id, "professor school");
};

const validateClassroomExistence = (classroom) => {
  if (!classroom) {
    throw { code: 404, message: "Class not found" };
  }
};

const userHasPermissionForClass = async (cls, userId, role) => {
  if (role.includes("treasurer")) {
    const school = await getItemById(School, cls.school._id, "treasurer");
    return school.treasurer && school.treasurer.user.toString() === userId.toString();
  } else {
    for (const professor of cls.professor) {
      if (professor.user.toString() === userId) {
        return true;
      }
    }
  }
  return false;
};

const getClassroomTreasuryByClassId = async (classId) => {
  return await getOneItem(TreasuryClassroom, { class: classId }, "transactions");
};

const createClassroomTreasury = async (classId) => {
  return await createItem(TreasuryClassroom, { class: classId, allocatedBudget: 0 });
};
