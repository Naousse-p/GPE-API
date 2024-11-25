const { TreasurySchool, TreasuryTransaction, School } = require("../../../models");
const { getOneItem, createItem, getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { saveSourceFile } = require("../../../utils/multer");

exports.treasury_create_school_purchase_service = async (schoolId, title, amount, file, req) => {
  try {
    const schoolItemId = await validateSchoolId(schoolId);

    const school = await getSchoolById(schoolItemId);
    validateSchoolExistence(school);

    let treasurySchool = await getOneItem(TreasurySchool, { school: schoolItemId });
    if (!treasurySchool) {
      treasurySchool = await createItem(TreasurySchool, { school: schoolItemId, cooperativeBudget: 0 });
    }

    if (!userHasPermissionForSchool(school, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const transaction = createTransactionInstance("purchase", title, amount, "", schoolId);
    const savedTransaction = await saveTransactionToDatabase(transaction);

    const receipts = await saveSourceFile(file.buffer, `${savedTransaction._id}`, "receipts", file.originalname.split(".").pop(), true);

    savedTransaction.receipts = receipts;
    await savedTransaction.save();

    await updateSchoolTreasuryWithTransaction(treasurySchool._id, savedTransaction._id, amount);

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

const createTransactionInstance = (type, title, amount, receipts, schoolId) => {
  return new TreasuryTransaction({
    type,
    title,
    amount,
    date: new Date(),
    receipts,
    schoolTreasury: schoolId,
  });
};

const saveTransactionToDatabase = async (transaction) => {
  return await createItem(TreasuryTransaction, transaction);
};

const updateSchoolTreasuryWithTransaction = async (schoolTreasuryId, transactionId, amount) => {
  const schoolTreasury = await TreasurySchool.findById(schoolTreasuryId);
  schoolTreasury.cooperativeBudget -= amount;
  schoolTreasury.transactions.push(transactionId);
  await schoolTreasury.save();
};
