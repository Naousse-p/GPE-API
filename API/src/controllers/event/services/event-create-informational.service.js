const { Event, Class, School } = require("../../../models");
const { createItem, getItemById, getItems } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.event_create_informational_service = async (datas, classId, req, force = false) => {
  try {
    const classItemId = await validateClassId(classId);
    const classItem = await getClassById(classItemId);
    validateClassExistence(classItem);

    if (!userHasPermissionForClass(classItem, req.userId)) {
      throw { code: 403, message: "Vous n'avez pas la permission de créer un événement pour cette classe" };
    }

    const conflicts = await checkForScheduleConflicts(req.userId, datas.date, datas.startTime, datas.endTime);

    if (conflicts.length > 0 && !force) {
      return { conflict: true, conflicts };
    }

    const event = await createEventInstance(datas, classItemId, req.userId);
    const createdEvent = await createItem(Event, event);

    return { conflict: false, event: createdEvent };
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateClassId = async (id) => {
  return isIDGood(id);
};

const getClassById = async (id) => {
  return getItemById(Class, id, "professor school");
};

const validateClassExistence = (classItem) => {
  if (!classItem) {
    throw { code: 404, message: "Classe non trouvée" };
  }
};

const userHasPermissionForClass = async (classItem, userId) => {
  const isProfessorOfClass = classItem.professor.some((professor) => professor.user.toString() === userId);
  if (isProfessorOfClass) {
    return true;
  }

  const school = await School.findById(classItem.school).populate("professor");
  const isProfessorOfSchool = school.professor.some((professor) => professor.user.toString() === userId);

  return isProfessorOfSchool;
};

const checkForScheduleConflicts = async (userId, date, startTime, endTime) => {
  const events = await getItems(Event, {
    professor: userId,
    date: date,
    $or: [{ startTime: { $lt: endTime, $gte: startTime } }, { endTime: { $gt: startTime, $lte: endTime } }, { startTime: { $lte: startTime }, endTime: { $gte: endTime } }],
  });

  return events;
};

const createEventInstance = (datas, classId, userId) => {
  return {
    title: datas.title,
    class: classId,
    description: datas.description || null,
    eventType: "informational",
    date: datas.date,
    startTime: datas.startTime,
    endTime: datas.endTime,
    location: datas.location || null,
    isVisible: datas.isVisible || false,
    school: classId.school,
    professor: userId,
    status: "confirmed",
  };
};
