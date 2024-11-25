const express = require("express");
const router = express.Router();
const { parent_by_class, parent_by_student, parent_remove_from_class, parent_update, parent_by_id, parent_join_classroom, parent_by_school } = require("../controllers/parent");

const trimRequest = require("trim-request");
const { verifyAccessToken } = require("../middlewares/auth/auth.middleware");
const { verifyUserIsParents } = require("../middlewares/auth/role.middleware");

router.get("/parent/class/:classId", verifyAccessToken, trimRequest.all, parent_by_class);
router.get("/parent/student/:studentId", verifyAccessToken, trimRequest.all, parent_by_student);
// router.get("/parent/:userId", verifyAccessToken, trimRequest.all, parent_by_user);
router.get("/parent", verifyAccessToken, trimRequest.all, parent_by_id);


router.get("/parent/school/:schoolId", verifyAccessToken, trimRequest.all, parent_by_school);
router.put("/parent/update/:parentId", verifyAccessToken, trimRequest.all, parent_update);
router.put("/parent/join-classroom", verifyAccessToken, verifyUserIsParents, trimRequest.all, parent_join_classroom);
router.delete("/parent/:parentId/class/:classId", verifyAccessToken, trimRequest.all, parent_remove_from_class);

module.exports = router;
