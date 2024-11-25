const { Parent, Class, Student } = require("../../../models");
const { getItemById, getItems } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.parent_by_class_service = async (classId, req) => {
  try {
    const classItemId = await isIDGood(classId);
    const cls = await getItemById(Class, classItemId, "professor");
    if (!cls) {
      throw { code: 404, message: "Class not found" };
    }
    if (!checkUserHasPermissionForClass(cls, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const parents = await getParentsWithChildrenForClass(classItemId);
    return parents;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function checkUserHasPermissionForClass(cls, userId) {
  return cls.professor.some((professor) => professor.user.toString() === userId);
}

async function getParentsWithChildrenForClass(classId) {
  const students = await getItems(Student, { class: classId });
  const parentIds = students.flatMap((student) => student.parent);
  const parents = await getItems(Parent, { _id: { $in: parentIds } }, { path: "children", populate: { path: "child" } });
  return parents;
}
