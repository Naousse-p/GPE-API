const { wallpost_get_posts_service } = require("./services");

exports.wallpost_get_posts = async (req, res) => {
  try {
    const posts = await wallpost_get_posts_service(req.params.classId, req);
    res.status(200).json(posts);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
