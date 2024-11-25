const { sticker_remove_comment_image_service } = require("./services");

exports.sticker_remove_comment_image = async (req, res) => {
  try {
    const { AssignedStickerId } = req.params;

    const updatedAssignedSticker = await sticker_remove_comment_image_service(AssignedStickerId, req);

    res.status(200).json(updatedAssignedSticker);
  } catch (error) {
    res.status(error.code || 500).json({ message: error.message });
  }
};
