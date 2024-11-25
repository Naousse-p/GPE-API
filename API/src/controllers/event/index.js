const { event_create_personnal } = require("./event-create-personnal.controller");
const { event_create_appointment } = require("./event-create-appointment.controller");
const { event_create_informational } = require("./event-create-informational.controller");
const { event_select_slot } = require("./event-select-slot.controller");
const { event_get_all_type } = require("./event-get-all-type.controller");
const { event_get_available_contact } = require("./event-get-available-contact.controller");
const { event_update } = require("./event-update.controller");
const { event_remove } = require("./event-remove.controller");

module.exports = {
  event_create_personnal,
  event_create_appointment,
  event_create_informational,
  event_select_slot,
  event_get_all_type,
  event_get_available_contact,
  event_update,
  event_remove,
};
