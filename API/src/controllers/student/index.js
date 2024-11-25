const { student_create } = require("./student-create.controller");
const { student_by_id } = require("./student-by-id.controller");
const { student_picture } = require("./student-picture.controller");
const { student_by_class } = require("./student-by-class.controller");
const { student_remove_by_id } = require("./student-remove-by-id.controller");
const { student_update } = require("./student-update.controller");
const { student_by_code } = require("./student-by-code.controller");

module.exports = {
  student_create,
  student_by_id,
  student_picture,
  student_by_class,
  student_remove_by_id,
  student_update,
  student_by_code,
};
