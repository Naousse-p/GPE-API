const express = require("express");
const router = express.Router();
const {
  sticker_book_generate,
  sticker_book_acquired_by_student,
  sticker_book_acquired_by_student_history,
  sticker_book_stat_acquired_by_category,
  sticker_book_stat_count_acquired_by_category,
} = require("../controllers/sticker-book");
const { verifyAccessToken } = require("../middlewares/auth/auth.middleware");
const trimRequest = require("trim-request");

router.get("/sticker-book/generate/:id", verifyAccessToken, trimRequest.all, sticker_book_generate);
router.get("/sticker-book/acquired-by-student/:id", verifyAccessToken, trimRequest.all, sticker_book_acquired_by_student);
router.get("/sticker-book/acquired-by-student-history/:id", verifyAccessToken, trimRequest.all, sticker_book_acquired_by_student_history);
router.get("/sticker-book/stat-acquired-by-category/:id", verifyAccessToken, trimRequest.all, sticker_book_stat_acquired_by_category);
router.get("/sticker-book/stat-count-acquired-by-category/:id", verifyAccessToken, trimRequest.all, sticker_book_stat_count_acquired_by_category);

module.exports = router;
