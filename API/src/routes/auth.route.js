const express = require("express");
const router = express.Router();
const trimRequest = require("trim-request");
const { verifyRefreshToken } = require("../middlewares/auth/auth.middleware");
const { signup_professor, signup_parent, signin, refresh_token } = require("../controllers/auth/");
const { validate_signup_professor, validate_signin, validate_signup_parent } = require("../controllers/auth/validators");
// Routes pour les utilisateurs

router.post("/auth/signin", validate_signin, trimRequest.all, signin);

router.post("/auth/signup-professor", validate_signup_professor, trimRequest.all, signup_professor);
router.post("/auth/signup-parent", validate_signup_parent, trimRequest.all, signup_parent);
router.post("/auth/refresh-token", verifyRefreshToken, refresh_token);

module.exports = router;
