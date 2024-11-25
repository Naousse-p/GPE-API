const { PadletBoard, PadletSection } = require("../../../models");
const { createItem, getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.padlet_create_section_service = async (datas, boardId, req) => {
  try {
    const boardItemId = await validateBoardId(boardId);
    const board = await getBoardById(boardItemId);
    validateBoardExistence(board);

    if (!userHasPermissionForBoard(board, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const section = createSectionInstance(datas, boardItemId);
    const createdSection = await createItem(PadletSection, section);

    return createdSection;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateBoardId = async (id) => {
  return isIDGood(id);
};

const getBoardById = async (id) => {
  return getItemById(PadletBoard, id, { path: "class", populate: { path: "professor" } });
};

const validateBoardExistence = (board) => {
  if (!board) {
    throw { code: 404, message: "Board not found" };
  }
};

const userHasPermissionForBoard = (board, userId) => {
  for (const professor of board.class.professor) {
    if (professor.user.toString() === userId) {
      return true;
    }
  }
  return false;
};

const createSectionInstance = (datas, boardId) => {
  return {
    title: datas.title,
    board: boardId,
  };
};
