const express = require("express");
const router = express.Router();
const { professor_by_class, professor_by_id, professor_by_school, professor_remove_from_class, professor_update } = require("../controllers/professor");

const trimRequest = require("trim-request");
const { verifyAccessToken } = require("../middlewares/auth/auth.middleware");

// Routes pour les parents
router.get("/professor/class/:classId", verifyAccessToken, trimRequest.all, professor_by_class);
router.get("/professor/school/:schoolId", verifyAccessToken, trimRequest.all, professor_by_school);
router.get("/professor", verifyAccessToken, trimRequest.all, professor_by_id);

router.put("/professor", verifyAccessToken, trimRequest.all, professor_update);
router.delete("/professor/:professorId/class/:classId", verifyAccessToken, trimRequest.all, professor_remove_from_class);

module.exports = router;
