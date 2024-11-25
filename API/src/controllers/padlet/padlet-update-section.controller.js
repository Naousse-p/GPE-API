const { padlet_update_section_service } = require("./services");

exports.padlet_update_section = async (req, res) => {
  try {
    const updatedSection = await padlet_update_section_service(req.body, req.params.sectionId, req);
    res.status(200).json(updatedSection);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
