// config/index.js
const connectDB = require("./db.config");
const configureExpress = require("./express.config");

module.exports = async function () {
  const app = configureExpress();
  await connectDB();
  return app;
};
