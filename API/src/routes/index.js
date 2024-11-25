const express = require("express");
const router = express.Router();

// Importez vos routes individuelles
const authRoutes = require("./auth.route");
const classroomRoutes = require("./classroom.route");
const conversationRoutes = require("./conversation.route");
const parentRoutes = require("./parent.route");
const professorRoutes = require("./professor.route");
const schoolRoutes = require("./school.route");
const stickerAssignedRoutes = require("./sticker-assigned.route");
const stickerBookRoutes = require("./sticker-book.route");
const stickerRoutes = require("./sticker.route");
const studentRoutes = require("./student.route");
const userRoutes = require("./user.route");
const padletRoutes = require("./padlet.route");
const messageRoutes = require("./message.route");
const appreciationRoutes = require("./appreciation.route");
const wallpostRoutes = require("./wallpost.route");
const eventRoutes = require("./event.route");
const invitationRoutes = require("./invitation.route");
const treasuryRoutes = require("./treasury.route");
// Utilisez les routes individuelles
router.use(authRoutes);
router.use(classroomRoutes);
router.use(conversationRoutes);
router.use(parentRoutes);
router.use(professorRoutes);
router.use(schoolRoutes);
router.use(stickerAssignedRoutes);
router.use(stickerBookRoutes);
router.use(stickerRoutes);
router.use(studentRoutes);
router.use(userRoutes);
router.use(padletRoutes);
router.use(messageRoutes);
router.use(appreciationRoutes);
router.use(wallpostRoutes);
router.use(eventRoutes);
router.use(invitationRoutes);
router.use(treasuryRoutes);

module.exports = router;
