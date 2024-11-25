const { validate_result } = require("../../../utils/validate-result");
const { check } = require("express-validator");

const validate_create_padlet_post = [
  // Validation des données du post

  check("sectionId").not().isEmpty().withMessage("Post section is required and must be an ObjectId"),
  check("creator").not().isEmpty().withMessage("Post creator is required"),
  validate_result,
];

module.exports = { validate_create_padlet_post };
