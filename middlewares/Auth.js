import path from "path";
import jwt from "jsonwebtoken";
import fs from "fs";
import crypto from "crypto";
import * as Constants from "../constants/Constants";

import * as ErrorUtils from "../errors/ErrorUtils";
import * as AbstractModels from "../models/AbstractModels";
import { Clients } from "../models/mainDbSchema/index";

import { RedisClient } from "../connections/RedisClient";

import {
  SECREAT, ALGORITHM, PASSWORD,
} from "../constants/Credentials";

import {
  HEADER_API_KEY, HEADER_SESSION_TOKEN,
} from "../constants/Keys";
import { deprecate } from "util";

const httpContext = require("express-http-context");

// Static data can be read using require or fs
let newSessionRoutes = fs.readFileSync(
  path.resolve(__dirname, "NewSessionRoutes.json"),
  "utf8",
);
newSessionRoutes = JSON.parse(newSessionRoutes);

let authenticatedRoutes = fs.readFileSync(
  path.resolve(__dirname, "./AuthenticatedRoutes.json"),
  "utf8",
);
authenticatedRoutes = JSON.parse(authenticatedRoutes);

const uuid = require("uuid");
const healthCheckRoutes = require("./HealthCheckRoutes.json");
const noAPIKeyRoutes = require("./NoClientIdRoutes.json");
const noSessionRoutes = require("./NoSessionRoutes.json");

const routeMaps = [
  newSessionRoutes,
  authenticatedRoutes,
  noSessionRoutes,
  noAPIKeyRoutes,
  healthCheckRoutes,
];

const getRouteCategory = (routeMapsIndex) => {
  let routeCategory = "others";
  if (routeMapsIndex === 0) {
    routeCategory = "newSessionRoutes";
  } else if (routeMapsIndex === 1) {
    routeCategory = "authenticatedRoutes";
  } else if (routeMapsIndex === 2) {
    routeCategory = "noSessionRoutes";
  } else if (routeMapsIndex === 3) {
    routeCategory = "noAPIKeyRoutes";
  } else if (routeMapsIndex === 4) {
    routeCategory = "healthCheckRoutes";
  }
  return routeCategory;
};

const checkApiKeyValidity = async (req) => {
  const apiKey = req.header(HEADER_API_KEY);
 // console.log("******************"+apiKey);
  const selectCondition = {
    metro_auth_key: apiKey,
  };
 // console.log("+++++++++++++++++++"+JSON.stringify(selectCondition));
  const projectCondition = {
    metro_auth_key: 1,
    _id: 0,
  };
 // console.log("+++++++++++++++++++"+JSON.stringify(projectCondition));
  const isValidAPIKey = await AbstractModels.mongoFindOne(
    Clients,
    selectCondition,
    projectCondition,
  );
 // console.log("********************"+isValidAPIKey);
  return isValidAPIKey;
};

const getRedisSession = async (sessionId) => {
  try {
    // @hotfix: For backward compatibility preprending "sess:" to sessionId
    const redisSession = await RedisClient.get(`sess:${sessionId}`);
    return redisSession;
  } catch (error) {
    log("error", { error });
    throw ErrorUtils.redisConnectionError();
  }
};

const decrypt = (text) => {
  let resultChiper = "";
  const decipher = crypto.createDecipher(ALGORITHM, PASSWORD);
  // console.log("+++++++++++++ length is "+ text,text.length);
  resultChiper = decipher.update(text, "hex", "utf8");
  resultChiper += decipher.final("utf8");
  return resultChiper;
};

export const getSessionObj = async (req) => {
  const sessiontoken = req.header(HEADER_SESSION_TOKEN);
  if (!sessiontoken) throw ErrorUtils.InvalidSessionToken();
  // const session = jwt.verify(sessiontoken, SECREAT);

  const sessionId = decrypt(sessiontoken);
  let session = await getRedisSession(sessionId);
  log("info", { session, sessionId, sessiontoken });

  if (!session) {
    throw ErrorUtils.InvalidSessionToken();
  }
  try {
    session = JSON.parse(session);
  } catch (error) {
    throw ErrorUtils.InvalidSessionToken();
  }
//  console.log("the returned value formthe session is +++++++++++++++"+session);
  return session;
};
const getRouteObj = (originalUrl, httpMethod) => {
  let routeObj = {};
  const normalizedURL = originalUrl.toLowerCase().split("?")[0];
  const index = normalizedURL.lastIndexOf("/");
  const baseURL = normalizedURL.substring(0, index);
  let isRouteObjFound = false;
  for (let i = 0; i < routeMaps.length; i++) {
    const routeMap = routeMaps[i];
    if (routeMap && routeMap[httpMethod]) {
      if (routeMap[httpMethod][normalizedURL]) {
        routeObj = routeMap[httpMethod][normalizedURL];
        isRouteObjFound = true;
      } else if (
        routeMap[httpMethod][`${baseURL}/:param`]
        && index !== normalizedURL.length - 1
      ) {
        routeObj = routeMap[httpMethod][`${baseURL}/:param`];
        isRouteObjFound = true;
      }
      if (isRouteObjFound) {
        routeObj.httpMethod = httpMethod;
        routeObj.baseURL = baseURL;
        routeObj.normalizedURL = normalizedURL;
        routeObj.routeCategory = getRouteCategory(i);
        break;
      }
    }
  }
  // If route is not found from RoutesMap it shoud be treated as others
  if (!isRouteObjFound) {
    routeObj.httpMethod = httpMethod;
    routeObj.baseURL = baseURL;
    routeObj.normalizedURL = normalizedURL;
    routeObj.routeCategory = "others";
  }
  return routeObj;
};

// @hotfix: For backward compatibility
// Business & consumer user roles are stored in different keys in session
// Possible values for users_business_portal_role are "admin" & "user"
async function getUserRoles(req) {
  const session = await getSessionObj(req);
  // console.log('*****************************'+JSON.stringify(session));
  const { users_business_portal_role: userRoles } = session;
  // console.log("+++++++++++ the role of user is "+JSON.stringify(userRoles))
  return [].concat(userRoles).map((value) => value.toUpperCase());
}

const checkAutorization = async (req) => {
  let isAuthorizedToAccessRoute = false;
  // console.log("in the check authorization rule--------------------------");
  const userRoles = await getUserRoles(req);
  const routeAutorizedRoles = req.routeObj?.roles || [];
  if (routeAutorizedRoles?.filter((value) => userRoles.includes(value.toUpperCase()))?.length > 0) {
    isAuthorizedToAccessRoute = true;
  }
  return isAuthorizedToAccessRoute;
};

const checkBlockListedUser = async () => {
  // @hotfix: Rewrite this logic according to service need
  const isBlockedUser = false;
  return isBlockedUser;
  // let isBlockedUser = false;
  // const session = await getSessionObj(req);
  // const { mobileNo } = session;
  // const selectCondition = {
  //   mobileNo,
  //   isBlockedUser: true,
  // };
  // const projectCondition = {
  //   mobileNo: 1,
  //   _id: 0,
  // };
  // const userObj = await AbstractModels.mongoFindOne(
  //   Users,
  //   selectCondition,
  //   projectCondition,
  // );
  // if (userObj) {
  //   isBlockedUser = true;
  // }
  // return isBlockedUser;
};

export const createSessionObj = (data) => {
  const session = jwt.sign(data, SECREAT, { expiresIn: 60 * 60 * 24 * 30 }); // default is in sec
  return session;
};

/*
1.newSessionRoutes
2.authenticatedRoutes(api key check,sessoin token check,Authorize check,blocklist users check)
3.noSessionRoutes(api key check)
4.noAPIKeyRoutes
5.healthCheckRoutes(Dont' store Audits)
6.others

For each req store req, res audits
*/

export const checks = async (req, res, next) => {
  const { routeCategory } = req.routeObj;
 // console.log("++++++++++++++++++++++++THIS IS ROUTE CATEGORY          "+routeCategory);
  if (routeCategory === "others") {
    const error = ErrorUtils.InvalidRequest();
    next(error);
  } else if (routeCategory === "healthCheckRoutes") {
    next();
  } else if (routeCategory === "noAPIKeyRoutes") {
    next();
  } else if (
    routeCategory === "noSessionRoutes"
    || routeCategory === "newSessionRoutes"
  ) {
    const isValidAPIKey = await checkApiKeyValidity(req);
    if (!isValidAPIKey) {
      const error = ErrorUtils.InvalidAPIKey();
      next(error);
    } else {
      next();
    }
  } else if (routeCategory === "authenticatedRoutes") {
    // 1.api key check 2.session token check 3.autorization check 4.blocklisted user check
    const isValidAPIKey = await checkApiKeyValidity(req);
    const session = await getSessionObj(req);
    if (!session) {
      const error = ErrorUtils.InvalidSessionToken();
      next(error);
    } else {
      const isAuthorizedToAccessRoute = await checkAutorization(req);
      // console.log('***************** is authorized user '+isAuthorizedToAccessRoute);
      const isBlockListeduser = await checkBlockListedUser();
      if (!isValidAPIKey) {
        const error = ErrorUtils.InvalidAPIKey();
        next(error);
      } else if (isBlockListeduser) {
        const error = ErrorUtils.BlockListedUser();
        next(error);
      } else if (!isAuthorizedToAccessRoute) {
        const error = ErrorUtils.InvalidAuthorization();
        next(error);
      } else {
        req.sesssion = session;
        next();
      }
    }
  }
};

export const setMetrics = (req, res) => {
  const { originalUrl } = req;
  const httpMethod = req.method;
  const routeObj = getRouteObj(originalUrl, httpMethod);
  // console.log("CHecking++++++++++++ "+JSON.stringify(routeObj));
  routeObj.startTime = new Date().getTime();

  let correlationId = req.get(Constants.LOGGER_CORRELATIONID);
  if (!correlationId) {
    // generate and set uuid v4 version
    correlationId = uuid.v4();
    httpContext.set(Constants.LOGGER_CORRELATIONID, correlationId);
    // inject correlationId in headers
    req.headers.correlationId = httpContext.get(Constants.LOGGER_CORRELATIONID);
    res.set("CorrelationId", httpContext.get(Constants.LOGGER_CORRELATIONID));
  }

  return routeObj;
};
