const { Class, PadletBoard } = require("../../../models");
const { createItem, getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const generateRandomPastelColor = require("../helpers/generate-random-color"); // Mise à jour de l'importation

exports.padlet_create_board_service = async (datas, classId, req) => {
  try {
    const classItemId = await validateClassId(classId);
    const classroom = await getClassroomById(classItemId);
    validateClassroomExistence(classroom);

    if (!userHasPermissionForClass(classroom, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const board = createBoardInstance(datas, classItemId);
    const createdBoard = await createItem(PadletBoard, board);

    return createdBoard;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateClassId = async (id) => {
  return isIDGood(id);
};

const getClassroomById = async (id) => {
  return getItemById(Class, id, "professor");
};

const validateClassroomExistence = (classroom) => {
  if (!classroom) {
    throw { code: 404, message: "Class not found" };
  }
};

const userHasPermissionForClass = (cls, userId) => {
  for (const professor of cls.professor) {
    if (professor.user.toString() === userId) {
      return true;
    }
  }
  return false;
};

const createBoardInstance = (datas, classId) => {
  return {
    name: datas.name,
    color: datas.color || generateRandomPastelColor(),
    class: classId,
    visibleToParents: datas.visibleToParents,
  };
};
