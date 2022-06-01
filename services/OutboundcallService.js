/* eslint-disable no-undef */
import * as kookooService from "./KookooService";
import * as ErrorUtil from "../errors/ErrorUtils";
import { ObjectId } from 'mongodb';
import * as ErrorType from "../constants/ErrorConstants";
import * as AbstractModels from "../models/AbstractModels";
import * as callEventHandlers from "./callEventService";
import { Organisations, IVRVirtualProfile, BusinessDIDNumbers , BusinessCalls} from "../models/mainDbSchema/index";

export async function initCall(orgId, { didId, number, userId }) {
  log("info", {
    orgId, didId, number, userId,
  });
  console.log("+++++++++++++++++++++++++the details from the initcall are "+orgId, didId, number, userId);
  const org = await AbstractModels.mongoFindOne(Organisations, { organisation_id: orgId });
  console.log("++++++++++++++++++++++++ the organisaiton is "+org);
  if (!org) throw ErrorUtil.createErrorMsg(ErrorType.ORGANISATION_NOT_EXISTS);
  const didNumber = await AbstractModels.mongoFindOne(BusinessDIDNumbers, {
    _id: ObjectId(didId),
    associatedOrganisation: org._id,
  });
  console.log("++++++++++++++++++++++++ the did number  is "+didNumber);
  if (!didNumber) throw ErrorUtil.createErrorMsg(ErrorType.BUSINESS_DID_NUMBER_NOT_FOUND);
  const profile = await AbstractModels.mongoFindOne(IVRVirtualProfile, {
    user_id: userId,
  });
  if (!profile) throw ErrorUtil.createErrorMsg(ErrorType.USER_NOT_FOUND);
  const zvrMobileNo = profile.zvr_mobile_no.toString().slice(-10);
  const destinationNumber = number.toString().slice(-10);

  if (zvrMobileNo === destinationNumber) {
    throw ErrorUtil.createErrorMsg(ErrorType.BUSINESS_DID_NUMBER_UNABLE_CALL_SAME_NO);
  }
  const call = await AbstractModels.mongoInsertOne(BusinessCalls, {
    user: profile._id,
    organisationId: orgId,
    didNumber: didNumber.virtualNumber,
    destinationNumber: number,
    initiatorNumber: profile.zvr_mobile_no,
    time: new Date().toISOString(),
  });
  console.log("++++++++++++++++++++++ the call details are "+call);

  log("info", {
    orgId, didId, number, userId,
  });
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
  console.log(callId);
  const call = await AbstractModels.mongoFindOne(BusinessCalls, { _id: ObjectId(callId) });
  if (!call) throw ErrorUtil.createErrorMsg(ErrorType.BUSINESS_DID_NUMBER_NOT_FOUND);

  const handler = callEventHandlers[data.event];
  if (!handler) throw ErrorUtil.createErrorMsg(ErrorType.BUSINESS_OUTBOUND_CALL_EVENT_HANDLER_NOT_FOUND);

  log('info', 'end');
  return handler(call, data);
}

export async function callLogList (orgId, query, { userId, role } = {}) {
  // logToJSON('info', { orgId, query, userId, role });
  const skip = (Number(query.page || 0) -1) * Number(query.page_size || 20);
  const limit = Number(query.page_size || 20);
  const dbQuery = { organisationId: orgId, isCallEnded: true };

  if (userId && role === 'USER') {
    const profile = await AbstractModels.mongoFindOne(IVRVirtualProfile, { user_id: userId });
    if (!profile) throw ErrorUtil.createErrorMsg(ErrorType.USER_NOT_FOUND);
    dbQuery.user = profile._id;
  }

  if (query.search_key && query.q) {
    switch (query.search_key) {
      case 'status':
        dbQuery[query.search_key] = query.q;
        break;
      default:
        dbQuery[query.search_key] = new RegExp(`.*${query.q}.*`);
        break;
    }
  }

  const total = await BusinessCalls.count(dbQuery);
  const items = await BusinessCalls.find(dbQuery)
    .populate('user', '_id zvr_name zvr_mobile_no')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
  const out = {
    items,
    metadata: {
      total,
      query
    }
  };
  // logToJSON('info', out);
  return out;
}
export async function changeOutboundCallStatus ({ orgId }, { userId, isOutboundCallEnabled }) {
  console.log("teh detaisl are++++++++++++",orgId,userId,isOutboundCallEnabled);
  
  const org = await AbstractModels.mongoFindOne(Organisations, { organisation_id: orgId });
  if (!org) throw ErrorUtil.createErrorMsg(ErrorType.ORGANISATION_NOT_EXISTS);
  console.log("+++++++++++++++++ the orginization is "+JSON.stringify(org));
  const profileQuery = { 'organisation.organisation_id': orgId, user_id: userId };
  console.log("++++++++++++++ the profile query is "+ JSON.stringify(profileQuery));
  const profile = await AbstractModels.mongoFindOne(IVRVirtualProfile, profileQuery);
  if (!profile) throw ErrorUtil.createErrorMsg(ErrorType.USER_NOT_FOUND);
  console.log("+++++++++++++++ the profile is "+ JSON.stringify(profile));

  await AbstractModels.mongoFindOneAndUpdate(IVRVirtualProfile, profileQuery, {
    isOutboundCallEnabled
  });

  log('info', {});
  return {};
}