const { validate_result } = require("../../../utils/validate-result");
const { check } = require("express-validator");

const validate_signin = [check("email").isEmail().withMessage("Email is required"), check("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"), validate_result];

module.exports = { validate_signin };
