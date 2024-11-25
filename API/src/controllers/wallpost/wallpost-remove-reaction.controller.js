const { wallpost_remove_reaction_service } = require("./services");

exports.wallpost_remove_reaction = async (req, res) => {
  try {
    const removedReaction = await wallpost_remove_reaction_service(req.params.reactionId, req);
    res.status(200).json(removedReaction);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
