const { Event, Class, Professor, Parent } = require("../../../models");
const { getItemById, getOneItem, getItems } = require("../../../utils/db-generic-services.utils");

exports.event_get_all_type_service = async (req, classId) => {
  try {
    let events = [];
    if (req.role.includes("professor")) {
      events = await getEventsForProfessor(req.userId, classId);
    } else if (req.role.includes("parents")) {
      events = await getEventsForParent(req.userId, classId);
    } else {
      throw { code: 403, message: "Rôle utilisateur non autorisé" };
    }

    return events;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const getEventsForProfessor = async (userId, classId) => {
  const professor = await getOneItem(Professor, { user: userId });

  const appointmentEvents = await getItems(
    Event,
    {
      eventType: "appointment",
      $or: [{ professor: professor.user }, { professor: professor._id }, { sharedWithProfessors: professor.user }, { sharedWithProfessors: professor._id }],
    },
    "sharedWithParents sharedWithProfessors"
  );

  const personalAndInformationalEvents = await getItems(
    Event,
    {
      eventType: { $in: ["personal", "informational"] },
      $or: [{ professor: userId }, { class: classId }, { sharedWithProfessors: professor.user }],
    },
    "sharedWithParents sharedWithProfessors"
  );

  const transformPersonalAndInformationalEvents = personalAndInformationalEvents.map((event) => {
    const isCreator = event.professor?.toString() === userId.toString();
    return {
      ...event.toObject(),
      isCreator: isCreator,
    };
  });

  const transformedAppointmentEvents = appointmentEvents.map((event) => {
    const isCreator = event.professor?.toString() === userId.toString();
    return {
      ...event.toObject(),
      isCreator: isCreator,
    };
  });

  return [...transformedAppointmentEvents, ...transformPersonalAndInformationalEvents];
};

const getEventsForParent = async (userId, classId) => {
  const parent = await getOneItem(Parent, { user: userId });

  const appointmentEvents = await getItems(
    Event,
    {
      eventType: "appointment",
      $or: [{ parent: parent._id }, { parent: parent.user }, { sharedWithParents: parent._id }, { sharedWithParents: parent.user }],
    },
    "sharedWithParents professor sharedWithProfessors"
  );

  const informationalEvents = await getItems(Event, {
    eventType: "informational",
    class: classId,
    isVisible: true,
  });

  const transformedAppointmentEvents = appointmentEvents.map((event) => {
    const isCreator = event.parent?.toString() === userId;

    return {
      ...event.toObject(),
      sharedWithParents: event.sharedWithParents.map((parent) => ({
        firstname: parent.firstname,
        lastname: parent.lastname,
      })),
      isCreator: isCreator,
    };
  });

  return [...transformedAppointmentEvents, ...informationalEvents];
};
