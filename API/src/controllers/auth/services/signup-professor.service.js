const { Role, School, Professor, Class, User } = require("../../../models");
const { createItemWithSession, getItems, getOneItem } = require("../../../utils/db-generic-services.utils");
const { sendEmailConfirmation } = require("../../../mailer/helpers/send-email-confirmation");
const { generate_validation_token } = require("../helpers");
const mongoose = require("mongoose");

exports.signup_professor_service = async (userData, schoolData, professorData, classData) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await createUser(userData, session);

    // Récupération des rôles
    const roles = await getItems(Role, { name: { $in: userData.role } });
    user.roles = roles.map((role) => role._id);
    await user.save({ session });

    const professor = await createProfessor(professorData, user._id, session);

    const school = await createOrUpdateSchool(schoolData, professor._id, session);
    const newClass = await createOrUpdateClass(classData, school._id, professor._id, session);

    // await sendEmail(user, session);

    await session.commitTransaction();

    return { user, school, professor, class: newClass };
  } catch (error) {
    await session.abortTransaction();
    throw { code: error.code || 500, message: error.message };
  } finally {
    session.endSession();
  }
};
const createUser = async (userData, session) => {
  try {
    const existingUser = await getOneItem(User, { email: userData.email });
    if (existingUser) {
      throw { code: 409, message: "Email already used" };
    }

    const user = new User({ email: userData.email, password: userData.password, status: false });
    return await createItemWithSession(User, user, session);
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const createOrUpdateSchool = async (schoolData, professorId, session) => {
  let school;
  if (schoolData.school_type === "exist") {
    school = await getOneItem(School, { code: schoolData.schoolCode });
    if (!school) {
      throw { code: 404, message: "School not found" };
    }
    school.professor.push(professorId);
    await school.save({ session });
  } else {
    let isCodeUsed = await getOneItem(School, { code: schoolData.schoolCode });
    if (isCodeUsed) {
      throw { code: 409, message: "School code already used" };
    }

    const newSchool = new School({
      name: schoolData.schoolName,
      address: schoolData.schoolAddress,
      postal_code: schoolData.schoolPostal_code,
      city: schoolData.schoolCity,
      code: schoolData.schoolCode,
      phone: schoolData.schoolPhone,
    });
    school = await createItemWithSession(School, newSchool, session);
    school.professor.push(professorId);
    await school.save({ session });
  }
  return school;
};

const createProfessor = async (userData, userId, schoolId, session) => {
  const professor = new Professor({ lastname: userData.lastname, firstname: userData.firstname, phoneNumber: userData.phoneNumber, user: userId, school: schoolId });
  return createItemWithSession(Professor, professor, session);
};

const createOrUpdateClass = async (classData, schoolId, professorId, session) => {
  let newClass;
  if (classData.class_type === "exist") {
    newClass = await getOneItem(Class, { code: classData.code });
    if (!newClass) {
      throw { code: 404, message: "Class not found" };
    }

    newClass.professor.push(professorId);
    await newClass.save({ session });
  } else {
    let isCodeUsed = await getOneItem(Class, { code: classData.code });
    if (isCodeUsed) {
      throw { code: 409, message: "Class code already used" };
    }
    newClass = new Class({ name: classData.name, level: classData.level, code: classData.code, school: schoolId, professor: professorId });
    newClass = await createItemWithSession(Class, newClass, session);
  }
  return newClass;
};

async function sendEmail(user, session) {
  try {
    const validationToken = generate_validation_token(user._id);
    await sendEmailConfirmation(user.email, validationToken);
    user.validationToken = validationToken;
    await user.save({ session });
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
}
