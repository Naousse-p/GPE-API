const { Parent, Student } = require("../../../models");
const { getOneItem, updateItem } = require("../../../utils/db-generic-services.utils");

exports.parent_join_classroom_service = async (studentCode, relationShip, req) => {
  const student = await getOneItem(Student, { code: studentCode }, { path: "class" });
  if (!student) {
    throw { code: 404, message: "Student not found" };
  }

  const parent = await getOneItem(Parent, { user: req.userId });
  if (!parent) {
    throw { code: 404, message: "Parent not found" };
  }

  await addChildrenToParent(student, parent, relationShip);

  student.parent.push(parent._id);
  await student.save();
  return { code: 200, message: "Parent joined classroom successfully" };
};

async function addChildrenToParent(student, parent, relationShip) {
  const children = { child: student._id, class: student.class._id, relationship: relationShip };
  parent.children.push(children);
  await updateItem(Parent, parent._id, { children: parent.children });
}
