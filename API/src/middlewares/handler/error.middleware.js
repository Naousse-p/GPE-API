// /src/middlewares/utils/errorHandler.js

const handleError = (res = {}, err = {}) => {
  if (process.env.NODE_ENV === "development") {
    console.log("err", err);
  }
  res.status(err.code).json({
    errors: {
      msg: err.message,
    },
  });
};

const buildErrObject = (code, message) => {
  return {
    code: code || 500,
    message: message || "Internal Server Error",
  };
};

module.exports = { buildErrObject, handleError };
