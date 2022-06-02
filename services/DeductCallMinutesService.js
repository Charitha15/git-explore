import * as AbstractModels from "../models/AbstractModels";
import {Organisations} from "../models/mainDbSchema/index";

export const get_remaining_call_minutes = async (organisation_id) => {
  log("info", { organisation_id });
  const organisation = await AbstractModels.mongoFindOne(
    Organisations,
    { organisation_id: organisation_id }
  );
  const out = parseInt((organisation.call_minutes_available || 0).toString() || "0");
  log("info", out);
  console.log('GET REMAINING CALLMINUTES OUT RESPONSE\n\n\n\n\n'+out);
  return out;
};

export const adjust_organisation_call_minutes = async (organisation_id, call_duration) => {
  console.log('ADJUST ORGANISATION CALL MINUTES\n\n\n\n\n ', { organisation_id, call_duration });
  await AbstractModels.mongoUpdateOne(
    Organisations,
    { organisation_id },
    { $inc: { call_minutes_available: -1 * call_duration } }
  );
};
