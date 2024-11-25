const { padlet_post_remove_service } = require("./services");

exports.padlet_post_remove = async (req, res) => {
  try {
    const board = await padlet_post_remove_service(req.params.postId, req);
    res.status(200).json(board);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
