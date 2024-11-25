const { event_create_personnal_service } = require("./services");

exports.event_create_personnal = async (req, res) => {
  try {
    const force = req.body.force || false;
    const event = await event_create_personnal_service(req.body, req.params.classId, req, force);
    res.status(201).json(event);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
