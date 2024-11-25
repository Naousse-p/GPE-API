const { padlet_board_by_id_service } = require("./services");

exports.padlet_board_by_id = async (req, res) => {
  try {
    const board = await padlet_board_by_id_service(req.params.boardId, req);
    res.status(200).json(board);
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};
