import * as outboundCallService from "../services/OutboundcallService";
import * as Auth from "../middlewares/Auth";
import { HEADER_SESSION_TOKEN } from "../constants/Keys";
//import { Console } from "winston/lib/winston/transports";

export async function callInit(req, res, next) {
  const { param } = req.params;
  const organisationId=param;
  const { didId, number } = req.body;
  log("info", { organisationId, didId, number });
  const sessionObj = await Auth.getSessionObj(req);
  const userId = sessionObj.user_id;
  await outboundCallService.initCall(organisationId, {
    didId,
    userId,
    number,
  });
  res.data = {};
  log("info", res.data);
  next();
}

export async function didNumberList(req, res, next) {
  const { param } = req.params;
  const organisationId=param
  const { pageNo, pageSize } = req.query;
  const list = await outboundCallService.didNumberList(organisationId, {
    pageNo, pageSize,
  });
  res.data = list;
  log("info", res.data);
  next();
}

export async function handleCall (req, res) {
  const { param } = req.params;
  const callId = param;
  const data = req.query;
  // console.log("CHECKING QUERY IN HANDLE CALL\n\n\n\n\n\n"+JSON.stringify(data));
  log("info", { callId, data });
  const response = await outboundCallService.handleCall({ callId }, data);
  // console.log("CHECKING RESPONSE IN HANDLE CALL\n\n\n\n\n"+response);
  log("info", { response });
  res.send(response);
}


export async function callLogList (req, res, next) {
  const { param } = req.params;
  const organisationId=param;
  const { pageNo, pageSize, search_key, q } = req.query;
  const sessionObj = await Auth.getSessionObj(req);
  const opts = {
    role: sessionObj.users_business_portal_role,
    userId: sessionObj.user_id
  };
//  console.log("++++++++++++++++++opts"+JSON.stringify(opts));
  const list = await outboundCallService.callLogList(organisationId, {
    page: pageNo, page_size: pageSize, search_key, q
  }, opts);
 // console.log("++++++++++++++++list"+list);
  res.data = list;
  // logToJSON('info', res.data);
  next();
}
export async function changeOutboundCallStatus (req, res, next) {
  const { param } = req.params;
  const organisation_id = param;
  const data = req.body;
  const sessionObj = await Auth.getSessionObj(req);
  const opts = {
    orgId: organisation_id,
    role: sessionObj.users_business_portal_role,
    userId: sessionObj.user_id
  };
  //console.log("++++++++++++++ the opts are "+JSON.stringify(opts))
  log('info', { organisation_id, data, opts });
  const response = await outboundCallService.changeOutboundCallStatus(opts, data);
  res.data = response;
  log('info', res.data);
  next();
}

