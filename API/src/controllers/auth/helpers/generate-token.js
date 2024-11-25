// /src/controller/helper/generateToken.js
const jwt = require("jsonwebtoken");

const generate_token = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.SECRET_TOKEN_ACCESS, { expiresIn: process.env.EXPIRE_TOKEN_ACCESS });
};

module.exports = { generate_token };
