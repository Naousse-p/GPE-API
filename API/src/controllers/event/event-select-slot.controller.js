const { event_select_slot_service } = require("./services");

exports.event_select_slot = async (req, res) => {
  try {
    console.log("req.params.eventId", req.params.eventId);
    const slot = await event_select_slot_service(req.params.eventId, req, req.params.slotId);
    res.status(200).json(slot);
  } catch (error) {
    if (error.code === 422) {
      console.log("error", error);
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
