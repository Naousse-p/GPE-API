const { validate_result } = require("../../../utils/validate-result");
const { check } = require("express-validator");

const validate_create_student = [
  // Validation des données du sticker
  check("lastname").not().isEmpty().withMessage("Student lastname is required"),
  check("firstname").not().isEmpty().withMessage("Student firstname is required"),
  check("birthdate").not().isEmpty().withMessage("Student birthdate is required"),
  check("sexe").isIn(["boy", "girl"]).withMessage("Invalid sexe value"),
  check("level").isIn(["ps", "ms", "gs", "PS", "MS", "GS"]).withMessage("Invalid level value"),
  check("classId").not().isEmpty().withMessage("Class ID is required and must be an ObjectId"),
  validate_result,
];

module.exports = { validate_create_student };
