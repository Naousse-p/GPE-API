const express = require("express");
const router = express.Router();
const trimRequest = require("trim-request");
const { verifyAccessToken } = require("../middlewares/auth/auth.middleware");

const { appreciation_create, appreciation_for_student, appreciation_publish, appreciation_remove, appreciation_update } = require("../controllers/appreciation");

router.post("/appreciation/:id", verifyAccessToken, trimRequest.all, appreciation_create);
router.get("/appreciation/:id", verifyAccessToken, trimRequest.all, appreciation_for_student);
router.put("/appreciation/:appreciationId/student/:studentId", verifyAccessToken, trimRequest.all, appreciation_update);
router.put("/appreciation/publish/:studentId", verifyAccessToken, trimRequest.all, appreciation_publish);
router.delete("/appreciation/:id", verifyAccessToken, trimRequest.all, appreciation_remove);

module.exports = router;
