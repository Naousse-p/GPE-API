const { classroom_user } = require("./classroom-user.controller");
const { classroom_by_code } = require("./classroom-by-code.controller");
const { classroom_by_id } = require("./classroom-by-id.controller");
const { classroom_members } = require("./classroom-members.controller");
const { classroom_create } = require("./classroom-create.controller");
const { classroom_update } = require("./classroom-update.controller");
const { classroom_by_school } = require("./classroom-by-school.controller");

module.exports = {
  classroom_user,
  classroom_by_code,
  classroom_by_id,
  classroom_members,
  classroom_create,
  classroom_update,
  classroom_by_school,
};
