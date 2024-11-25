const { School } = require("../../../models");
const { getOneItem } = require("../../../utils/db-generic-services.utils");

exports.school_by_code_service = async (code) => {
  try {
    const school = await getOneItem(School, { code: code });
    validateSchoolExistence(school);
    return school;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function validateSchoolExistence(school) {
  if (!school) {
    throw { code: 404, message: "School not found" };
  }
}
