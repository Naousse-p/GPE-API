const { Conversation, User, Class, Parent, Professor } = require("../../../models");
const { getItemById, getOneItem, getItems } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.conversation_get_user_than_can_be_add_service = async (conversationId, req) => {
  try {
    await isIDGood(conversationId);
    const conversation = await getItemById(Conversation, conversationId);
    if (!conversation) {
      throw { code: 404, message: "Conversation not found" };
    }
    if (!userHasPermissionForConversation(conversation, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }
    return getUserThanCanBeAdd(conversation, req.userId, req);
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const userHasPermissionForConversation = (conversation, userId) => {
  return conversation.participants.some((participant) => participant.user.toString() === userId);
};

const getUserThanCanBeAdd = async (conversation, userId, req) => {
  const [parents, teacher] = await Promise.all([getParentOfTheClass(conversation.class), getTeacherOfTheClass(conversation.class, req.userId, req.role)]);

  return getUsersThanCanBeAdd(conversation, parents, teacher, userId, req.role);
};

const getParentOfTheClass = async (classId) => {
  return await getItems(Parent, { children: { $elemMatch: { class: classId } } });
};

const getTeacherOfTheClass = async (classId, userId, role) => {
  return await getOneItem(Class, { _id: classId }, { path: "professor" });
};

const getUsersThanCanBeAdd = async (conversation, parents, teacher, userId, userRole) => {
  const participantsIds = conversation.participants.map((participant) => participant.user.toString());
  let parentsList = [];
  let teachersList = [];

  // Ajouter les parents qui ne sont pas déjà participants
  for (const parent of parents) {
    if (!participantsIds.includes(parent.user.toString())) {
      if (userRole.includes("parent") && parent.user.toString() === userId) {
        continue; // Exclure le parent actuel
      }
      parentsList.push({ user: parent.user, role: "parent", lastname: parent.lastname, firstname: parent.firstname });
    }
  }

  // Ajouter les enseignants qui ne sont pas déjà participants
  if (teacher && Array.isArray(teacher.professor)) {
    for (const prof of teacher.professor) {
      if (!participantsIds.includes(prof.user.toString())) {
        if (userRole.includes("professor") && prof.user.toString() === userId) {
          continue; // Exclure l'enseignant actuel
        }
        teachersList.push({ user: prof.user, role: "professor", lastname: prof.lastname, firstname: prof.firstname });
      }
    }
  }

  return { parents: parentsList, teachers: teachersList };
};
