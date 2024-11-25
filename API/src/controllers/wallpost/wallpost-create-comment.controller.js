const { wallpost_create_comment_service } = require("./services");

exports.wallpost_create_comment = async (req, res) => {
  try {
    const createdComment = await wallpost_create_comment_service(req.params.postId, req.body.content, req);
    res.status(201).json(createdComment);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
