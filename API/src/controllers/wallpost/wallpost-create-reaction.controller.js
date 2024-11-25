const { wallpost_create_reaction_service } = require("./services");

exports.wallpost_create_reaction = async (req, res) => {
  try {
    const createdReaction = await wallpost_create_reaction_service(req.params.postId, req.body.emoji, req);
    res.status(201).json(createdReaction);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
