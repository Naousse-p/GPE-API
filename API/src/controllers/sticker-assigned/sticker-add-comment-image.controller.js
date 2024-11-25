const { sticker_add_comment_image_service } = require("./services");

exports.sticker_add_comment_image = async (req, res) => {
  try {
    console.log("req.body", JSON.stringify(req.body));
    const { AssignedStickerId } = req.params;
    const data = req.body;

    const updatedAssignedSticker = await sticker_add_comment_image_service(AssignedStickerId, data, req);

    res.status(200).json(updatedAssignedSticker);
  } catch (error) {
    res.status(error.code || 500).json({ message: error.message });
  }
};
