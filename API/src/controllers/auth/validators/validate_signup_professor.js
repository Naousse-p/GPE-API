const { validate_result } = require("../../../utils/validate-result");
const { check } = require("express-validator");

const validate_signup_professor = [
  // Validation des données de l'utilisateur
  check("user.email").isEmail().withMessage("Email is required"),
  check("user.password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),

  // Validation des données de l'école
  check("school.schoolCode").not().isEmpty().withMessage("School code is required"),

  // Validation des données du professeur
  check("professor.lastname").not().isEmpty().withMessage("Last name is required"),
  check("professor.firstname").not().isEmpty().withMessage("First name is required"),
  check("professor.phoneNumber").not().isEmpty().withMessage("Phone number is required").isLength({ min: 10, max: 10 }).withMessage("Phone number must be 10 characters long"),

  // Validation des données de la salle de classe
  check("classroom.code").not().isEmpty().withMessage("Classroom code is required"),

  validate_result,
];

module.exports = { validate_signup_professor };
