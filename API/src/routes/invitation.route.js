const express = require("express");
const router = express.Router();
const trimRequest = require("trim-request");
const { verifyAccessToken } = require("../middlewares/auth/auth.middleware");
const { verifyUserIsProfessor, verifyUserIsParents } = require("../middlewares/auth/role.middleware");

const { invitation_generate } = require("../controllers/invitation");

router.get("/invitation/generate", trimRequest.all, invitation_generate);

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const trimRequest = require("trim-request");
// const { verifyAccessToken } = require("../middlewares/auth/auth.middleware");
// const { verifyUserIsProfessor, verifyUserIsParents } = require("../middlewares/auth/role.middleware");

// const { invitation_generate } = require("../controllers/invitation");

// router.get("/invitation/generate", [verifyAccessToken, verifyUserIsProfessor], trimRequest.all, invitation_generate);

// module.exports = router;
