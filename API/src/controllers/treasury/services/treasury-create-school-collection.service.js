const { TreasurySchool, TreasuryTransaction, School } = require("../../../models");
const { getOneItem, createItem, getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.treasury_create_school_collection_service = async (schoolId, title, amount, receipts, req) => {
  try {
    const schoolItemId = await validateSchoolId(schoolId);

    const school = await getSchoolById(schoolItemId);
    validateSchoolExistence(school);

    if (!userHasPermissionForSchool(school, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    let treasurySchool = await getOneItem(TreasurySchool, { school: schoolItemId });
    if (!treasurySchool) {
      treasurySchool = await createItem(TreasurySchool, { school: schoolItemId, cooperativeBudget: 0 });
    }

    const transaction = createTransactionInstance("collection", title, amount, receipts, schoolItemId);

    const savedTransaction = await saveTransactionToDatabase(transaction);

    await updateSchoolTreasuryWithTransaction(schoolItemId, savedTransaction._id, amount);

    return savedTransaction;
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

const createTransactionInstance = (type, title, amount, receipts, schoolItemId) => {
  return new TreasuryTransaction({
    type,
    title,
    amount,
    date: new Date(),
    receipts,
    schoolTreasury: schoolItemId,
  });
};

const saveTransactionToDatabase = async (transaction) => {
  return await createItem(TreasuryTransaction, transaction);
};

const updateSchoolTreasuryWithTransaction = async (schoolId, transactionId, amount) => {
  const schoolTreasury = await getOneItem(TreasurySchool, { school: schoolId });
  const budget = parseInt(amount) + parseInt(schoolTreasury.cooperativeBudget);
  schoolTreasury.cooperativeBudget = budget;
  schoolTreasury.transactions.push(transactionId);
  await schoolTreasury.save();
};
