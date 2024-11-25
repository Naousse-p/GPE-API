const { validate_signup_professor } = require("./validate_signup_professor");
const { validate_signup_parent } = require("./validate_signup_parent");
const { validate_signin } = require("./validate_signin");
module.exports = { validate_signup_professor, validate_signup_parent, validate_signin };
