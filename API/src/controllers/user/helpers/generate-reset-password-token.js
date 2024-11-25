const jwt = require("jsonwebtoken");

const generate_reset_password_token = (userId) => {
  return jwt.sign({ userId }, process.env.SECRET_TOKEN_RESET_PASSWORD_EMAIL, { expiresIn: process.env.EXPIRE_TOKEN_RESET_PASSWORD_EMAIL });
};

module.exports = { generate_reset_password_token };
