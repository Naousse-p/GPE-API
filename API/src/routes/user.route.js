const express = require("express");
const router = express.Router();
const trimRequest = require("trim-request");
const { user_validate_account, user_resend_email_for_validate_account, user_request_password_reset, user_password_reset, user_update, user_info } = require("../controllers/user/");
const { verifyAccessToken } = require("../middlewares/auth/auth.middleware");

router.post("/auth/validate-account", trimRequest.all, user_validate_account);
router.post("/auth/resend-email-for-validate-account", trimRequest.all, user_resend_email_for_validate_account);
router.post("/auth/request-password-reset", trimRequest.all, user_request_password_reset);
router.post("/auth/password-reset", trimRequest.all, user_password_reset);
router.put("/auth/user/update", verifyAccessToken, trimRequest.all, user_update);
router.get("/auth/user/info", verifyAccessToken, trimRequest.all, user_info);

module.exports = router;
