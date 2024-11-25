const { validate_result } = require("../../../utils/validate-result");
const { check } = require("express-validator");

const validate_signup_parent = [
  check("user.email").isEmail().withMessage("Email is required"),
  check("user.password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  check("user.role")
    .isString()
    .withMessage("Role must be a string")
    .custom((role) => {
      if (role !== "parents") {
        throw new Error("Role must be 'parents'");
      }
      return true;
    }),

  check("parent.lastname").not().isEmpty().withMessage("Last name is required"),
  check("parent.firstname").not().isEmpty().withMessage("First name is required"),
  check("parent.phoneNumber")
    .not()
    .isEmpty()
    .withMessage("Phone number is required")
    .custom((value) => {
      // Remove spaces from the phone number
      const phoneNumberWithoutSpaces = value.replace(/\s+/g, "");
      if (phoneNumberWithoutSpaces.length !== 10) {
        throw new Error("Phone number must be 10 characters long");
      }
      return true;
    }),
  check("parent.children.child").not().isEmpty().withMessage("Child ID is required"),
  check("parent.children.class").not().isEmpty().withMessage("Class ID is required"),
  check("parent.children.relationship").not().isEmpty().withMessage("Relationship is required").isIn(["father", "mother", "guardian"]).withMessage("Relationship must be either 'father', 'mother' or 'guardian'"),

  validate_result,
];

module.exports = { validate_signup_parent };
