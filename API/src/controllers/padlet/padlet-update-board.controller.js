const { padlet_update_board_service } = require("./services");

exports.padlet_update_board = async (req, res) => {
  try {
    const updatedBoard = await padlet_update_board_service(req.body, req.params.boardId, req);
    res.status(200).json(updatedBoard);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
