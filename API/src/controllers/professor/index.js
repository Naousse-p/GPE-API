const { professor_by_class } = require("./professor-by-class.controller");
const { professor_by_id } = require("./professor-by-id.controller");
const { professor_by_school } = require("./professor-by-school.controller");
const { professor_remove_from_class } = require("./professor-remove-from-class.controller");
const { professor_update } = require("./professor-update.controller");

module.exports = {
  professor_by_class,
  professor_by_id,
  professor_by_school,
  professor_remove_from_class,
  professor_update,
};
