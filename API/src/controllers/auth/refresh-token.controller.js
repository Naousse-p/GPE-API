// controllers/authController.js

const { generateAccessToken } = require("./helpers/generate-token");
const { buildErrObject } = require("../../middlewares/handler/error.middleware");

exports.refresh_token = async (req, res) => {
  try {
    const accessToken = generateAccessToken(req.userId);
    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(error.code || 500).json(buildErrObject(error.code, error.message));
  }
};
