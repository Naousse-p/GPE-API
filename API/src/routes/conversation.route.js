const express = require("express");
const router = express.Router();
const trimRequest = require("trim-request");
const { verifyAccessToken } = require("../middlewares/auth/auth.middleware");

const {
  conversation_create,
  conversation_by_id,
  conversation_add_participant,
  conversation_get_user_than_can_be_add,
  conversation_get_other_participant,
  conversation_get_for_class,
  conversation_get_participant_possible,
  conversation_update_controller,
  conversation_remove_participant,
  conversation_remove,
} = require("../controllers/conversation");

router.post("/conversation/:id", verifyAccessToken, trimRequest.all, conversation_create);
router.get("/conversation/:id", verifyAccessToken, trimRequest.all, conversation_by_id);
router.get("/conversation/:id/other-participant", verifyAccessToken, trimRequest.all, conversation_get_other_participant);
router.get("/conversation/:id/user-than-can-be-add", verifyAccessToken, trimRequest.all, conversation_get_user_than_can_be_add);
router.get("/conversation/:classId/participant-possible", verifyAccessToken, trimRequest.all, conversation_get_participant_possible);
router.get("/conversation/:classId/for-class", verifyAccessToken, trimRequest.all, conversation_get_for_class);
router.put("/conversation/:id/add-participant", verifyAccessToken, trimRequest.all, conversation_add_participant);
router.put("/conversation/:id", verifyAccessToken, trimRequest.all, conversation_update_controller);
router.delete("/conversation/:id/remove-participant", verifyAccessToken, trimRequest.all, conversation_remove_participant);
router.delete("/conversation/:id", verifyAccessToken, trimRequest.all, conversation_remove);
module.exports = router;
