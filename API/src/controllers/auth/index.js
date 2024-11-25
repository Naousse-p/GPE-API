const { signin } = require("./signin.controller");
const { signup_professor } = require("./signup-professor.controller");
const { signup_parent } = require("./signup-parent.controller");
const { refresh_token } = require("./refresh-token.controller");

module.exports = {
  signin,
  signup_professor,
  signup_parent,
  refresh_token,
};
