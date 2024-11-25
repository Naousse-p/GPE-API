const { event_get_all_type_service } = require("./services");

exports.event_get_all_type = async (req, res) => {
  try {
    const events = await event_get_all_type_service(req, req.params.classId);
    res.status(200).json(events);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
