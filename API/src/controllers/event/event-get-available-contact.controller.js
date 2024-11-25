const { event_get_available_contact_service } = require("./services");

exports.event_get_available_contact = async (req, res) => {
  try {
    const contacts = await event_get_available_contact_service(req, req.params.classId);
    res.status(200).json(contacts);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
