/* eslint-disable no-undef */
import * as kookooService from "./KookooService";
import * as ErrorUtil from "../errors/ErrorUtils";
import * as ErrorType from "../constants/ErrorConstants";
import * as AbstractModels from "../models/AbstractModels";
import { Organisations, IVRVirtualProfile, BusinessVirtualNumbers } from "../models/mainDbSchema/index";

export default async function initCall(orgId, { didId, number, userId }) {
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