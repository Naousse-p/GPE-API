const { wallpost_update_comment_service } = require("./services");

exports.wallpost_update_comment = async (req, res) => {
  try {
    const updatedComment = await wallpost_update_comment_service(req.params.commentId, req.body.content, req);
    res.status(200).json(updatedComment);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
