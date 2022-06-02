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
  const org = await AbstractModels.mongoFindOne(Organisations, { organisation_id: orgId });
  if (!org) throw ErrorUtil.organisaitonNotExists()
  const didNumber = await AbstractModels.mongoFindOne(BusinessDIDNumbers, {
    _id: ObjectId(didId),
    associatedOrganisation: org._id,
  });
  if (!didNumber) throw ErrorUtil.businessDidNumberNotFound();
  const profile = await AbstractModels.mongoFindOne(IVRVirtualProfile, {
    user_id: userId,
  });
  if (!profile) throw ErrorUtil.UserNotFoundError();
  const zvrMobileNo = profile.zvr_mobile_no.toString().slice(-10);
  const destinationNumber = number.toString().slice(-10);

  if (zvrMobileNo === destinationNumber) {
    throw ErrorUtil.UnableCallSameNo();
  }
  const call = await AbstractModels.mongoInsertOne(BusinessCalls, {
    user: profile._id,
    organisationId: orgId,
    didNumber: didNumber.virtualNumber,
    destinationNumber: number,
    initiatorNumber: profile.zvr_mobile_no,
    time: new Date().toISOString(),
  });
  return await kookooService.initCall(call);
}

export async function didNumberList(orgId, query) {
  const skip = Number(query.pageNo || 0) * Number(query.pageSize || 20);
  const limit = skip + Number(query.pageSize);
  const org = await AbstractModels.mongoFindOne(Organisations, { organisation_id: orgId });
  if (!org) throw ErrorUtil.organisaitonNotExists();
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
  return out;
}

export async function handleCall ({ callId }, data) {
  log('info', { callId, data });
 // console.log(ObjectId(callId));
  const call = await AbstractModels.mongoFindOne(BusinessCalls, { _id: ObjectId(callId) });
  if (!call) throw ErrorUtil.businessDidNumberNotFound();

  const handler = callEventHandlers[data.event];

  if (!handler) throw ErrorUtil.createErrorMsg(ErrorType.BUSINESS_OUTBOUND_CALL_EVENT_HANDLER_NOT_FOUND);
  return handler(call, data);
}

export async function callLogList (orgId, query, { userId, role } = {}) {
  const skip = (Number(query.page || 0) -1) * Number(query.page_size || 20);
  const limit = Number(query.page_size || 20);
  const dbQuery = { organisationId: orgId, isCallEnded: true };

  if (userId && role === 'USER') {
    const profile = await AbstractModels.mongoFindOne(IVRVirtualProfile, { user_id: userId });
    if (!profile) throw ErrorUtil.UserNotFoundError();
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
  const org = await AbstractModels.mongoFindOne(Organisations, { organisation_id: orgId });
  if (!org) throw ErrorUtil.organisaitonNotExists();
  const profileQuery = { 'organisation.organisation_id': orgId, user_id: userId };
  // console.log("=========== the profiile query is "+JSON.stringify(profileQuery))
  const profile = await AbstractModels.mongoFindOne(IVRVirtualProfile, profileQuery);
  if (!profile) throw ErrorUtil.UserNotFoundError();
  await AbstractModels.mongoFindOneAndUpdate(IVRVirtualProfile, profileQuery, {
    isOutboundCallEnabled
  });
  return {};
}