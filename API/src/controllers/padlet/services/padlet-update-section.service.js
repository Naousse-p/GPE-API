const { PadletPost, PadletSection } = require("../../../models");
const { getItemById, updateItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.padlet_update_section_service = async (datas, sectionId, req) => {
  try {
    const sectionItemId = await validateSectionId(sectionId);
    const section = await getSectionById(sectionItemId);
    validateSectionExistence(section);

    if (!userHasPermissionForSection(section, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const updatedSection = await updateSection(section, datas);

    return updatedSection;
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
  for (const professor of section.board.class.professor) {
    if (professor.user.toString() === userId) {
      return true;
    }
  }
  return false;
};

const updateSection = async (section, datas) => {
  const updateData = {};

  if (datas.title !== undefined) {
    updateData.title = datas.title;
  }

  const updatedSection = await updateItem(PadletSection, section._id, updateData);

  return updatedSection;
};

const validateClassIds = async (id) => {
  return isIDGood(id);
};
