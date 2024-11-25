const express = require("express");
const router = express.Router();
const {
  padlet_create_section,
  padlet_create_board,
  padlet_create_post,
  padlet_board_by_class,
  padlet_board_by_id,
  padlet_board_remove,
  padlet_post_remove,
  padlet_section_remove,
  padlet_update_board,
  padlet_update_post,
  padlet_update_section,
  padlet_file,
} = require("../controllers/padlet");

const trimRequest = require("trim-request");
const { verifyAccessToken } = require("../middlewares/auth/auth.middleware");
const verifyPadletFileAccess = require("../middlewares/auth/verifyPadletFileAccess");
const { verifyUserIsProfessor } = require("../middlewares/auth/role.middleware");
const { upload } = require("../utils/multer");

router.post("/padlet/post/:sectionId", [verifyAccessToken, verifyUserIsProfessor], trimRequest.all, upload.single("source"), padlet_create_post);
router.post("/padlet/board/:classId", verifyAccessToken, verifyUserIsProfessor, trimRequest.all, padlet_create_board);
router.post("/padlet/section/:boardId", verifyAccessToken, verifyUserIsProfessor, trimRequest.all, padlet_create_section);

router.get("/padlet/board/classroom/:classId", verifyAccessToken, padlet_board_by_class);
router.get("/padlet/board/:boardId", verifyAccessToken, padlet_board_by_id);
router.get("/padlet/file/:id", verifyAccessToken, padlet_file);

router.delete("/padlet/board/:boardId", verifyAccessToken, verifyUserIsProfessor, padlet_board_remove);
router.delete("/padlet/section/:sectionId", verifyAccessToken, verifyUserIsProfessor, padlet_section_remove);
router.delete("/padlet/post/:postId", verifyAccessToken, padlet_post_remove);

router.put("/padlet/board/:boardId", verifyAccessToken, verifyUserIsProfessor, trimRequest.all, padlet_update_board);
router.put("/padlet/section/:sectionId", verifyAccessToken, verifyUserIsProfessor, trimRequest.all, padlet_update_section);
router.put("/padlet/post/:postId", verifyAccessToken, trimRequest.all, upload.single("source"), padlet_update_post);

// Route pour servir les fichiers avec vérification des permissions
router.get("/padlet/uploads/:id.:extension", verifyPadletFileAccess, (req, res) => {
  res.sendFile(req.filePath);
});

module.exports = router;
