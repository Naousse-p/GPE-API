const { Conversation, User, Parent, Professor } = require("../../../models/");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { getItemById, getOneItem, updateItem } = require("../../../utils/db-generic-services.utils");

exports.conversation_add_participant_service = async (id, body, req) => {
  try {
    const conversationId = await validateConversationId(id);
    const conversation = await getConversationById(conversationId);
    validateConversationExistence(conversation);

    if (!userHasPermissionForConversation(conversation, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    // Verify if the user is admin
    if (!isUserAdmin(conversation, req.userId)) {
      throw { code: 403, message: "Only admins can add participants to the conversation" };
    }

    // Prepare update data
    const updateData = await prepareUpdateData(conversation, body.participants);

    // Check for existing conversation with the same participants
    const existingConversation = await findConversationByParticipants(updateData.participants, conversation);
    if (existingConversation) {
      return existingConversation;
    } else {
      const updatedConversation = await updateConversation(conversationId, updateData);
      return updatedConversation;
    }
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

async function findConversationByParticipants(participants, conversation) {
  const conversations = await Conversation.find({
    participants: { $elemMatch: { user: { $in: participants.map((p) => p.user) } } },
    class: conversation.class,
  });
  for (const conversation of conversations) {
    if (conversation.participants.length === participants.length) {
      const conversationParticipantIds = conversation.participants.map((p) => p.user.toString());
      const newParticipantIds = participants.map((p) => p.user.toString());
      const isEqual = conversationParticipantIds.every((id) => newParticipantIds.includes(id));
      if (isEqual) {
        return conversation;
      }
    }
  }
  return null;
}

async function validateConversationId(id) {
  return await isIDGood(id);
}

async function getConversationById(id) {
  return await getItemById(Conversation, id, "participants");
}

function validateConversationExistence(conversation) {
  if (!conversation) {
    throw { code: 404, message: "Conversation not found" };
  }
}

function userHasPermissionForConversation(conversation, userId) {
  return conversation.participants.some((participant) => participant.user.toString() === userId);
}

async function prepareUpdateData(conversation, newParticipants) {
  const currentParticipants = conversation.participants.map((participant) => ({
    user: participant.user.toString(),
    role: participant.role,
    name: participant.name,
  }));

  const newParticipantsData = await Promise.all(
    newParticipants.map(async (participant) => {
      const participantId = participant.user ? participant.user.toString() : participant.toString();
      const user = await getItemById(User, participantId, "roles");
      if (!user) {
        throw { code: 404, message: "User not found" };
      }
      const model = user.roles.some((role) => role.name === "parents") ? Parent : Professor;
      const participantData = await getOneItem(model, { user: participantId });
      if (!participantData) {
        throw { code: 404, message: "Participant not found" };
      }
      return {
        user: participantId,
        role: participant.role || "participant",
        name: participantData.lastname + " " + participantData.firstname,
      };
    })
  );

  const allParticipants = [...new Map([...currentParticipants, ...newParticipantsData].map((p) => [p.user, p])).values()];

  return { participants: allParticipants, group: allParticipants.length > 2 };
}

async function updateConversation(id, data) {
  return await updateItem(Conversation, id, data);
}

function isUserAdmin(conversation, userId) {
  const user = conversation.participants.find((participant) => participant.user.toString() === userId);
  return user && user.role === "admin";
}
