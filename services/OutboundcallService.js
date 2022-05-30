/* eslint-disable no-undef */
import * as kookooService from "./KookooService";
import * as ErrorUtil from "../errors/ErrorUtils";
import * as ErrorType from "../constants/ErrorConstants";
import * as AbstractModels from "../models/AbstractModels";
import * as callEventHandlers from "./callEventService";
import { Organisations, IVRVirtualProfile, BusinessVirtualNumbers, BusinessDIDNumbers } from "../models/mainDbSchema/index";

export async function initCall(orgId, { didId, number, userId }) {
  log("info", {
    orgId, didId, number, userId,
  });
  //  Check if the organisation exists or not in the organisations collecion
  const org = await AbstractModels.mongoFindOne(Organisations, { organisation_id: orgId });
  if (!org) throw ErrorUtil.createErrorMsg(ErrorType.ORGANISATION_NOT_EXISTS);
  // Check if thedidNumberbelongs to the current org or not in the BusinessVirtualNumbers Collection
  const didNumber = await AbstractModels.mongoFindOne(BusinessVirtualNumbers, {
    _id: ObjectId(didId),
    associatedOrganisation: org._id,
  });
  if (!didNumber) throw ErrorUtil.createErrorMsg(ErrorType.BUSINESS_DID_NUMBER_NOT_FOUND);
  // Retrieve the profile of the user form IVRVirtualProfile collection
  const profile = await AbstractModels.mongoFindOne(IVRVirtualProfile, {
    user_id: userId,
  });
  if (!profile) throw ErrorUtil.createErrorMsg(ErrorType.USER_NOT_FOUND);
  // get the ZVRmoibleno i.e. the personal number of the user who is initating the call
  const zvrMobileNo = profile.zvr_mobile_no.toString().slice(-10);
  // slice the destinationNumber
  const destinationNumber = number.toString().slice(-10);

  if (zvrMobileNo === destinationNumber) {
    throw ErrorUtil.createErrorMsg(ErrorType.BUSINESS_DID_NUMBER_UNABLE_CALL_SAME_NO);
  }
  //  store the call details in the BusinessCalls collecition
  const call = await AbstractModels.mongoInsertOne(BusinessCalls, {
    user: profile._id,
    organisationId: orgId,
    didNumber: didNumber.virtualNumber,
    destinationNumber: number,
    initiatorNumber: profile.zvr_mobile_no,
    time: new Date().toISOString(),
  });

  log("info", {
    orgId, didId, number, userId,
  });
  // Initiate the call via the KooKooservice
  // eslint-disable-next-line no-return-await
  return await kookooService.initCall(call);
}

export async function didNumberList(orgId, query) {
  console.log("++++++++++++ the organisation id is"+orgId)
  const skip = Number(query.pageNo || 0) * Number(query.pageSize || 20);
  const limit = skip + Number(query.pageSize);
  console.log("the value of the skip and limit are +++++++++++++++"+skip,limit);
  const org = await AbstractModels.mongoFindOne(Organisations, { organisation_id: orgId });
  console.log('the organisaiton is ++++++++++'+JSON.stringify(org));
  if (!org) throw ErrorUtil.createErrorMsg(ErrorType.ORGANISATION_NOT_EXISTS);
  const dbQuery = { associatedOrganisation: org._id };
  const total = await BusinessDIDNumbers.count(dbQuery);
  const items = await BusinessDIDNumbers.find(dbQuery)
    .skip(skip)
    .limit(limit)
    .exec();
  const out = {
    items,
    metadata: {
      total,
      query,
    },
  };
  log("info", out);
  return out;
}

export async function handleCall ({ callId }, data) {
  log('info', { callId, data });
  const call = await AbstractModels.mongoFindOne(BusinessCalls, { _id: ObjectId(callId) });
  if (!call) throw ErrorUtil.createErrorMsg(ErrorType.BUSINESS_DID_NUMBER_NOT_FOUND);

  const handler = callEventHandlers[data.event];
  if (!handler) throw ErrorUtil.createErrorMsg(ErrorType.BUSINESS_OUTBOUND_CALL_EVENT_HANDLER_NOT_FOUND);

  log('info', 'end');
  return handler(call, data);
}

export async function changeOutboundCallStatus ({ orgId }, { userId, isOutboundCallEnabled }) {
  logToJSON('info', { orgId, userId, isOutboundCallEnabled });
  const org = await AbstractModels.mongoFindOne(Organisations, { organisation_id: orgId });
  if (!org) throw ErrorUtil.createErrorMsg(ErrorType.ORGANISATION_NOT_EXISTS);

  const profileQuery = { 'organisation.organisation_id': orgId, user_id: userId };
  const profile = await AbstractModels.mongoFindOne(IVRVirtualProfile, profileQuery);
  if (!profile) throw ErrorUtil.createErrorMsg(ErrorType.USER_NOT_FOUND);

  await AbstractModels.mongoFindOneAndUpdate(IVRVirtualProfile, profileQuery, {
    isOutboundCallEnabled
  });

  logToJSON('info', {});
  return {};
}