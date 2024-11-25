const { padlet_create_post_service } = require("./services");

exports.padlet_create_post = async (req, res) => {
  try {
    const post = await padlet_create_post_service(req.body, req.params.sectionId, req);
    res.status(201).json(post);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
