import * as AbstractModels from "../models/AbstractModels";
import { AuditLogs } from "../models/analyticsDbSchema/index";
import * as ErrorUtils from "../errors/ErrorUtils";

const auditLogResponse = (error, req, res) => {
  const doc = {
    originalUrl: req.originalUrl,
    method: req.method,
    userAgent: req.headers["user-agent"],
    ipAddress: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
    correlationId: req.headers.correlationId,
    eventType: req.routeObj.eventType,
    requestBody: req.body,
    responseTime: new Date().getTime() - req.routeObj.startTime,
    status: true,
  };
  const apiKey = req.header("api-key");
  if (apiKey) {
    doc.apiKey = apiKey;
  }
  if (req.session) {
    doc.mobileNumber = req.session.mobileNumber;
    doc.clientId = req.session.clientId;
    doc.apiKey = req.session.apiKey;
  }
  if (req.routeObj) {
    doc.routeCategory = req.routeObj.routeCategory;
  }

  if (error) {
    doc.response = {
      code: error.code || 1000,
      reason: error.message,
      stack: error.stack,
    };
    doc.status = false;
  } else {
    doc.response = res.data;
  }
  AbstractModels.mongoInsertOne(AuditLogs, doc);
};

export const resSuccessLog = (req, res) => {
  let routeCategory;
  if (req.routeObj && req.routeObj.routeCategory) {
    routeCategory = req.routeObj.routeCategory;
  }
  if (routeCategory !== "healthCheckRoutes") {
    auditLogResponse(null, req, res);
  }
  res.status(res.statusCode || 200).send({ status: true, response: res.data });
};

/**
 * Check if not custom error, creates internal error and returns
 * @param {*} error
 * @returns
 */
function maskSystemError(error) {
  if (error.name !== "ErrorUtils") {
    return ErrorUtils.InternalServerError();
  }
  return error;
}

export const resErrorLog = (error, req, res, next) => {
  log("error", error.stack);
  auditLogResponse(error, req, res);
  // eslint-disable-next-line
  error = maskSystemError(error);
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.statusCode || 200);
  return res.send({
    status: false,
    response: {
      code: error.code || 1000,
      reason: error.message,
    },
  });
};
