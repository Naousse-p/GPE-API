// src/handler/ErrorHandler.js

const httpErrors = require("http-errors");
const logger = require("./winston.handler");

const errorHandler = (err, req, res, next) => {
  if (err instanceof httpErrors.HttpError) {
    // logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    // res.status(err.status).json({ message: err.message });
  } else {
    // logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    // res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { errorHandler };
