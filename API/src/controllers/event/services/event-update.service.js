const { Event, Class, School, Parent } = require("../../../models");
const { getItemById, updateItem, getOneItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.event_update_service = async (eventId, datas, req) => {
  try {
    // Valider l'ID de l'événement
    const eventItemId = await validateEventId(eventId);
    const eventItem = await getEventById(eventItemId);
    validateEventExistence(eventItem);

    // Vérifier si l'utilisateur a la permission de modifier l'événement
    if (!(await userHasPermissionForEvent(eventItem, req.userId, req.role))) {
      throw { code: 403, message: "Vous n'avez pas la permission de modifier cet événement" };
    }

    // Vérifier le type de l'événement et les conditions de modification
    if (eventItem.eventType === "appointment" && eventItem.status !== "pending") {
      throw { code: 403, message: "Vous ne pouvez modifier un rendez-vous que si son statut est 'pending'" };
    }

    // Mettre à jour l'événement avec les nouvelles données
    const updatedEvent = await updateEventInstance(eventItem, datas);
    const result = await updateItem(Event, eventItemId, updatedEvent);

    return result;
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

const updateEventInstance = (eventItem, datas) => {
  if (eventItem.eventType === "appointment" && eventItem.status === "pending") {
    return {
      ...eventItem._doc,
      ...datas,
    };
  } else if (eventItem.eventType === "personal" || eventItem.eventType === "informational") {
    return {
      ...eventItem._doc,
      ...datas,
    };
  } else {
    throw { code: 403, message: "Vous ne pouvez pas modifier cet événement" };
  }
};
