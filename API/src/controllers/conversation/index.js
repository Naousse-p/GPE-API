const { conversation_create } = require("./conversation-create.controller");
const { conversation_by_id } = require("./conversation-by-id.controller");
const { conversation_add_participant } = require("./conversation-add-participant.controller");
const { conversation_get_other_participant } = require("./conversation-get-other-participant.controller");
const { conversation_get_user_than_can_be_add } = require("./conversation-get-user-than-can-be-add.controller");
const { conversation_get_for_class } = require("./conversation-get-for-class.controller");
const { conversation_get_participant_possible } = require("./conversation-get-participant-possible.controller");
const { conversation_update_controller } = require("./conversation-update.controller");
const { conversation_remove_participant } = require("./conversation-remove-participant.controller");
const { conversation_remove } = require("./conversation-remove.controller");

module.exports = {
  conversation_create,
  conversation_by_id,
  conversation_add_participant,
  conversation_get_other_participant,
  conversation_get_user_than_can_be_add,
  conversation_get_for_class,
  conversation_get_participant_possible,
  conversation_update_controller,
  conversation_remove_participant,
  conversation_remove,
};
