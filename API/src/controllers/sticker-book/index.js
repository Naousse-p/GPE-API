const { sticker_book_generate } = require("./sticker-book-generate.controller");
const { sticker_book_acquired_by_student_history } = require("./sticker-book-acquired-by-student-history.controller");
const { sticker_book_acquired_by_student } = require("./sticker-book-acquired-by-student.controller");
const { sticker_book_stat_acquired_by_category } = require("./sticker-book-stat-acquired-by-category.controller");
const { sticker_book_stat_count_acquired_by_category } = require("./sticker-book-stat-count-acquired-by-category.controller");

module.exports = {
  sticker_book_generate,
  sticker_book_acquired_by_student_history,
  sticker_book_acquired_by_student,
  sticker_book_stat_acquired_by_category,
  sticker_book_stat_count_acquired_by_category,
};
