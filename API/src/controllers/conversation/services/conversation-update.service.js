const { Conversation, User } = require("../../../models");
const { getItemById, updateItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.conversation_update_service = async (id, data, req) => {
  try {
    const conversationId = await validateConversationId(id);
    const conversation = await getConversationById(conversationId);
    validateConversationExistence(conversation);

    if (!userHasPermissionForConversation(conversation, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const updateData = await prepareUpdateData(data, conversation, req.userId);
    const updatedConversation = await updateConversation(conversationId, updateData);
    return updatedConversation;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

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

async function prepareUpdateData(data, conversation, userId) {
  const updateData = {};
  if (data.title) updateData.title = data.title;

  if (data.participants) {
    updateData.participants = data.participants;
  }

  if (updateData.participants && updateData.participants.length <= 2) {
    updateData.group = updateData.participants.length > 2;
  }

  return updateData;
}

async function updateConversation(id, data) {
  return await updateItem(Conversation, id, data);
}
