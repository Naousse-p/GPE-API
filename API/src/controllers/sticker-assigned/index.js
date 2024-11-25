const { sticker_add_comment_image } = require("./sticker-add-comment-image.controller");
const { sticker_remove_from_student } = require("./sticker-remove-from-student.controller");
const { sticker_remove_comment_image } = require("./sticker-remove-comment-image.controller");
const { sticker_publish_acquired } = require("./sticker-publish-acquired.controller");
const { sticker_get_student_without } = require("./sticker-get-student-without.controller");
const { sticker_add_to_multiple_student } = require("./sticker-add-to-multiple-students.controller");
const { sticker_add_multiple_to_student } = require("./sticker-add-multiple-to-student.controller");
const { sticker_not_acquired_by_student } = require("./sticker-not-acquired-by-student.controller");
const { sticker_assigned_picture } = require("./sticker-assigned-picture.controller");
module.exports = {
  sticker_add_comment_image,
  sticker_remove_from_student,
  sticker_remove_comment_image,
  sticker_publish_acquired,
  sticker_get_student_without,
  sticker_add_to_multiple_student,
  sticker_add_multiple_to_student,
  sticker_not_acquired_by_student,
  sticker_assigned_picture,
};
