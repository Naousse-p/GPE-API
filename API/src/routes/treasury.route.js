const express = require("express");
const router = express.Router();
const {
  treasury_create_classroom_purchase,
  treasury_create_school_collection,
  treasury_create_classroom_collection,
  treasury_create_school_purchase,
  treasury_get_classroom,
  treasury_get_school,
  treasury_update_school_budget_and_transfer_funds,
  treasury_picture,
  treasury_update_transaction,
} = require("../controllers/treasury");

const trimRequest = require("trim-request");
const { verifyAccessToken } = require("../middlewares/auth/auth.middleware");
const { verifyUserIsProfessor } = require("../middlewares/auth/role.middleware");
const { upload } = require("../utils/multer");

router.post("/treasury/classroom/:classId/purchase", verifyAccessToken, verifyUserIsProfessor, trimRequest.all, upload.single("file"), treasury_create_classroom_purchase);
router.post("/treasury/school/:schoolId/collection", verifyAccessToken, verifyUserIsProfessor, trimRequest.all, treasury_create_school_collection);
router.post("/treasury/classroom/:classId/collection", verifyAccessToken, verifyUserIsProfessor, trimRequest.all, treasury_create_classroom_collection);
router.post("/treasury/school/:schoolId/purchase", verifyAccessToken, verifyUserIsProfessor, trimRequest.all, upload.single("file"), treasury_create_school_purchase);
router.put("/treasury/school/:schoolId/budget", verifyAccessToken, verifyUserIsProfessor, trimRequest.all, treasury_update_school_budget_and_transfer_funds);
router.put("/treasury/transaction/:transactionId", verifyAccessToken, verifyUserIsProfessor, trimRequest.all, upload.single("invoice"), treasury_update_transaction);
router.get("/treasury/classroom/:classId", verifyAccessToken, verifyUserIsProfessor, trimRequest.all, treasury_get_classroom);
router.get("/treasury/school/:schoolId", verifyAccessToken, verifyUserIsProfessor, trimRequest.all, treasury_get_school);
router.get("/treasury/picture/:transactionId", treasury_picture);

module.exports = router;
