const { TreasuryTransaction, TreasurySchool, TreasuryClassroom, Class, School } = require("../../../models");
const { getOneItem, createItem, getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.treasury_create_classroom_collection_service = async (classId, title, amount, req) => {
  try {
    const classItemId = await validateClassId(classId);

    const classroom = await getClassroomById(classItemId);
    validateClassroomExistence(classroom);

    if (!userHasPermissionForClass(classroom, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const school = await getSchoolByClassId(classroom.school);
    validateSchoolExistence(school);

    const transaction = createTransactionInstance("collection", title, amount, school._id, classItemId);
    const savedTransaction = await saveTransactionToDatabase(transaction);

    await updateSchoolTreasuryWithTransaction(school._id, savedTransaction._id, amount);
    await addTransactionToClassroomTreasury(classItemId, savedTransaction._id);

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

const getSchoolByClassId = async (schoolId) => {
  return getItemById(School, schoolId, "professor");
};

const validateSchoolExistence = (school) => {
  if (!school) {
    throw { code: 404, message: "School not found" };
  }
};

const createTransactionInstance = (type, title, amount, schoolId, classId) => {
  return new TreasuryTransaction({
    type,
    title,
    amount,
    date: new Date(),
    classTreasury: classId,
  });
};

const saveTransactionToDatabase = async (transaction) => {
  return await createItem(TreasuryTransaction, transaction);
};

const updateSchoolTreasuryWithTransaction = async (schoolId, transactionId, amount) => {
  const schoolTreasury = await getOneItem(TreasurySchool, { school: schoolId });
  const budget = parseInt(schoolTreasury.cooperativeBudget) + parseInt(amount);
  schoolTreasury.cooperativeBudget = budget;
  await schoolTreasury.save();
};

const addTransactionToClassroomTreasury = async (classId, transactionId) => {
  const classroomTreasury = await getOneItem(TreasuryClassroom, { class: classId });
  classroomTreasury.transactions.push(transactionId);
  await classroomTreasury.save();
};
