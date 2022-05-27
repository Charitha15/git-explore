/* eslint-disable import/no-unresolved */
import config from "../config/index";

export default async function initCall({ _id, didNumber, initiatorNumber }) {
  log("info", { _id, didNumber, initiatorNumber });
  // eslint-disable-next-line global-require
  const axios = require("axios");
  const apiKey = "KK232c980690c3cd35bc9ce18db9477d8b";
  const applicationUrl = new URL(config.application_url);
  const url = `${applicationUrl.origin}/business/outbound-call/external/call/handle/${_id}`;
  log("info", url);
  const API_URL = new URL("http://kookoo.in/outbound/outbound.php");
  API_URL.searchParams.set("api_key", apiKey);
  API_URL.searchParams.set("phone_no", initiatorNumber);
  API_URL.searchParams.set("caller_id", didNumber);
  API_URL.searchParams.set("outbound_version", "2");
  API_URL.searchParams.set("url", url);

  log("info", "end");
  return axios.default.get(API_URL.href);
}
