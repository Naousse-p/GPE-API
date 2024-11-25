const { Student } = require("../../../models");
const { getOneItem } = require("../../../utils/db-generic-services.utils");

exports.student_by_code_service = async (code, req) => {
  try {
    const student = await getOneItem(Student, { code }, [{ path: "class", populate: { path: "professor" } }, "parent"]);
    if (!student) {
      throw { code: 404, message: "Student not found" };
    }
    return student;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};
