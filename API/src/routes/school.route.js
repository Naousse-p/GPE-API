const express = require("express");
const router = express.Router();
const { school_update_professors_roles, school_by_code } = require("../controllers/school");

const trimRequest = require("trim-request");
const { verifyAccessToken } = require("../middlewares/auth/auth.middleware");
const { verifyUserIsProfessor } = require("../middlewares/auth/role.middleware");

router.put("/school/professors-roles", verifyAccessToken, verifyUserIsProfessor, trimRequest.all, school_update_professors_roles);
router.get("/school/:code", trimRequest.all, school_by_code);

module.exports = router;
