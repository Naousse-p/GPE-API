const { validate_result } = require("../../../utils/validate-result");
const { check } = require("express-validator");

const validate_create_sticker = [
  // Validation des données du sticker
  check("name").not().isEmpty().withMessage("Sticker name is required"),
  check("category").not().isEmpty().withMessage("Sticker category is required"),
  check("classId").not().isEmpty().withMessage("Sticker class is required and must be an ObjectId"),
  validate_result,
];

module.exports = { validate_create_sticker };
