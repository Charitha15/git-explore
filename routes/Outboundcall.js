import { Router } from "express";
import { route } from "express/lib/router";
import  withAsyncController  from "../commons/util/common";
import * as outboundcallController from "../controllers/OutboundcallController";

const router = Router();
router.post("/init/:param", withAsyncController(outboundcallController.callInit));
router.get("/external/call/handle/:param", withAsyncController(outboundcallController.handleCall));
router.get("/numbers/list/:param", withAsyncController(outboundcallController.didNumberList));
router.get("/call-log/list/:param",withAsyncController(outboundcallController.callLogList));
router.put("/user/status/:param", withAsyncController(outboundcallController.changeOutboundCallStatus))

module.exports = router;