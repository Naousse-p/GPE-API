const { event_create_personnal_service } = require("./event-create-personnal.service");
const { event_create_informational_service } = require("./event-create-informational.service");
const { event_create_appointment_service } = require("./event-create-appointment.service");
const { event_select_slot_service } = require("./event-select-slot.service");
const { event_get_all_type_service } = require("./event-get-all-type.service");
const { event_get_available_contact_service } = require("./event-get-available-contact.service");
const { event_update_service } = require("./event-update.service");
const { event_remove_service } = require("./event-remove.service");

module.exports = {
  event_create_personnal_service,
  event_create_informational_service,
  event_create_appointment_service,
  event_select_slot_service,
  event_get_all_type_service,
  event_get_available_contact_service,
  event_update_service,
  event_remove_service,
};
