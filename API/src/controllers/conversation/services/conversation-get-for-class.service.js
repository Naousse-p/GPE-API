const { Conversation, Class, Parent, Message } = require("../../../models");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { getItemById, getItems, getOneItem } = require("../../../utils/db-generic-services.utils");
const mongoose = require("mongoose");

async function validateClassId(classId) {
  await isIDGood(classId);
}

async function isUserLinkedToClass(userId, classId) {
  const classData = await getItemById(Class, classId, "professor visitors");
  if (!classData) {
    throw { code: 404, message: "Class not found" };
  }

  const isProfessorLinkedToClass = classData.professor.some((prof) => prof.user.equals(userId)) || classData.visitors.some((visitor) => visitor.user.equals(userId));

  const parentData = await getOneItem(Parent, { user: userId }, "children.class");
  const isParentLinkedToClass = parentData && parentData.children.some((child) => child.class.equals(classId));

  if (!isProfessorLinkedToClass && !isParentLinkedToClass) {
    throw { code: 403, message: "You don't have permission to access this class" };
  }
}

async function countUnreadMessages(userId, conversationId) {
  return await Message.countDocuments({
    conversation: conversationId,
    sender: { $ne: userId },
    isRead: false,
    "readBy.userId": { $ne: userId },
  });
}

async function getConversations(userId, classId) {
  const conversations = await getItems(Conversation, { class: classId, "participants.user": userId });

  const conversationsWithUnreadCount = await Promise.all(
    conversations.map(async (conversation) => {
      const unreadCount = await countUnreadMessages(userId, conversation._id);
      return {
        ...conversation.toObject(),
        unreadCount,
      };
    })
  );

  return conversationsWithUnreadCount;
}

async function countTotalUnreadMessages(userId, classId) {
  const conversations = await getConversations(userId, classId);
  return conversations.reduce((total, conversation) => total + conversation.unreadCount, 0);
}

function maskCurrentUserFromParticipants(conversations, userId) {
  return conversations.map((conversation) => {
    const filteredParticipants = conversation.participants.filter((participant) => !participant.user.equals(userId));
    return {
      ...conversation,
      participants: filteredParticipants,
    };
  });
}

exports.conversation_get_for_class_service = async (req, classId) => {
  await validateClassId(classId);
  await isUserLinkedToClass(req.userId, classId);
  const conversations = await getConversations(req.userId, classId);
  const maskedConversations = maskCurrentUserFromParticipants(conversations, req.userId);
  const totalUnreadMessages = await countTotalUnreadMessages(req.userId, classId);
  return {
    conversations: maskedConversations,
    totalUnreadMessages,
  };
};
