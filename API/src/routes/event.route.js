const express = require("express");
const router = express.Router();
const trimRequest = require("trim-request");
const { verifyAccessToken } = require("../middlewares/auth/auth.middleware");
const { verifyUserIsProfessor, verifyUserIsParents } = require("../middlewares/auth/role.middleware");

const { event_update, event_remove, event_create_personnal, event_create_appointment, event_create_informational, event_select_slot, event_get_all_type, event_get_available_contact } = require("../controllers/event");

router.post("/event/personnal/classroom/:classId", [verifyAccessToken, verifyUserIsProfessor], trimRequest.all, event_create_personnal);
router.post("/event/appointment/classroom/:classId", [verifyAccessToken], trimRequest.all, event_create_appointment);
router.post("/event/informational/classroom/:classId", [verifyAccessToken, verifyUserIsProfessor], trimRequest.all, event_create_informational);
router.put("/event/select-slot/:eventId/slot/:slotId", [verifyAccessToken], trimRequest.all, event_select_slot);
router.get("/event/classroom/:classId", [verifyAccessToken], trimRequest.all, event_get_all_type);

router.get("/event/available-contact/classroom/:classId", [verifyAccessToken], trimRequest.all, event_get_available_contact);
router.put("/event/:eventId", [verifyAccessToken], trimRequest.all, event_update);
router.delete("/event/:eventId", [verifyAccessToken], trimRequest.all, event_remove);

module.exports = router;
