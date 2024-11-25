const { user_validate_account } = require("./user-validate-account.controller");
const { user_resend_email_for_validate_account } = require("./user-resend-email-for-validate-account.controller");
const { user_request_password_reset } = require("./user-request-password-reset.controller");
const { user_password_reset } = require("./user-password-reset.controller");
const { user_update } = require("./user-update.controller");
const { user_info } = require("./user-info.controller");

module.exports = {
  user_validate_account,
  user_resend_email_for_validate_account,
  user_request_password_reset,
  user_password_reset,
  user_update,
  user_info,
};
