const { parent_by_class_service } = require("./parent-by-class.service");
const { parent_by_school_service } = require("./parent-by-school.service");
const { parent_by_student_service } = require("./parent-by-student.service");
const { parent_remove_from_class_service } = require("./parent-remove-from-class.service");
const { parent_update_service } = require("./parent-update.service");
const { parent_by_id_service } = require("./parent-by-id.service");
const { parent_join_classroom_service } = require("./parent-join-classroom.service");

module.exports = {
  parent_by_class_service,
  parent_by_school_service,
  parent_by_student_service,
  parent_remove_from_class_service,
  parent_update_service,
  parent_by_id_service,
  parent_join_classroom_service,
};
