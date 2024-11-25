const express = require("express");
const router = express.Router();
const trimRequest = require("trim-request");
const { upload } = require("../utils/multer");
const { verifyAccessToken } = require("../middlewares/auth/auth.middleware");
const {
  sticker_add_comment_image,
  sticker_remove_from_student,
  sticker_remove_comment_image,
  sticker_publish_acquired,
  sticker_get_student_without,
  sticker_add_to_multiple_student,
  sticker_add_multiple_to_student,
  sticker_not_acquired_by_student,
  sticker_assigned_picture,
} = require("../controllers/sticker-assigned");

// Routes pour les stickers
router.get("/sticker-assign/:stickerId/class/:classId/student/without", verifyAccessToken, trimRequest.all, sticker_get_student_without);
router.get("/sticker-assign/student/:studentId/not-acquired", verifyAccessToken, trimRequest.all, sticker_not_acquired_by_student);
router.get("/sticker-assign/:AssignedStickerId/picture", verifyAccessToken, trimRequest.all, sticker_assigned_picture);

router.post("/sticker-assign/multiple-to-student", verifyAccessToken, trimRequest.all, sticker_add_multiple_to_student);
router.post("/sticker-assign/multiple", verifyAccessToken, trimRequest.all, sticker_add_to_multiple_student);

router.put("/sticker-assign/:AssignedStickerId/comment", verifyAccessToken, trimRequest.all, upload.single("source"), sticker_add_comment_image);
router.put("/sticker-assign/:classId/publish/acquired", verifyAccessToken, trimRequest.all, sticker_publish_acquired);

router.delete("/sticker-assign/:studentId", verifyAccessToken, trimRequest.all, sticker_remove_from_student);
router.delete("/sticker-assign/:AssignedStickerId/comment", verifyAccessToken, trimRequest.all, sticker_remove_comment_image);

module.exports = router;
