const { Event, Class, School } = require("../../../models");
const { getItemById, deleteItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.event_remove_service = async (eventId, req) => {
  try {
    // Valider l'ID de l'événement
    const eventItemId = await validateEventId(eventId);
    const eventItem = await getEventById(eventItemId);
    validateEventExistence(eventItem);

    // Vérifier si l'utilisateur a la permission de supprimer l'événement
    if (!(await userHasPermissionForEvent(eventItem, req.userId, req.role))) {
      throw { code: 403, message: "Vous n'avez pas la permission de supprimer cet événement" };
    }

    // Supprimer l'événement
    await deleteItem(Event, eventItemId);

    return { message: "Événement supprimé avec succès" };
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateEventId = async (id) => {
  return isIDGood(id);
};

const getEventById = async (id) => {
  return getItemById(Event, id);
};

const validateEventExistence = (eventItem) => {
  if (!eventItem) {
    throw { code: 404, message: "Événement non trouvé" };
  }
};

const userHasPermissionForEvent = async (eventItem, userId, userRole) => {
  if (userRole.includes("professor")) {
    if (eventItem.professor.toString() === userId) {
      return true;
    }

    const classItem = await getItemById(Class, eventItem.class, "professor school");
    const isProfessorOfClass = classItem.professor.some((professor) => professor.user.toString() === userId);
    if (isProfessorOfClass) {
      return true;
    }

    const school = await School.findById(classItem.school).populate("professor");
    const isProfessorOfSchool = school.professor.some((professor) => professor.user.toString() === userId);

    return isProfessorOfSchool;
  } else if (userRole.includes("parents")) {
    if (eventItem.parent.toString() === userId) {
      return true;
    }
  }

  return false;
};
