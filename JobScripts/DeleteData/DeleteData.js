/* eslint-disable import/no-import-module-exports */
import * as AbstractModels from "../../models/AbstractModels";
import User from "../../models/mainDbSchema/UsersSchema";

const deleteUsers = async () => {
  const findCondition = {};
  await AbstractModels.mongoDeleteMany(User, findCondition);
  log("info", "users deleted executed");
};

module.exports = deleteUsers;
