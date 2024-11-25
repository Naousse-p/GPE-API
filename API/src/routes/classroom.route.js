const express = require("express");
const router = express.Router();
const { classroom_user, classroom_by_code, classroom_by_id, classroom_create, classroom_members, classroom_update, classroom_by_school } = require("../controllers/classroom");

const trimRequest = require("trim-request");
const { verifyAccessToken } = require("../middlewares/auth/auth.middleware");

// Routes pour les parents
router.get("/classroom/user", verifyAccessToken, trimRequest.all, classroom_user);
router.get("/classroom/:code", verifyAccessToken, trimRequest.all, classroom_by_code);
router.get("/classroom/id/:id", verifyAccessToken, trimRequest.all, classroom_by_id);
router.get("/classroom/members/:id", verifyAccessToken, trimRequest.all, classroom_members);
router.get("/classroom/school/:schoolId", verifyAccessToken, trimRequest.all, classroom_by_school);

router.post("/classroom", verifyAccessToken, trimRequest.all, classroom_create);

router.put("/classroom/:id", verifyAccessToken, trimRequest.all, classroom_update);

module.exports = router;
