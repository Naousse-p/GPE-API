const { Class } = require("../../../models");
const { getOneItem } = require("../../../utils/db-generic-services.utils");

exports.classroom_by_code_service = async (code) => {
  try {
    const classroom = await getOneItem(Class, { code: code });
    validateClassExistence(classroom);
    return classroom;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function validateClassExistence(classroom) {
  if (!classroom) {
    throw { code: 404, message: "Classroom not found" };
  }
}
