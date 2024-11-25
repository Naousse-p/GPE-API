const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/wallpost");

const trimRequest = require("trim-request");
const { verifyAccessToken } = require("../middlewares/auth/auth.middleware");
const verifyFileAccess = require("../middlewares/auth/verifyFileAccess");
const { verifyUserIsProfessor, verifyUserIsParents } = require("../middlewares/auth/role.middleware");
const { upload } = require("../utils/multer");

router.post("/wallpost/:classId", [verifyAccessToken, verifyUserIsProfessor], trimRequest.all, upload.array("source", 10), wallpost_create_post);
router.get("/wallpost/:classId", verifyAccessToken, trimRequest.all, wallpost_get_posts);
router.get("/wallpost/:postId/file/:filename", verifyAccessToken, trimRequest.all, wallpost_get_file);
router.put("/wallpost/:postId", [verifyAccessToken, verifyUserIsProfessor], trimRequest.all, upload.array("source", 10), wallpost_update_post);
router.put("/wallpost/:postId/read", verifyAccessToken, trimRequest.all, wallpost_mark_as_read_post);
router.delete("/wallpost/:postId", [verifyAccessToken, verifyUserIsProfessor], trimRequest.all, wallpost_remove_post);

router.post("/wallpost/:postId/comment", verifyAccessToken, trimRequest.all, wallpost_create_comment);
router.put("/wallpost/:commentId/comment", verifyAccessToken, trimRequest.all, wallpost_update_comment);
router.delete("/wallpost/:commentId/comment", verifyAccessToken, trimRequest.all, wallpost_delete_comment);

router.post("/wallpost/:postId/reaction", [verifyAccessToken, verifyUserIsParents], trimRequest.all, wallpost_create_reaction);
router.delete("/wallpost/:reactionId/reaction", [verifyAccessToken, verifyUserIsParents], trimRequest.all, wallpost_remove_reaction);

// Route pour servir les fichiers avec vérification des permissions
router.get("/uploads/wallpost-posts/:filename", verifyFileAccess, (req, res) => {
  const allowedOrigins = ["http://localhost:3000", "http://192.168.1.167:3000"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("X-Frame-Options", `ALLOW-FROM ${origin}`);
  }
  res.sendFile(req.filePath);
});

module.exports = router;
