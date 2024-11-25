const { sticker_book_generate_service } = require("./sticker-book-generate.service");
const { sticker_book_acquired_by_student_history_service } = require("./sticker-book-acquired-by-student-history.service");
const { sticker_book_acquired_by_student_service } = require("./sticker-book-acquired-by-student.service");
const { sticker_book_stat_acquired_by_category_service } = require("./sticker-book-stat-acquired-by-category.service");
const { sticker_book_stat_count_acquired_by_category_service } = require("./sticker-book-stat-count-acquired-by-category.service");

module.exports = {
  sticker_book_generate_service,
  sticker_book_acquired_by_student_history_service,
  sticker_book_acquired_by_student_service,
  sticker_book_stat_acquired_by_category_service,
  sticker_book_stat_count_acquired_by_category_service,
};
