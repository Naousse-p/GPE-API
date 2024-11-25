const { TreasurySchool, School, TreasuryClassroom, Class } = require("../../../models");
const { getItemById, getOneItem, createItem, getItems } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.treasury_get_school_service = async (schoolId, req) => {
  try {
    const schoolItemId = await validateSchoolId(schoolId);

    const school = await getSchoolById(schoolItemId);
    validateSchoolExistence(school);

    if (!userIsTreasurerForSchool(school, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    let schoolTreasury = await getSchoolTreasuryBySchoolId(schoolItemId);
    if (!schoolTreasury) {
      schoolTreasury = await createSchoolTreasury(schoolItemId);
    }

    const classes = await getClassesBySchoolId(schoolItemId);
    const classesWithOwnership = await Promise.all(
      classes.map(async (cls) => {
        const treasuryClassroom = await getOneItem(TreasuryClassroom, { class: cls._id });
        return {
          ...cls.toObject(),
          isOwnClass: cls.professor.some((prof) => prof.user.toString() === req.userId),
          allocatedBudget: treasuryClassroom ? treasuryClassroom.allocatedBudget : 0,
        };
      })
    );

    return { schoolTreasury, classes: classesWithOwnership };
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateSchoolId = async (id) => {
  return isIDGood(id);
};

const getSchoolById = async (id) => {
  return getItemById(School, id, "treasurer");
};

const validateSchoolExistence = (school) => {
  if (!school) {
    throw { code: 404, message: "School not found" };
  }
};

const userIsTreasurerForSchool = (school, userId) => {
  return school.treasurer && school.treasurer.user.toString() === userId;
};

const getSchoolTreasuryBySchoolId = async (schoolId) => {
  return await getOneItem(TreasurySchool, { school: schoolId }, "transactions");
};

const createSchoolTreasury = async (schoolId) => {
  return await createItem(TreasurySchool, { school: schoolId, allocatedBudget: 0 });
};

const getClassesBySchoolId = async (schoolId) => {
  return await getItems(Class, { school: schoolId }, "professor");
};
