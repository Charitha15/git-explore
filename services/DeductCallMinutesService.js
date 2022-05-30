import * as AbstractModels from "../models/AbstractModels";
import Organisations from "../models/mainDbSchema/OrganisationSchema";

export const get_remaining_call_minutes = async (organisation_id) => {
  logToJSON("info", { organisation_id });
  logToJSON("info", { organisation_id });
  const organisation = await AbstractModels.mongoFindOne(
    Organisations,
    { organisation_id: organisation_id }
  );
  const out = parseInt((organisation.call_minutes_available || 0).toString() || "0");
  logToJSON("info", out);
  return out;
};

export const adjust_organisation_call_minutes = async (organisation_id, call_duration) => {
  logToJSON("info", { organisation_id, call_duration });
  logToJSON("info", { organisation_id, call_duration });
  await AbstractModels.mongoUpdateOne(
    Organisations,
    { organisation_id },
    { $inc: { call_minutes_available: -1 * call_duration } }
  );
};
