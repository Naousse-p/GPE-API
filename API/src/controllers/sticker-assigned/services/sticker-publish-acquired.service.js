const { AcquiredSticker, Class, Student } = require("../../../models");
const { getItemById, getItems, updateItems } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.sticker_publish_acquired_service = async (classroomId, req) => {
  try {
    const classroomItemId = await validateClassroomId(classroomId);
    const classroom = await getClassroomById(classroomItemId);
    validateClassroomExistence(classroom);

    if (!userHasAccessToClassroom(req.userId, classroom)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const acquiredStickerToPublish = await getAcquiredStickerToPublish(classroomItemId);
    updateItems(AcquiredSticker, { _id: { $in: acquiredStickerToPublish.map((sticker) => sticker._id) } }, { isPublished: true });

    return acquiredStickerToPublish;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateClassroomId = async (id) => {
  return isIDGood(id);
};

const getClassroomById = async (id) => {
  return getItemById(Class, id, { path: "professor" });
};

const validateClassroomExistence = (classroom) => {
  if (!classroom) {
    throw { code: 404, message: "Classroom not found" };
  }
};

const userHasAccessToClassroom = (userId, classroom) => {
  return classroom.professor.some((professor) => professor.user.toString() === userId);
};

const getAcquiredStickerToPublish = async (classroomId) => {
  // Trouver tous les étudiants dans la classe
  const studentsInClass = await getItems(Student, { class: classroomId });

  // Récupérer les IDs des étudiants
  const studentIds = studentsInClass.map((student) => student._id);

  // Recherche des AcquiredSticker pour les étudiants dans la classe qui ne sont pas publiés
  const acquiredStickerToUpdate = await getItems(AcquiredSticker, { student: { $in: studentIds }, isPublished: false });

  if (!acquiredStickerToUpdate || acquiredStickerToUpdate.length === 0) {
    return [];
  }

  return acquiredStickerToUpdate;
};
