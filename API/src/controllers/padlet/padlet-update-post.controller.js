const { padlet_update_post_service } = require("./services");

exports.padlet_update_post = async (req, res) => {
  try {
    console.log("padlet_update_post.controller.js");
    const updatedPost = await padlet_update_post_service(req.body, req.params.postId, req);
    res.status(200).json(updatedPost);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
