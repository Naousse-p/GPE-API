// sticker/services/sticker-create.service.js
const { Sticker, Class } = require("../../../models");
const { getOneItem, createItem, getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { saveSourceFile } = require("../../../utils/multer");

const crypto = require("crypto");

exports.sticker_create_service = async (name, description, category, classId, req) => {
  try {
    const classItemId = await validateClassId(classId);
    const fileBuffer = getFileBufferFromRequest(req);

    const classroom = await getClassroomById(classItemId);
    validateClassroomExistence(classroom);

    if (!userHasPermissionForClass(classroom, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const md5 = calculateMD5(fileBuffer, name, classItemId);
    await validateStickerUniqueness(md5, name);

    const sticker = createStickerInstance(name, description, category, classItemId, md5);
    const createdSticker = await saveStickerToDatabase(sticker, fileBuffer);

    return createdSticker;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateClassId = async (id) => {
  return isIDGood(id);
};

const getFileBufferFromRequest = (req) => {
  if (!req.file?.buffer) {
    throw { code: 422, message: "Source file is required" };
  }
  return req.file.buffer;
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

const calculateMD5 = (fileBuffer, name, classItemId) => {
  return crypto
    .createHash("md5")
    .update(fileBuffer + name + classItemId)
    .digest("hex");
};

const validateStickerUniqueness = async (md5, name) => {
  const existingSticker = await getOneItem(Sticker, { md5, name });
  if (existingSticker) {
    throw { code: 409, message: "Sticker already exists" };
  }
};

const saveStickerToDatabase = async (sticker, fileBuffer) => {
  const filePath = await saveSourceFile(fileBuffer, sticker._id, "sticker", "jpg", false);
  sticker.source = filePath;
  return await createItem(Sticker, sticker);
};

const createStickerInstance = (name, description, category, classItemId, md5) => {
  return new Sticker({ name, description, category, class: classItemId, md5 });
};
