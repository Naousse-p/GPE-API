const { student_create_service } = require("./student-create.service");
const { student_by_id_service } = require("./student-by-id.service");
const { student_picture_service } = require("./student-picture.service");
const { student_by_class_service } = require("./student-by-class.service");
const { student_remove_by_id_service } = require("./student-remove-by-id.service");
const { student_update_service } = require("./student-update.service");
const { student_by_code_service } = require("./student-by-code.service");

module.exports = {
  student_create_service,
  student_by_id_service,
  student_picture_service,
  student_by_class_service,
  student_remove_by_id_service,
  student_update_service,
  student_by_code_service,
};
