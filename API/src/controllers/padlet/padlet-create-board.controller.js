const { padlet_create_board_service } = require("./services");

exports.padlet_create_board = async (req, res) => {
  try {
    const board = await padlet_create_board_service(req.body, req.params.classId, req);
    res.status(201).json(board);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
