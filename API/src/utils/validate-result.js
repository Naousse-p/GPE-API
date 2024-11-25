const { validationResult } = require("express-validator");

const validate_result = (req, res, next) => {
  try {
    validationResult(req).throw();
    if (req.body.email) {
      req.body.email = req.body.email.toLowerCase();
    }
    return next();
  } catch (err) {
    return res.status(422).json({ errors: err.array() });
  }
};

module.exports = { validate_result };
