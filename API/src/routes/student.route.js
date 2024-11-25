const express = require("express");
const router = express.Router();
const { student_create, student_by_id, student_picture, student_by_class, student_remove_by_id, student_update, student_by_code } = require("../controllers/student");
const trimRequest = require("trim-request");
const { verifyAccessToken } = require("../middlewares/auth/auth.middleware");
const { validate_create_student, validate_student_file } = require("../controllers/student/validators");
const { upload } = require("../utils/multer");

// Routes pour les élèves
router.get("/student/:id/picture", verifyAccessToken, trimRequest.all, student_picture);
router.get("/student/:id", verifyAccessToken, trimRequest.all, student_by_id);
router.get("/student/class/:id", verifyAccessToken, trimRequest.all, student_by_class);
router.get("/student/code/:code", trimRequest.all, student_by_code);

router.post("/student", verifyAccessToken, trimRequest.all, upload.single("source"), [validate_create_student], student_create);
router.delete("/student/:id", verifyAccessToken, trimRequest.all, student_remove_by_id);
router.put("/student/:id", verifyAccessToken, trimRequest.all, upload.single("source"), student_update);

module.exports = router;
