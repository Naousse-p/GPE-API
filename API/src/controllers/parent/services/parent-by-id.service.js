const { Parent } = require("../../../models/");
const { getOneItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.parent_by_id_service = async (id, req) => {
  let parentId = await isIDGood(id);
  const parent = await getOneItem(Parent, { user: parentId }, { path: "children" });
  if (!parent) {
    throw { code: 404, message: "Parent not found" };
  }

  if (!userHasPermissionForParent(parent, req.userId)) {
    throw { code: 403, message: "You don't have permission to access this resource" };
  }
  return parent;
};

function userHasPermissionForParent(parent, userId) {
  return parent.user.toString() === userId;
}
