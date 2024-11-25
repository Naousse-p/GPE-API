const { event_update_service } = require("./services");

exports.event_update = async (req, res) => {
  try {
    const event = await event_update_service(req.params.eventId, req.body, req);
    res.status(200).json(event);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
