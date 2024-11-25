const { PadletBoard, PadletPost, PadletSection } = require("../../../models");
const { getItemById, deleteItem, getItems } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const fs = require("fs");
const path = require("path");

exports.padlet_board_remove_service = async (boardId, req) => {
  try {
    const boardItemId = await validateBoardId(boardId);
    const boardItem = await getItemById(PadletBoard, boardItemId, { path: "class", populate: { path: "professor" } });
    if (!boardItem) {
      throw { code: 404, message: "Board not found" };
    }

    if (!userHasPermissionForBoard(boardItem, req.userId, req.role)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }
    await removeItems(PadletBoard, boardItemId);
    return { message: "Board deleted successfully" };
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateBoardId = async (id) => {
  return isIDGood(id);
};

function userHasPermissionForBoard(boardItem, userId, role) {
  if (role.includes("parents")) {
    throw { code: 403, message: "You don't have permission to do this" };
  } else if (role.includes("professor")) {
    return userHasPermissionForProfessor(boardItem, userId);
  }
}

function userHasPermissionForProfessor(boardItem, userId) {
  return boardItem.class.professor.some((professor) => professor.user.toString() === userId);
}

const removeItems = async (model, id) => {
  await deleteItem(model, id);
  const PostForBoard = await getItems(PadletPost, { board: id });
  PostForBoard.forEach(async (post) => {
    if (post.source) {
      const filePath = getPostFilePath(post._id, post.source);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await deleteItem(PadletPost, post._id);
    }
  });

  const SectionForBoard = await getItems(PadletSection, { board: id });
  SectionForBoard.forEach(async (section) => {
    await deleteItem(PadletSection, section._id);
  });
};

function getPostFilePath(postId, file) {
  const uploadDir = path.join(__dirname, "../../../..", "uploads/padlet-posts");
  const extension = file.split(".").pop();
  const fileName = `${postId}_source.${extension}`;

  return path.join(uploadDir, fileName);
}
