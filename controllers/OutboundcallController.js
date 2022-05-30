import * as outboundCallService from "../services/OutboundcallService";

export async function callInit(req, res, next) {
  const { organisationId } = req.params;
  // fetch and store the didID and number from the request body
  const { didId, number } = req.body;
  log("info", { organisationId, didId, number });
  // get the userID from the session object
  const userId = req.session.user_id;
  // initiate the call from the outboundcallservice from the services
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
  // log("info", { organisationId, page, pageSize });
  console.log("/*/*/*/*/*//*/*/* the page number and size is"+pageNo,pageSize);
  const list = await outboundCallService.didNumberList(organisationId, {
    pageNo, pageSize,
  });
  res.data = list;
  log("info", res.data);
  next();
}

export async function handleCall (req, res) {
  const { callId } = req.params;
  const data = req.query;
  log("info", { callId, data });
  const response = await outboundCallService.handleCall({ callId }, data);
  log("info", { response });
  res.send(response);
}

export async function changeOutboundCallStatus (req, res, next) {
  const { organisation_id } = req.params;
  const data = req.body;
  const opts = {
    orgId: organisation_id,
    role: req.session.users_business_portal_role,
    userId: req.session.user_id
  };
  logToJSON('info', { organisation_id, data, opts });
  const response = await outboundCallService.changeOutboundCallStatus(opts, data);
  res.data = response;
  logToJSON('info', res.data);
  next();
}