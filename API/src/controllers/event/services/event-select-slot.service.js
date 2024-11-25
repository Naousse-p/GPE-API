const { Event, Parent, Professor } = require("../../../models");
const { getItemById, updateItem, getOneItem, deleteItem, getItems } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

const ERROR_MESSAGES = {
  EVENT_NOT_FOUND: "Événement non trouvé",
  NOT_INVITED: "Vous n'êtes pas convié à ce rendez-vous",
  SLOT_NOT_FOUND: "Créneau non trouvé",
  ALREADY_ACCEPTED: "Vous avez déjà accepté ce créneau",
};

async function validateEventId(eventId) {
  await isIDGood(eventId);
}

async function getEvent(eventId) {
  const event = await getItemById(Event, eventId);
  if (!event) {
    throw { code: 404, message: ERROR_MESSAGES.EVENT_NOT_FOUND };
  }
  return event;
}

async function getParent(userId) {
  return await getOneItem(Parent, { user: userId });
}

async function getProfessor(userId) {
  return await getOneItem(Professor, { user: userId });
}

function validateInvitation(event, userId, userRole) {
  if (userRole?.includes("parents")) {
    if (!event.sharedWithParents.includes(userId)) {
      throw { code: 403, message: ERROR_MESSAGES.NOT_INVITED };
    }
  } else if (userRole?.includes("professor")) {
    if (!event.sharedWithProfessors.includes(userId)) {
      throw { code: 403, message: ERROR_MESSAGES.NOT_INVITED };
    }
  }
}

function getSlot(event, slotId) {
  const slot = event.appointmentSlots.id(slotId);
  if (!slot) {
    throw { code: 404, message: ERROR_MESSAGES.SLOT_NOT_FOUND };
  }
  return slot;
}

function validateSlotAcceptance(slot, userId, userRole) {
  if (userRole?.includes("parents")) {
    if (slot.acceptedByParents.includes(userId)) {
      throw { code: 400, message: ERROR_MESSAGES.ALREADY_ACCEPTED };
    }
  } else if (userRole?.includes("professor")) {
    if (slot.acceptedByProfessors.includes(userId)) {
      throw { code: 400, message: ERROR_MESSAGES.ALREADY_ACCEPTED };
    }
  }
}

async function saveEvent(eventId, event) {
  await updateItem(Event, eventId, event);
}

async function deleteUnchosenEvents(eventId, chosenSlotId, groupId) {
  const events = await getItems(Event, { groupId: groupId });

  for (const event of events) {
    if (event._id.toString() !== eventId) {
      await deleteItem(Event, event._id);
    } else {
      const remainingSlots = event.appointmentSlots.filter((slot) => slot._id.toString() === chosenSlotId);
      event.appointmentSlots = remainingSlots;
      // Mettre à jour les heures de début et de fin de l'événement
      event.startTime = remainingSlots[0].startTime;
      event.endTime = remainingSlots[0].endTime;
      event.status = "confirmed";
      await saveEvent(event._id, event);
    }
  }
}

exports.event_select_slot_service = async (eventId, req, slotId) => {
  try {
    await validateEventId(eventId);

    const event = await getEvent(eventId);
    const userRole = req.role;
    let userId;

    if (userRole?.includes("parents")) {
      const parent = await getParent(req.userId);
      userId = parent._id;
    } else if (userRole?.includes("professor")) {
      const professor = await getProfessor(req.userId);
      userId = professor._id;
    } else {
      throw { code: 403, message: "Rôle utilisateur non autorisé" };
    }

    validateInvitation(event, userId, userRole);

    const slot = getSlot(event, slotId);
    validateSlotAcceptance(slot, userId, userRole);

    if (userRole?.includes("parents")) {
      slot.acceptedByParents.push(userId);
    } else if (userRole?.includes("professor")) {
      slot.acceptedByProfessors.push(userId);
    }

    await saveEvent(eventId, event);

    // Supprimer les événements et créneaux non choisis
    await deleteUnchosenEvents(eventId, slotId, event.groupId);

    return slot;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};
