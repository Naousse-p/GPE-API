const { padlet_create_section_service } = require("./services");

exports.padlet_create_section = async (req, res) => {
  try {
    const section = await padlet_create_section_service(req.body, req.params.boardId, req);
    res.status(201).json(section);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
