const { wallpost_create_post } = require("./wallpost-create-post.controller");
const { wallpost_get_posts } = require("./wallpost-get-posts-controller");
const { wallpost_update_post } = require("./wallpost-update-post.controller");
const { wallpost_remove_post } = require("./wallpost-remove-post.controller");
const { wallpost_get_file } = require("./wallpost-get-file.controller");
const { wallpost_create_comment } = require("./wallpost-create-comment.controller");
const { wallpost_create_reaction } = require("./wallpost-create-reaction.controller");
const { wallpost_mark_as_read_post } = require("./wallpost-mark-as-read-post.controller");
const { wallpost_remove_reaction } = require("./wallpost-remove-reaction.controller");
const { wallpost_update_comment } = require("./wallpost-update-comment.controller");
const { wallpost_delete_comment } = require("./wallpost-remove-comment.controller");

module.exports = {
  wallpost_create_post,
  wallpost_get_posts,
  wallpost_update_post,
  wallpost_remove_post,
  wallpost_get_file,
  wallpost_create_comment,
  wallpost_create_reaction,
  wallpost_mark_as_read_post,
  wallpost_remove_reaction,
  wallpost_update_comment,
  wallpost_delete_comment,
};
