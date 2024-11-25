const { sticker_add_comment_image_service } = require("./sticker-add-comment-image.service");
const { sticker_remove_from_student_service } = require("./sticker-remove-from-student.service");
const { sticker_remove_comment_image_service } = require("./sticker-remove-comment-image.service");
const { sticker_publish_acquired_service } = require("./sticker-publish-acquired.service");
const { sticker_not_acquired_by_student_service } = require("./sticker-not-acquired-by-student.service");
const { sticker_get_student_without_service } = require("./sticker-get-student-without.service");
const { sticker_add_to_multiple_student_service } = require("./sticker-add-to-multiple-students.service");
const { sticker_add_multiple_to_student_service } = require("./sticker-add-multiple-to-student.service");
const { sticker_assigned_picture_service } = require("./sticker-assigned-picture.service");

module.exports = {
  sticker_add_comment_image_service,
  sticker_remove_from_student_service,
  sticker_remove_comment_image_service,
  sticker_publish_acquired_service,
  sticker_not_acquired_by_student_service,
  sticker_get_student_without_service,
  sticker_add_to_multiple_student_service,
  sticker_add_multiple_to_student_service,
  sticker_assigned_picture_service,
};
