const { Role, User, Parent, Student } = require("../../../models");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { createItemWithSession, getItems, getOneItem, getItemById } = require("../../../utils/db-generic-services.utils");
const { sendEmailConfirmation } = require("../../../mailer/helpers/send-email-confirmation");
const { generate_validation_token } = require("../helpers");
const mongoose = require("mongoose");

exports.signup_parent_service = async (userData, parentData) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await createUser(userData, session);

    let studentId = await isIDGood(parentData.children.child);
    const student = await getItemById(Student, studentId, { path: "class", populate: { path: "professor" } });

    validateStudentExistence(student);
    // // Récupération des rôles

    const roles = await getItems(Role, { name: { $in: userData.role } });
    user.roles = roles.map((role) => role._id);
    await user.save({ session });

    const parent = await createParent(parentData, user._id, session);
    // ajout du parent à l'enfant
    student.parent.push(parent._id);
    await student.save({ session });
    await sendEmail(user, session);

    await session.commitTransaction();
    return { user, parent };
  } catch (error) {
    await session.abortTransaction();
    throw { code: error.code || 500, message: error.message };
  } finally {
    session.endSession();
  }
};

const createUser = async (userData, session) => {
  // Vérifier si l'email est déjà utilisé
  const existingUser = await getOneItem(User, { email: userData.email });
  if (existingUser) {
    throw { code: 409, message: "Email already used" };
  }
  const user = new User({ email: userData.email, password: userData.password, status: true });
  return createItemWithSession(User, user, session);
};

const createParent = async (parentData, userId, session) => {
  const parent = new Parent({ ...parentData, user: userId });

  return createItemWithSession(Parent, parent, session);
};

function validateStudentExistence(student) {
  if (!student) {
    throw { code: 404, message: "Student not found" };
  }
}

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
