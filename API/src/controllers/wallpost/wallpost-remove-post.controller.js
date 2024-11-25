const { wallpost_remove_post_service } = require("./services");

exports.wallpost_remove_post = async (req, res) => {
  try {
    const removedPost = await wallpost_remove_post_service(req.params.postId, req);
    res.status(200).json(removedPost);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
