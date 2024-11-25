// services/emailService.js

const nodemailer = require("nodemailer");

// Configurer le transporteur de messagerie
const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST,
  port: 587,
  secure: false, // true pour SSL, false pour TLS
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

module.exports = { transporter };
