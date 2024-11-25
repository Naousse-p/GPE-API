const express = require("express");
const router = express.Router();
const { sticker_create, sticker_by_id, sticker_picture, sticker_update, sticker_by_class, sticker_remove_by_id } = require("../controllers/sticker");
const trimRequest = require("trim-request");
const { upload } = require("../utils/multer");
const { verifyAccessToken } = require("../middlewares/auth/auth.middleware");
const { validate_create_sticker, validate_sticker_file } = require("../controllers/sticker/validators");
// Routes pour les stickers
router.get("/sticker/:id", verifyAccessToken, trimRequest.all, sticker_by_id);
router.get("/sticker/:id/picture", verifyAccessToken, trimRequest.all, sticker_picture);
router.get("/sticker/class/:id", verifyAccessToken, trimRequest.all, sticker_by_class);

router.post("/sticker", verifyAccessToken, trimRequest.all, upload.single("source"), [validate_create_sticker, validate_sticker_file], sticker_create);

router.put("/sticker/:id/", verifyAccessToken, trimRequest.all, upload.single("source"), sticker_update);

router.delete("/sticker/:id", verifyAccessToken, trimRequest.all, sticker_remove_by_id);

module.exports = router;
