const { wallpost_create_post_service } = require("./wallpost-create-post.service");
const { wallpost_get_posts_service } = require("./wallpost-get-posts.service");
const { wallpost_update_post_service } = require("./wallpost-update-post.service");
const { wallpost_remove_post_service } = require("./wallpost-remove-post.service");
const { wallpost_get_file_service } = require("./wallpost-get-file.service");
const { wallpost_create_comment_service } = require("./wallpost-create-comment.service");
const { wallpost_create_reaction_service } = require("./wallpost-create-reaction.service");
const { wallpost_mark_as_read_post_service } = require("./wallpost-mark-as-read-post.service");
const { wallpost_remove_reaction_service } = require("./wallpost-remove-reaction.service");
const { wallpost_update_comment_service } = require("./wallpost-update-comment.service");
const { wallpost_remove_comment_service } = require("./wallpost-remove-comment.service");
module.exports = {
  wallpost_create_post_service,
  wallpost_get_posts_service,
  wallpost_update_post_service,
  wallpost_remove_post_service,
  wallpost_get_file_service,
  wallpost_create_comment_service,
  wallpost_create_reaction_service,
  wallpost_mark_as_read_post_service,
  wallpost_remove_reaction_service,
  wallpost_update_comment_service,
  wallpost_remove_comment_service,
};
