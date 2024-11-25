const { wallpost_remove_comment_service } = require("./services");

exports.wallpost_delete_comment = async (req, res) => {
  try {
    const deletedComment = await wallpost_remove_comment_service(req.params.commentId, req);
    res.status(200).json(deletedComment);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
