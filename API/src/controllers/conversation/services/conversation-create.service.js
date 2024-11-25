const { Conversation, User, Parent, Professor, Class } = require("../../../models");
const { createItem, getItemById, getOneItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.conversation_create_service = async (data, classId, req) => {
  try {
    await validateClassAndUserAccess(classId, req.userId, req.role);

    addCurrentUserToParticipants(data, req.userId);
    const participantsIds = await validateParticipants(data.participants);

    await validateConversationIsNotCreated(participantsIds, classId);

    const newConversation = await createNewConversation(participantsIds, data, classId);
    return newConversation;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

async function validateClassAndUserAccess(classId, userId, role) {
  try {
    await isIDGood(classId);
    const classroom = await getItemById(Class, classId, "professor");
    validateClassExistence(classroom);
    await validateUserAccessToClassroom(classroom, userId, role);
  } catch (error) {
    throw error;
  }
}

function validateClassExistence(classroom) {
  if (!classroom) {
    throw { code: 404, message: "Classroom not found" };
  }
}

async function validateUserAccessToClassroom(classroom, userId, role) {
  try {
    if (role.includes("parents")) {
      const parent = await getOneItem(Parent, { user: userId }, "children");
      if (!parent) {
        throw { code: 404, message: "Parent not found" };
      }
      const hasChildInClass = parent.children.some((child) => child.class.toString() === classroom._id.toString());
      if (!hasChildInClass) {
        throw { code: 403, message: "You are not allowed to access this classroom" };
      }
    } else {
      const userRole = classroom.professor.find((user) => user.user.toString() === userId);
      if (!userRole) {
        throw { code: 403, message: "You are not allowed to access this classroom" };
      }
    }
  } catch (error) {
    throw error;
  }
}

function addCurrentUserToParticipants(data, userId) {
  data.participants.push({ user: userId, role: "admin", isAdmin: true });
}

async function validateConversationIsNotCreated(participants, classId) {
  try {
    const conversations = await Conversation.find({
      participants: { $elemMatch: { user: { $in: participants.map((p) => p.user) } } },
      class: classId,
    });

    for (const conversation of conversations) {
      if (conversation.participants.length === participants.length) {
        const conversationParticipantIds = conversation.participants.map((p) => p.user.toString());
        const newParticipantIds = participants.map((p) => p.user.toString());
        const isEqual = conversationParticipantIds.every((id) => newParticipantIds.includes(id));
        if (isEqual) {
          throw { code: 400, message: "Conversation with the same participants already exists" };
        }
      }
    }
  } catch (error) {
    throw error;
  }
}

async function validateParticipants(participants) {
  try {
    const participantsIds = [];
    for (const participant of participants) {
      let participantId;
      if (typeof participant === "string") {
        participantId = await isIDGood(participant);
      } else if (typeof participant === "object" && participant.user) {
        participantId = await isIDGood(participant.user);
      } else {
        throw { code: 422, message: "ID_MALFORMED" };
      }
      const user = await getItemById(User, participantId, "roles");
      if (!user) {
        throw { code: 404, message: "User not found" };
      }
      const model = user.roles.some((role) => role.name === "parents") ? Parent : Professor;
      const participantData = await getOneItem(model, { user: participantId.toString() });
      if (!participantData) {
        throw { code: 404, message: `${participant.role} not found` };
      }

      participantsIds.push({ user: participantId, role: participant.role || "participant", name: participantData.lastname + " " + participantData.firstname, isAdmin: participant.isAdmin || false });
    }
    return participantsIds;
  } catch (error) {
    throw error;
  }
}

function createNewConversation(participants, data, classId) {
  return createItem(Conversation, { participants, title: data.title, class: classId, group: participants.length > 2 });
}
