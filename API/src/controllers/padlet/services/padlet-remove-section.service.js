const { PadletPost, PadletSection } = require("../../../models");
const { getItemById, deleteItem, getItems } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const fs = require("fs");
const path = require("path");

exports.padlet_section_remove_service = async (sectionId, req) => {
  try {
    const sectionItemId = await validateSectionId(sectionId);
    const sectionItem = await getItemById(PadletSection, sectionItemId, { path: "board", populate: { path: "class", populate: { path: "professor" } } });
    if (!sectionItem) {
      throw { code: 404, message: "Section not found" };
    }

    if (!userHasPermissionForSection(sectionItem, req.userId, req.role)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }
    await removeItems(PadletSection, sectionItemId);
    return { message: "Section deleted successfully" };
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateSectionId = async (id) => {
  return isIDGood(id);
};

function userHasPermissionForSection(sectionItem, userId, role) {
  if (role.includes("parents")) {
    throw { code: 403, message: "You don't have permission to do this" };
  } else if (role.includes("professor")) {
    return userHasPermissionForProfessor(sectionItem, userId);
  }
}

function userHasPermissionForProfessor(sectionItem, userId) {
  return sectionItem.board.class.professor.some((professor) => professor.user.toString() === userId);
}

const removeItems = async (model, id) => {
  await deleteItem(model, id);
  const PostForSection = await getItems(PadletPost, { sectionId: id });
  PostForSection.forEach(async (post) => {
    if (post.source) {
      const filePath = getPostFilePath(post._id, post.source);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    await deleteItem(PadletPost, post._id);
  });
};

function getPostFilePath(postId, file) {
  const uploadDir = path.join(__dirname, "../../../..", "uploads/padlet-posts");
  const extension = file.split(".").pop();
  const fileName = `${postId}_source.${extension}`;

  return path.join(uploadDir, fileName);
}
