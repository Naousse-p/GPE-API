const { transporter } = require("../mailer.utils");
const fs = require("fs");
const path = require("path");

const sendResetPassword = async (email, resetLink) => {
  try {
    const html = fs.readFileSync(path.join(__dirname, "../templates/resetPassword.html"), "utf8");

    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: "Modification de mot de passe",
      html: html
        .replace("{{buttonUrl}}", process.env.NODE_ENV === "prod" ? process.env.FRONT_URL_PROD : process.env.FRONT_URL_DEV + `modification-mot-de-passe?token=${resetLink}`)
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
    console.log("E-mail sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = { sendResetPassword };
