const express = require("express");
const router = express.Router();
const trimRequest = require("trim-request");
const { verifyAccessToken } = require("../middlewares/auth/auth.middleware");

const { message_by_conversation, message_create, message_file, message_mark_as_read, message_remove, message_update } = require("../controllers/message");
const { upload } = require("../utils/multer");

router.post("/conversation/:conversationId/message", verifyAccessToken, trimRequest.all, upload.single("source"), message_create);
router.get("/conversation/:conversationId/message", verifyAccessToken, trimRequest.all, message_by_conversation);
router.get("/conversation/:conversationId/message/:messageId/file", verifyAccessToken, trimRequest.all, message_file);
router.put("/conversation/:conversationId/message-read", verifyAccessToken, trimRequest.all, message_mark_as_read);
router.put("/conversation/:conversationId/message/:messageId", verifyAccessToken, trimRequest.all, message_update);
router.delete("/conversation/:conversationId/message/:messageId", verifyAccessToken, trimRequest.all, message_remove);

module.exports = router;
