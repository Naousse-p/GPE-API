const { parent_by_class } = require("./parent-by-class.controller");
const { parent_by_school } = require("./parent-by-school.controller");
const { parent_by_student } = require("./parent-by-student.controller");
const { parent_remove_from_class } = require("./parent-remove-from-class.controller");
const { parent_update } = require("./parent-update.controller");
const { parent_by_id } = require("./parent-by-id.controller");
const { parent_join_classroom } = require("./parent-join-classroom.controller");

module.exports = {
  parent_by_class,
  parent_by_school,
  parent_by_student,
  parent_remove_from_class,
  parent_update,
  parent_by_id,
  parent_join_classroom,
};
