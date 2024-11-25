const { wallpost_mark_as_read_post_service } = require("./services");

exports.wallpost_mark_as_read_post = async (req, res) => {
  try {
    const post = await wallpost_mark_as_read_post_service(req.params.postId, req);
    res.status(200).json(post);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
