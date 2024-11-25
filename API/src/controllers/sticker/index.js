const { sticker_create } = require("./sticker-create.controller");
const { sticker_by_id } = require("./sticker-by-id.controller");
const { sticker_picture } = require("./sticker-picture.controller");
const { sticker_update } = require("./sticker-update.controller");
const { sticker_by_class } = require("./sticker-by-class.controller");
const { sticker_remove_by_id } = require("./sticker-remove-by-id.controller");
module.exports = {
  sticker_by_id,
  sticker_create,
  sticker_picture,
  sticker_update,
  sticker_by_class,
  sticker_remove_by_id,
};
