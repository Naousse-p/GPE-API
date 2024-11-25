const { wallpost_create_post_service } = require("./services");

exports.wallpost_create_post = async (req, res) => {
  try {
    const createdPost = await wallpost_create_post_service(req.body, req.params.classId, req);
    res.status(201).json(createdPost);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
