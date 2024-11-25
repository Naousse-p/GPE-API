const { Parent, School, Student } = require("../../../models");
const { getItemById, getItems } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.parent_by_school_service = async (schoolId, req) => {
  try {
    const schoolItemId = await isIDGood(schoolId);
    const school = await getItemById(School, schoolItemId, "professor");
    if (!school) {
      throw { code: 404, message: "School not found" };
    }
    if (!checkUserHasPermissionForSchool(school, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const parents = await getParentsWithChildrenForSchool(schoolItemId);
    return parents;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function checkUserHasPermissionForSchool(school, userId) {
  return school.professor.some((professor) => professor.user.toString() === userId);
}

async function getParentsWithChildrenForSchool(schoolId) {
  const students = await getItems(Student, { school: schoolId });
  const parentIds = students.flatMap((student) => student.parent);
  const parents = await getItems(Parent, { _id: { $in: parentIds } }, { path: "children", populate: { path: "child" } });
  return parents;
}

// Path: src/controllers/parent/services/parent-by-school.service.js
