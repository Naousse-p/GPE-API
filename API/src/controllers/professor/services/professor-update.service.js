const { Professor, User } = require("../../../models");
const { getItemById, updateItem, getOneItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.professor_update_service = async (userId, data, req) => {
  try {
    let professorUserIdGood = await isIDGood(userId);
    const professor = await getOneItem(Professor, { user: professorUserIdGood });
    validateProfessorExistence(professor);

    if (!userCanAccessProfessor(professor, req.userId)) {
      throw { code: 403, message: "You are not allowed to access this professor" };
    }

    const updateData = prepareUpdateData(data);
    const updatedProfessor = await updateProfessor(professor, updateData);

    return updatedProfessor;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function validateProfessorExistence(professor) {
  if (!professor) {
    throw { code: 404, message: "Professor not found" };
  }
}

function userCanAccessProfessor(professor, user) {
  return professor.user.toString() === user;
}

function prepareUpdateData(data) {
  const { firstname, lastname, phoneNumber, subjects } = data;
  const updateData = {};
  if (firstname) updateData.firstname = firstname;
  if (lastname) updateData.lastname = lastname;
  if (phoneNumber) updateData.phoneNumber = phoneNumber;
  if (Object.keys(updateData).length === 0) {
    throw { code: 422, message: "No data to update" };
  }
  return updateData;
}

async function updateProfessor(professor, data) {
  return await updateItem(Professor, { _id: professor._id }, { $set: data });
}
