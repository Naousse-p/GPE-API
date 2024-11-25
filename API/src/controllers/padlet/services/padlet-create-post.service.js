const { PadletPost, PadletSection } = require("../../../models");
const { createItem, getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { saveSourceFile } = require("../../../utils/multer");

exports.padlet_create_post_service = async (datas, sectionId, req) => {
  try {
    const sectionItemId = await validateSectionId(sectionId);
    const section = await getSectionById(sectionItemId);
    validateSectionExistence(section);

    if (!userHasPermissionForSection(section, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const post = await createPostInstance(datas, sectionItemId, section.board, req.userId);
    const createdPost = await createItem(PadletPost, post);

    if (req.file) {
      const extension = req.file.originalname.split(".").pop();
      const filePath = await saveSourceFile(req.file.buffer, createdPost._id, "padlet-posts", extension, false);
      createdPost.source = filePath;
    } else if (["youtube", "link"].includes(datas.type)) {
      createdPost.url = datas.url;
    }

    await createdPost.save();

    return createdPost;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateSectionId = async (id) => {
  return isIDGood(id);
};

const getSectionById = async (id) => {
  return getItemById(PadletSection, id, { path: "board", populate: { path: "class", populate: { path: "professor" } } });
};

const validateSectionExistence = (section) => {
  if (!section) {
    throw { code: 404, message: "Section not found" };
  }
};

const userHasPermissionForSection = (section, userId) => {
  return section.board.class.professor.some((professor) => professor.user.toString() === userId);
};

const createPostInstance = (datas, sectionId, board, userId) => {
  return {
    title: datas.title || null,
    content: datas.content || null,
    type: datas.type,
    sectionId: sectionId,
    creator: userId,
    board: board,
    url: datas.url || null,
  };
};
