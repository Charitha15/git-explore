import * as AbstractModels from "../models/AbstractModels";
import * as Auth from "./Auth";

import { AuditLogs } from "../models/analyticsDbSchema/index";

export const auditLogRequest = (req) => {
  const doc = {
    originalUrl: req.originalUrl,
    method: req.method,
    userAgent: req.headers["user-agent"],
    ipAddress: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
    correlationId: req.headers.correlationId,
    eventType: req.routeObj.eventType,
    requestBody: req.body,
  };
  const apiKey = req.header("api-key");
  if (apiKey) {
    doc.apiKey = apiKey;
  }
  AbstractModels.mongoInsertOne(AuditLogs, doc);
};

const reqLog = (req, res, next) => {
  const routeObj = Auth.setMetrics(req, res);
  req.routeObj = routeObj;
  if (routeObj.routeCategory !== "healthCheckRoutes") {
    next();
  } else {
    next();
  }
};

export default reqLog;
