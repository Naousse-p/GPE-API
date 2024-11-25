// /src/controller/helper/generateToken.js
const jwt = require("jsonwebtoken");

const generate_refresh_token = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.SECRET_TOKEN_REFRESH, { expiresIn: process.env.EXPIRE_TOKEN_REFRESH });
};

module.exports = { generate_refresh_token };
