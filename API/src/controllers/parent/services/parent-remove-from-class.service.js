const { Parent, Student, Class } = require("../../../models");
const { getItemById, getOneItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.parent_remove_from_class_service = async (parentId, classId, req) => {
  try {
    const parentItemId = await isIDGood(parentId);
    const classItemId = await isIDGood(classId);

    const classItem = await getItemById(Class, classItemId);
    validateClassExistence(classItem);

    const parent = await getOneItem(Parent, { _id: parentItemId, "children.class": classItemId }, { path: "children", populate: [{ path: "child" }, { path: "class", populate: { path: "professor" } }] });
    validateParentExistence(parent);

    if (!userHasPermissionForParent(parent, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    await removeParentFromClass(classItemId, parent);
    await removeParentFromStudents(parent);

    return;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function validateParentExistence(parent) {
  if (!parent) {
    throw { code: 404, message: "Parent not found" };
  }
}

function validateClassExistence(classItem) {
  if (!classItem) {
    throw { code: 404, message: "Class not found" };
  }
}

async function removeParentFromClass(classId, parent) {
  await Class.findByIdAndUpdate(classId, { $pull: { "children.$[elem].parents": parent._id } }, { arrayFilters: [{ "elem.child": parent.children[0].child }] });
}

async function removeParentFromStudents(parent) {
  await Student.updateMany({ _id: { $in: parent.children.map((child) => child.child) } }, { $pull: { parent: parent._id } });
}

function userHasPermissionForParent(parent, userId) {
  return parent.children[0].class.professor.some((professor) => professor.user.toString() === userId);
}
