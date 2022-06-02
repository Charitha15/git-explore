/* eslint no-import-assign: 0 */
import * as mongoose from 'mongoose';
import * as AbstractModels from "../models/AbstractModels";
import * as kookooService from "./KookooService";
import { ObjectId } from 'mongodb';
import {BusinessCalls} from "../models/mainDbSchema/index";
import { adjust_organisation_call_minutes } from "./DeductCallMinutesService";

mongoose.Promise = global.Promise; // ignore: no-import-assign

export async function NewCall (call, data) {
  // logToJSON('info', { call, data });
  // console.log('NEWCAll \n' + call, data);
  await AbstractModels.mongoFindOneAndUpdate(BusinessCalls, { _id:ObjectId(call._id) }, {
    status: data.status,
    time: new Date().toISOString()
  });

  // const remainingBalance = await get_remaining_call_minutes(call.organisationId);
  // if (remainingBalance < 0)

  const outgoingCallResponse = kookooService.outgoingCallResponse({ destinationNumber: call.destinationNumber });
  // console.log('outgoingCallResponse \n \n \n' + outgoingCallResponse);
  return outgoingCallResponse;
}

export async function Dial (call, data) {
  const duration = data.callduration;
  // console.log('CALL HANDLE DIAL DURATION\n\n\n\n\n\n\n'+ duration);
  await AbstractModels.mongoFindOneAndUpdate(BusinessCalls, { _id: call._id }, {
    duration,
    status: data.status,
    recording: data.data,
    isCallEnded: true
  });

  await adjust_organisation_call_minutes(call.organisationId, duration);

  const kookooHangupResponse = kookooService.hangupResponse();
  log('info', kookooHangupResponse);
  return kookooHangupResponse;
}

export async function Hangup (call, data) {
  log('info', { call, data });
  const duration = data.callduration;
  // console.log('CALL HANDLE HANGUP DURATION \n\n\n\n\n'+ duration);
  await AbstractModels.mongoFindOneAndUpdate(BusinessCalls, { _id: call._id }, {
    duration,
    status: data.status,
    isCallEnded: true,
    recording: data.data
  });

  await adjust_organisation_call_minutes(call.organisationId, duration);

  log('info', 'end');
  return '';
}

export async function Disconnect (call, data) {
  log('info', { call, data });
  // console.log('CALL HANDLE DISCONNECT \n\n\n\n\n'+ data);
  // return await AbstractModels.mongoFindOneAndUpdate(BusinessCalls, { _id: call._id }, {
  //   status: data.status,
  //   duration: data.callduration,
  //   isCallEnded: true,
  // });

  log('info', 'end');
  return '';
}
