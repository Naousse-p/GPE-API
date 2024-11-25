const { sticker_by_id_service } = require("./sticker-by-id.service");
const { sticker_create_service } = require("./sticker-create.service");
const { sticker_picture_service } = require("./sticker-picture.service");
const { sticker_update_service } = require("./sticker-update.service");
const { sticker_by_class_service } = require("./sticker-by-class.service");
const { sticker_remove_by_id_service } = require("./sticker-remove-by-id.service");
module.exports = {
  sticker_by_id_service,
  sticker_create_service,
  sticker_picture_service,
  sticker_update_service,
  sticker_by_class_service,
  sticker_remove_by_id_service,
};
