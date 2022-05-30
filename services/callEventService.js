/* eslint no-import-assign: 0 */
import * as mongoose from 'mongoose';
import * as AbstractModels from "../models/AbstractModels";
import * as kookooService from "./KookooService";
import BusinessCalls from "../models/mainDbSchema/BussinesscallSchema";
import { adjust_organisation_call_minutes } from "./DeductCallMinutesService";

mongoose.Promise = global.Promise; // ignore: no-import-assign

export async function NewCall (call, data) {
  logToJSON('info', { call, data });
  await AbstractModels.mongoFindOneAndUpdate(BusinessCalls, { _id: call._id }, {
    status: data.status,
    time: new Date().toISOString()
  });

  // const remainingBalance = await get_remaining_call_minutes(call.organisationId);
  // if (remainingBalance < 0)

  const outgoingCallResponse = kookooService.outgoingCallResponse({ destinationNumber: call.destinationNumber });
  logToJSON('info', { outgoingCallResponse });
  return outgoingCallResponse;
}

export async function Dial (call, data) {
  logToJSON('info', { call, data });
  const duration = data.callduration;
  await AbstractModels.mongoFindOneAndUpdate(BusinessCalls, { _id: call._id }, {
    duration,
    status: data.status,
    recording: data.data,
    isCallEnded: true
  });

  await adjust_organisation_call_minutes(call.organisationId, duration);

  const kookooHangupResponse = kookooService.hangupResponse();
  logToJSON('info', kookooHangupResponse);
  return kookooHangupResponse;
}

export async function Hangup (call, data) {
  logToJSON('info', { call, data });
  const duration = data.callduration;
  await AbstractModels.mongoFindOneAndUpdate(BusinessCalls, { _id: call._id }, {
    duration,
    status: data.status,
    isCallEnded: true,
    recording: data.data
  });

  await adjust_organisation_call_minutes(call.organisationId, duration);

  logToJSON('info', 'end');
  return '';
}

export async function Disconnect (call, data) {
  logToJSON('info', { call, data });
  // return await AbstractModels.mongoFindOneAndUpdate(BusinessCalls, { _id: call._id }, {
  //   status: data.status,
  //   duration: data.callduration,
  //   isCallEnded: true,
  // });

  logToJSON('info', 'end');
  return '';
}
