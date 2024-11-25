const { Parent, User } = require("../../../models");
const { getItemById, updateItem, getOneItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.parent_update_service = async (userId, data, req) => {
  try {
    const parentId = await validateParentId(userId);

    const parent = await getParentById(parentId);
    validateParentExistence(parent);

    if (!userHasPermissionForParent(parent, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const updateData = prepareUpdateData(data);
    const updatedParent = await updateParent(parent._id, updateData);

    if (data.email) {
      await updateUser(req.userId, data);
    }

    return updatedParent;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

async function validateParentId(id) {
  return await isIDGood(id);
}

async function getParentById(id) {
  return await getOneItem(Parent, { user: id });
}

function validateParentExistence(parent) {
  if (!parent) {
    throw { code: 404, message: "Parent not found" };
  }
}

function userHasPermissionForParent(parent, userId) {
  return parent.user.toString() === userId;
}

function prepareUpdateData(data) {
  const { firstname, lastname, phoneNumber, children } = data;
  const updateData = {};
  if (firstname) updateData.firstname = firstname;
  if (lastname) updateData.lastname = lastname;
  if (phoneNumber) updateData.phoneNumber = phoneNumber;
  if (children) updateData.children = children;
  if (Object.keys(updateData).length === 0) {
    throw { code: 422, message: "No data to update" };
  }
  return updateData;
}

async function updateParent(id, data) {
  return await updateItem(Parent, { _id: id }, { $set: data });
}

async function updateUser(userId, data) {
  const existingUser = await getOneItem(User, { email: data.email });
  if (existingUser) {
    throw { code: 409, message: "Email already used" };
  }
  return await updateItem(User, { _id: userId }, { $set: { email: data.email } });
}
