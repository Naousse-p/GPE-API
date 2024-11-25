const { transporter } = require("../mailer.utils");
const fs = require("fs");
const path = require("path");

const sendEmailConfirmation = async (email, validationLink) => {
  try {
    const html = fs.readFileSync(path.join(__dirname, "../templates/validationEmail.html"), "utf8");

    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: "Confirmez votre adresse e-mail",
      html: html
        .replace("{{buttonUrl}}", process.env.FRONT_URL_DEV + `connexion?token=${validationLink}`)
        .replace('<link rel="stylesheet" type="text/css" href="style.css" />', `<style type="text/css">${fs.readFileSync(path.join(__dirname, "../templates/style.css"))}</style>`),
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "../../assets/logo.png"),
          cid: "header",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = { sendEmailConfirmation };
