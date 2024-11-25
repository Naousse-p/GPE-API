const { professor_by_class_service } = require("./professor-by-class.service");
const { professor_by_id_service } = require("./professor-by-id.service");
const { professor_by_school_service } = require("./professor-by-school.service");
const { professor_remove_from_class_service } = require("./professor-remove-from-class.service");
const { professor_update_service } = require("./professor-update.service");

module.exports = {
  professor_by_class_service,
  professor_by_id_service,
  professor_by_school_service,
  professor_remove_from_class_service,
  professor_update_service,
};
