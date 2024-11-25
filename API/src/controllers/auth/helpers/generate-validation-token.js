const jwt = require("jsonwebtoken");

const generate_validation_token = (userId) => {
  return jwt.sign({ userId }, process.env.SECRET_TOKEN_VALIDATION_EMAIL, { expiresIn: process.env.EXPIRE_TOKEN_VALIDATION_EMAIL });
};

module.exports = { generate_validation_token };
