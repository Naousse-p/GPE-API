const { WallpostReaction, Parent } = require("../../../models");
const { getItemById, deleteItem, getOneItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.wallpost_remove_reaction_service = async (reactionId, req) => {
  try {
    const reactionItemId = await validateReactionId(reactionId);
    const reactionItem = await getReactionById(reactionItemId);
    validateReactionExistence(reactionItem);

    const parent = await getParentByUserId(req.userId);
    validateParentOwnership(reactionItem, parent);

    await deleteReaction(reactionItemId);

    return { message: "Réaction supprimée avec succès" };
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateReactionId = async (id) => {
  return isIDGood(id);
};

const getReactionById = async (id) => {
  return getItemById(WallpostReaction, id);
};

const validateReactionExistence = (reactionItem) => {
  if (!reactionItem) {
    throw { code: 404, message: "Réaction non trouvée" };
  }
};

const getParentByUserId = async (userId) => {
  return getOneItem(Parent, { user: userId });
};

const validateParentOwnership = (reactionItem, parent) => {
  if (reactionItem.parent.toString() !== parent._id.toString()) {
    throw { code: 403, message: "Vous n'avez pas la permission de supprimer cette réaction" };
  }
};

const deleteReaction = async (reactionId) => {
  return deleteItem(WallpostReaction, reactionId);
};
