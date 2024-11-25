const { wallpost_update_post_service } = require("./services");

exports.wallpost_update_post = async (req, res) => {
  try {
    const updatedPost = await wallpost_update_post_service(req.params.postId, req.body, req);
    res.status(200).json(updatedPost);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
