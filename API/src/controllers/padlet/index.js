const { padlet_create_section } = require("./padlet-create-section.controller");
const { padlet_create_board } = require("./padlet-create-board.controller");
const { padlet_create_post } = require("./padlet-create-post.controller");
const { padlet_board_by_class } = require("./padlet-board-by-class.controller");
const { padlet_board_by_id } = require("./padlet-board-by-id.controller");
const { padlet_board_remove } = require("./padlet-remove-board.controller");
const { padlet_section_remove } = require("./padlet-remove-section.controller");
const { padlet_post_remove } = require("./padlet-remove-post.controller");
const { padlet_update_board } = require("./padlet-update-board.controller");
const { padlet_update_post } = require("./padlet-update-post.controller");
const { padlet_update_section } = require("./padlet-update-section.controller");
const { padlet_file } = require("./padlet-file.controller");

module.exports = {
  padlet_create_section,
  padlet_create_board,
  padlet_create_post,
  padlet_board_by_class,
  padlet_board_by_id,
  padlet_board_remove,
  padlet_section_remove,
  padlet_post_remove,
  padlet_update_board,
  padlet_update_post,
  padlet_update_section,
  padlet_file,
};
