const { Event, Class, School, Professor, Parent } = require("../../../models");
const { createItem, getItemById, getItems } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { v4: uuidv4 } = require("uuid");

exports.event_create_appointment_service = async (datas, classId, req, force = false) => {
  try {
    const classItemId = await validateClassId(classId);
    const classItem = await getClassById(classItemId);
    validateClassExistence(classItem);

    if (!userHasPermissionForClass(classItem, req.userId)) {
      throw { code: 403, message: "Vous n'avez pas la permission de créer un événement pour cette classe" };
    }

    const { slotsByDay, conflicts, appointmentConflicts } = await generateAppointmentSlots(datas, req.userId);

    if (appointmentConflicts.length > 0) {
      return { conflict: true, conflicts: appointmentConflicts, message: "Conflit avec des événements de type appointment" };
    }

    if (Object.keys(slotsByDay).length === 0 && conflicts.length > 0 && !force) {
      return { conflict: true, conflicts, message: "Conflit avec des événements de type personal ou informational" };
    }

    const createdEvents = [];
    const groupId = uuidv4(); // Générer un groupId unique pour les événements liés
    for (const [date, slots] of Object.entries(slotsByDay)) {
      const event = await createEventInstance(datas, classItemId, req.userId, req.role, slots, date, groupId);
      const createdEvent = await createItem(Event, event);
      createdEvents.push(createdEvent);
    }

    return { conflict: conflicts.length > 0, events: createdEvents, conflicts };
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

const createEventInstance = (datas, classId, userId, userRole, appointmentSlots, date, groupId) => {
  const event = {
    title: datas.title,
    class: classId,
    description: datas.description || null,
    eventType: "appointment",
    date: date,
    startTime: appointmentSlots[0].startTime,
    endTime: appointmentSlots[appointmentSlots.length - 1].endTime,
    location: datas.location || null,
    isVisible: datas.isVisible || false,
    school: classId.school,
    status: "pending",
    appointmentSlots: appointmentSlots,
    sharedWithProfessors: datas.sharedWithProfessors || [],
    sharedWithParents: datas.sharedWithParents || [],
    groupId: groupId, // Ajouter le groupId à l'événement
  };

  if (userRole.includes("parents")) {
    event.parent = userId;
  } else {
    event.professor = userId;
  }

  return event;
};

const generateAppointmentSlots = async (datas, userId) => {
  const slotsByDay = {};
  const conflicts = [];
  const appointmentConflicts = [];

  if (datas.startTime && datas.endTime && datas.duration) {
    const start = new Date(datas.startTime);
    const end = new Date(datas.endTime);
    const duration = datas.duration * 60000;

    for (let time = start; time < end; time = new Date(time.getTime() + duration)) {
      const slotStartTime = time.toISOString();
      const slotEndTime = new Date(time.getTime() + duration).toISOString();
      const slotDate = slotStartTime.split("T")[0]; // Obtenir la date sans l'heure

      const { hasConflict, conflictType } = await checkSlotConflict(userId, slotDate, slotStartTime, slotEndTime);
      if (!hasConflict) {
        if (!slotsByDay[slotDate]) {
          slotsByDay[slotDate] = [];
        }
        slotsByDay[slotDate].push({
          startTime: slotStartTime,
          endTime: slotEndTime,
          confirmed: false,
        });
      } else {
        if (conflictType === "appointment") {
          appointmentConflicts.push({ startTime: slotStartTime, endTime: slotEndTime });
        } else {
          conflicts.push({ startTime: slotStartTime, endTime: slotEndTime });
        }
      }
    }
  }

  if (datas.appointmentSlots) {
    for (const slot of datas.appointmentSlots) {
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);
      const slotDate = slotStart.toISOString().split("T")[0]; // Obtenir la date sans l'heure

      if (datas.duration) {
        const duration = datas.duration * 60000;
        for (let time = slotStart; time < slotEnd; time = new Date(time.getTime() + duration)) {
          const subSlotStartTime = time.toISOString();
          const subSlotEndTime = new Date(time.getTime() + duration).toISOString();

          const { hasConflict, conflictType } = await checkSlotConflict(userId, slotDate, subSlotStartTime, subSlotEndTime);
          if (!hasConflict) {
            if (!slotsByDay[slotDate]) {
              slotsByDay[slotDate] = [];
            }
            slotsByDay[slotDate].push({
              startTime: subSlotStartTime,
              endTime: subSlotEndTime,
              confirmed: false,
            });
          } else {
            if (conflictType === "appointment") {
              appointmentConflicts.push({ startTime: subSlotStartTime, endTime: subSlotEndTime });
            } else {
              conflicts.push({ startTime: subSlotStartTime, endTime: subSlotEndTime });
            }
          }
        }
      } else {
        const { hasConflict, conflictType } = await checkSlotConflict(userId, slotDate, slot.startTime, slot.endTime);
        if (!hasConflict) {
          if (!slotsByDay[slotDate]) {
            slotsByDay[slotDate] = [];
          }
          slotsByDay[slotDate].push({
            startTime: slot.startTime,
            endTime: slot.endTime,
            confirmed: false,
          });
        } else {
          if (conflictType === "appointment") {
            appointmentConflicts.push({ startTime: slot.startTime, endTime: slot.endTime });
          } else {
            conflicts.push({ startTime: slot.startTime, endTime: slot.endTime });
          }
        }
      }
    }
  }

  return { slotsByDay, conflicts, appointmentConflicts };
};

const checkSlotConflict = async (userId, date, startTime, endTime) => {
  try {
    // Log des paramètres de la requête

    // Récupérer tous les événements pour la même date et impliquant le même professeur ou parent
    const events = await getItems(Event, {
      date: date,
      $or: [{ professor: userId }, { parent: userId }],
    });

    for (const event of events) {
      for (const slot of event.eventType === "appointment" ? event.appointmentSlots : [event]) {
        const existingStart = new Date(slot.startTime);
        const existingEnd = new Date(slot.endTime);

        if (
          (new Date(startTime) < existingEnd && new Date(startTime) >= existingStart) ||
          (new Date(endTime) > existingStart && new Date(endTime) <= existingEnd) ||
          (new Date(startTime) <= existingStart && new Date(endTime) >= existingEnd)
        ) {
          return { hasConflict: true, conflictType: event.eventType };
        }
      }
    }

    return { hasConflict: false };
  } catch (error) {
    console.error("Erreur lors de la vérification des conflits :", error);
    throw error;
  }
};
