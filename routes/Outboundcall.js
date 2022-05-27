import { Router } from "express";
import  withAsyncController  from "../commons/util/common";
import * as outboundcallController from "../controllers/OutboundcallController";

const router = Router();
router.post("/init/:OrgId", withAsyncController(outboundcallController.callInit));
router.get("/numbers/list/:OrgId", withAsyncController(outboundcallController.didNumbersList));


module.exports=router;