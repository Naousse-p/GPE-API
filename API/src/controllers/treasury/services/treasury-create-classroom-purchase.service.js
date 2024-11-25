const { TreasuryClassroom, TreasuryTransaction, Class } = require("../../../models");
const { getOneItem, createItem, getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { saveSourceFile } = require("../../../utils/multer");

exports.treasury_create_classroom_purchase_service = async (classId, title, amount, file, req) => {
  try {
    const classItemId = await validateClassId(classId);

    const classroom = await getClassroomById(classItemId);
    validateClassroomExistence(classroom);

    let classroomTreasury = await getOneItem(TreasuryClassroom, { class: classItemId });
    if (!classroomTreasury) {
      classroomTreasury = await createItem(TreasuryClassroom, { class: classItemId, allocatedBudget: 0 });
    }
    if (!userHasPermissionForClass(classroom, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const transaction = createTransactionInstance("purchase", title, amount, "", classroomTreasury._id);
    const savedTransaction = await saveTransactionToDatabase(transaction);

    const receipts = await saveSourceFile(file.buffer, `${savedTransaction._id}`, "receipts", file.originalname.split(".").pop(), true);

    savedTransaction.receipts = receipts;
    await savedTransaction.save();

    await updateClassTreasuryWithTransaction(classroomTreasury._id, savedTransaction._id, amount);

    return savedTransaction;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateClassId = async (id) => {
  return isIDGood(id);
};

const getClassroomById = async (id) => {
  return getItemById(Class, id, "professor");
};

const validateClassroomExistence = (classroom) => {
  if (!classroom) {
    throw { code: 404, message: "Class not found" };
  }
};

const userHasPermissionForClass = (cls, userId) => {
  for (const professor of cls.professor) {
    if (professor.user.toString() === userId) {
      return true;
    }
  }
  return false;
};

const createTransactionInstance = (type, title, amount, receipts, classTreasuryId) => {
  return new TreasuryTransaction({
    type,
    title,
    amount,
    date: new Date(),
    receipts,
    classTreasury: classTreasuryId,
  });
};

const saveTransactionToDatabase = async (transaction) => {
  return await createItem(TreasuryTransaction, transaction);
};

const updateClassTreasuryWithTransaction = async (classTreasuryId, transactionId, amount) => {
  const classTreasury = await TreasuryClassroom.findById(classTreasuryId);
  classTreasury.transactions.push(transactionId);
  await classTreasury.save();
};
