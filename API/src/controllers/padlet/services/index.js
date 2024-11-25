const { padlet_create_post_service } = require("./padlet-create-post.service");
const { padlet_create_section_service } = require("./padlet-create-section.service");
const { padlet_create_board_service } = require("./padlet-create-board.service");
const { padlet_board_by_class_service } = require("./padelt-board-by-class.service");
const { padlet_board_by_id_service } = require("./padelt-board-by-id.service");
const { padlet_board_remove_service } = require("./padlet-remove-board.service");
const { padlet_post_remove_service } = require("./padlet-remove-post.service");
const { padlet_section_remove_service } = require("./padlet-remove-section.service");
const { padlet_update_board_service } = require("./padlet-update-board.service");
const { padlet_update_post_service } = require("./padlet-update-post.service");
const { padlet_update_section_service } = require("./padlet-update-section.service");
const { padlet_file_service } = require("./padlet-file.service");

module.exports = {
  padlet_create_post_service,
  padlet_create_section_service,
  padlet_create_board_service,
  padlet_board_by_class_service,
  padlet_board_by_id_service,
  padlet_board_remove_service,
  padlet_post_remove_service,
  padlet_section_remove_service,
  padlet_update_board_service,
  padlet_update_post_service,
  padlet_update_section_service,
  padlet_file_service,
};
