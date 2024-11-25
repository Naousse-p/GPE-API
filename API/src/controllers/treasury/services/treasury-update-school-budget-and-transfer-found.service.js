const { TreasurySchool, TreasuryClassroom, School } = require("../../../models");
const { getOneItem, getItemById, createItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.treasury_update_school_budget_and_transfer_funds_service = async (schoolId, budgetUpdates, req) => {
  try {
    const schoolItemId = await validateSchoolId(schoolId);

    const school = await getSchoolById(schoolItemId);
    validateSchoolExistence(school);

    let treasurySchool = await getOneItem(TreasurySchool, { school: schoolItemId });
    if (!treasurySchool) {
      throw { code: 404, message: "TreasurySchool not found" };
    }

    if (!userHasPermissionForSchool(school, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    if (budgetUpdates.cooperativeBudget !== undefined && budgetUpdates.cooperativeBudget !== null) {
      const newCooperativeBudget = parseFloat(budgetUpdates.cooperativeBudget);
      if (isNaN(newCooperativeBudget)) {
        throw { code: 400, message: "Invalid cooperativeBudget value" };
      }
      treasurySchool.cooperativeBudget = newCooperativeBudget;
    }

    if (budgetUpdates.classroom && Object.keys(budgetUpdates.classroom).length > 0) {
      for (const [classId, newAllocatedBudget] of Object.entries(budgetUpdates.classroom)) {
        const parsedNewAllocatedBudget = parseFloat(newAllocatedBudget);
        if (isNaN(parsedNewAllocatedBudget)) {
          throw { code: 400, message: `Invalid amount value for class ID: ${classId}` };
        }
        await updateClassroomBudget(treasurySchool, classId, parsedNewAllocatedBudget);
      }
    }

    await treasurySchool.save();

    return treasurySchool;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateSchoolId = async (id) => {
  return isIDGood(id);
};

const getSchoolById = async (id) => {
  return getItemById(School, id, "professor");
};

const validateSchoolExistence = (school) => {
  if (!school) {
    throw { code: 404, message: "School not found" };
  }
};

const userHasPermissionForSchool = (school, userId) => {
  for (const professor of school.professor) {
    if (professor.user.toString() === userId) {
      return true;
    }
  }
  return false;
};

const updateClassroomBudget = async (treasurySchool, classId, newAllocatedBudget) => {
  let treasuryClassroom = await getOneItem(TreasuryClassroom, { class: classId });

  if (!treasuryClassroom) {
    treasuryClassroom = await createItem(TreasuryClassroom, { class: classId, allocatedBudget: 0 });
  }

  const oldAllocatedBudget = treasuryClassroom.allocatedBudget;
  const budgetDifference = newAllocatedBudget - oldAllocatedBudget;

  if (budgetDifference === 0) {
    // Si le montant alloué reste le même, ne faites rien
    return;
  }

  if (budgetDifference > 0) {
    // Si le montant alloué a été augmenté, ajoutez la différence au budget de la classe et soustrayez-la du budget coopératif de l'école
    if (treasurySchool.cooperativeBudget < budgetDifference) {
      throw { code: 400, message: `Insufficient funds in cooperativeBudget to transfer ${budgetDifference} to class ID: ${classId}` };
    }
    treasurySchool.cooperativeBudget -= budgetDifference;
    treasuryClassroom.allocatedBudget += budgetDifference;
  } else {
    // Si le montant alloué a été diminué, soustrayez la différence du budget de la classe et ajoutez-la au budget coopératif de l'école
    treasurySchool.cooperativeBudget += Math.abs(budgetDifference);
    treasuryClassroom.allocatedBudget -= Math.abs(budgetDifference);
  }

  await treasuryClassroom.save();
};
