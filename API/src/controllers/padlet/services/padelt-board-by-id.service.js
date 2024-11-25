const { PadletBoard, PadletPost, PadletSection, Parent, Class, School } = require("../../../models");
const { getItemById, getOneItem, getItems } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.padlet_board_by_id_service = async (boardId, req) => {
  try {
    const boardItemId = await validateBoardId(boardId);
    const boardItem = await getBoardById(boardItemId);

    if (!boardItem) {
      throw { code: 404, message: "Board not found" };
    }

    const hasPermission = await userHasPermissionForBoard(boardItem, req.userId, req.role);
    if (!hasPermission) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const populatedBoard = await populateBoardWithSectionsAndPosts(boardItem);

    return populatedBoard;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateBoardId = async (id) => {
  return isIDGood(id);
};

const getBoardById = async (id) => {
  return getItemById(PadletBoard, id, { path: "class", populate: { path: "professor visitors school" } });
};

async function userHasPermissionForBoard(boardItem, userId, role) {
  if (role.includes("parents")) {
    return userHasPermissionForParent(boardItem, userId);
  } else if (role.includes("professor")) {
    return userHasPermissionForProfessor(boardItem, userId);
  }
  return false;
}

async function userHasPermissionForProfessor(boardItem, userId) {
  // Vérifier si l'utilisateur est professeur de la classe principale
  const isProfessorOfMainClass = boardItem.class.professor.some((professor) => professor.user.toString() === userId);

  if (isProfessorOfMainClass) {
    return true;
  }

  // Vérifier si l'utilisateur est un visiteur de la classe principale
  const isVisitorOfMainClass = boardItem.class.visitors.some((visitor) => visitor.user.toString() === userId);

  if (isVisitorOfMainClass) {
    return true;
  }

  // Récupérer l'école associée à la classe principale
  const school = await getItemById(School, boardItem.class.school);
  if (!school) {
    throw { code: 404, message: "School not found" };
  }

  // Vérifier si l'utilisateur est le directeur de l'école
  if (school.director && school.director.toString() === userId) {
    return true;
  }

  // Vérifier si l'utilisateur est professeur de l'une des classes partagées
  const sharedClasses = await Class.find({ _id: { $in: boardItem.sharedWithClasses } }).populate("professor visitors school");
  const isProfessorOfSharedClass = sharedClasses.some((sharedClass) => sharedClass.professor.some((professor) => professor.user.toString() === userId));

  if (isProfessorOfSharedClass) {
    return true;
  }

  // Vérifier si l'utilisateur est un visiteur de l'une des classes partagées
  const isVisitorOfSharedClass = sharedClasses.some((sharedClass) => sharedClass.visitors.some((visitor) => visitor.user.toString() === userId));

  if (isVisitorOfSharedClass) {
    return true;
  }

  // Vérifier si l'utilisateur est le directeur de l'école de l'une des classes partagées
  const isDirectorOfSharedClassSchool = sharedClasses.some((sharedClass) => sharedClass.school.director && sharedClass.school.director.toString() === userId);

  return isDirectorOfSharedClassSchool;
}

async function userHasPermissionForParent(boardItem, userId) {
  if (!boardItem.visibleToParents) {
    throw { code: 403, message: "You don't have permission to access this resource" };
  }

  const parent = await getOneItem(Parent, { user: userId });
  if (!parent) {
    throw { code: 403, message: "You don't have permission to access this resource" };
  }

  return parent.children.some((child) => child.class.toString() === boardItem.class._id.toString());
}

const populateBoardWithSectionsAndPosts = async (boardItem) => {
  const sections = await getItems(
    PadletSection,
    { board: boardItem._id },
    {
      path: "board",
    }
  );

  const boardItemClone = JSON.parse(JSON.stringify(boardItem));

  const sectionPromises = sections.map(async (section) => {
    const posts = await getItems(PadletPost, { sectionId: section._id });
    const sectionObj = section.toObject();
    sectionObj.posts = posts;
    return sectionObj;
  });

  const populatedSections = await Promise.all(sectionPromises);

  boardItemClone.sections = populatedSections;

  return boardItemClone;
};
