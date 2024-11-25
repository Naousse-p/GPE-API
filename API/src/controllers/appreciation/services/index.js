const { appreciation_create_service } = require("./appreciation-create.service");
const { appreciation_for_student_service } = require("./appreciation-for-student.service");
const { appreciation_publish_service } = require("./appreciation-publish.service");
const { appreciation_remove_service } = require("./appreciation-remove.service");
const { appreciation_update_service } = require("./appreciation-update.service");

module.exports = {
  appreciation_create_service,
  appreciation_for_student_service,
  appreciation_publish_service,
  appreciation_remove_service,
  appreciation_update_service,
};
