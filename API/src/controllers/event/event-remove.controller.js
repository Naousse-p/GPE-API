const { event_remove_service } = require("./services");

exports.event_remove = async (req, res) => {
  try {
    const event = await event_remove_service(req.params.eventId, req);
    res.status(200).json(event);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
