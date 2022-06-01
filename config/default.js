export default {
  mainDbconfig: {
    connString: "mongodb://localhost:27017/lc_metro_db",
  },
  analyticsDbConfig: {
    connString: "mongodb://localhost:27017/analyticsdb",
  },
  redisConfig: {
    connString: "redis://localhost:6379",
  },
  application_url : ' https://0f77-111-93-26-74.in.ngrok.io/v1/organisation/outbound-call',
  sentry_dsn: process.env.SENTRY_DSN,
};
