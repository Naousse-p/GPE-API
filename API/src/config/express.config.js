// config/express.js
const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const httpError = require("http-errors");
const morgan = require("morgan");
const cors = require("cors");
const corsOption = require("./cors.config");
const { errorHandler } = require("../handler/error.handler");
const routes = require("../routes");
const path = require("path");

module.exports = function () {
  const app = express();
  const morganFormat = "dev";
  const uploadsDir = path.join(__dirname, "../../uploads");

  app.use((req, res, next) => {
    const allowedOrigins = ["http://localhost:3000", "http://192.168.1.167:3000"];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader("X-Frame-Options", `ALLOW-FROM ${origin}`);
    }
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
  });

  app.use(morgan(morganFormat));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors(corsOption));

  const assetsDirectory = path.join(__dirname, "../assets");
  app.use("/assets", express.static(assetsDirectory));

  app.use("/api", routes);

  app.use(errorHandler);
  app.use((req, res, next) => {
    next(httpError(404, "Route not found"));
  });

  return app;
};
