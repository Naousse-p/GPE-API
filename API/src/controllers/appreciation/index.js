const { appreciation_create } = require("./appreciation-create.controller");
const { appreciation_for_student } = require("./appreciation-for-student.controller");
const { appreciation_publish } = require("./appreciation-publish.controller");
const { appreciation_remove } = require("./appreciation-remove.controller");
const { appreciation_update } = require("./appreciation-update.controller");

module.exports = {
  appreciation_create,
  appreciation_for_student,
  appreciation_publish,
  appreciation_remove,
  appreciation_update,
};
