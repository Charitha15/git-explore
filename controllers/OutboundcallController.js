import * as outboundCallService from "../services/OutboundCallService";

export default async function callInit(req, res, next) {
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
