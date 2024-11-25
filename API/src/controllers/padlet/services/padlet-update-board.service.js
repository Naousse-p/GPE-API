const { PadletBoard } = require("../../../models");
const { getItemById, updateItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.padlet_update_board_service = async (datas, boardId, req) => {
  try {
    const boardItemId = await validateBoardId(boardId);
    const board = await getBoardById(boardItemId);
    validateBoardExistence(board);

    if (!userHasPermissionForBoard(board, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const updatedBoard = await updateBoard(board, datas);

    return updatedBoard;
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
  return board.class.professor.some((professor) => professor.user.toString() === userId);
};

const updateBoard = async (board, datas) => {
  const updateData = {};

  if (datas.visibleToParents !== undefined) {
    updateData.visibleToParents = datas.visibleToParents;
  }

  if (datas.name !== undefined) {
    updateData.name = datas.name;
  }

  if (datas.color !== undefined) {
    updateData.color = datas.color;
  }

  // Ensure updateData.sharedWithClasses is initialized properly
  updateData.sharedWithClasses = [];

  // Validate and populate sharedWithClasses if datas.sharedWithClasses exists
  if (datas.sharedWithClasses && datas.sharedWithClasses.length > 0) {
    const validateSharedWithClassesIds = await Promise.all(datas.sharedWithClasses.map((id) => validateClassIds(id)));
    updateData.sharedWithClasses = validateSharedWithClassesIds;
  }

  // Update PadletBoard with updateData
  const updatedBoard = await updateItem(PadletBoard, board._id, updateData);

  return updatedBoard;
};

const validateClassIds = async (id) => {
  return isIDGood(id);
};
