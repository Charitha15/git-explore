import { Router } from "express";
import  withAsyncController  from "../commons/util/common";
import * as outboundcallController from "../controllers/OutboundcallController";

const router = Router();
router.post("/init/:param", withAsyncController(outboundcallController.callInit));
router.get("/external/call/handle/:param", withAsyncController(outboundcallController.handleCall));
router.get("/numbers/list/:param", withAsyncController(outboundcallController.didNumberList));

module.exports=router;