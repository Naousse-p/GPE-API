// src/handler/winston.js
const winston = require("winston");

function formatParams(info) {
  const { timestamp, level, message, ...args } = info;
  const ts = timestamp.slice(0, 19).replace("T", " ");

  // return `${ts} ${level}: ${message} ${Object.keys(args).length ? JSON.stringify(args, "", "") : ""}`;
}
const loggerFormat = winston.format.combine(winston.format.colorize(), winston.format.timestamp(), winston.format.align(), winston.format.printf(formatParams));

const logger = winston.createLogger({
  // format: loggerFormat,
  // transports: [new winston.transports.Console(), new winston.transports.File({ filename: "combined.log" })],
});

if (process.env.NODE_ENV !== "production") {
  // logger.add(
  //   new winston.transports.Console({
  //     format: winston.format.simple(),
  //   })
  // );
}

module.exports = logger;
