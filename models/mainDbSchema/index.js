import * as mainDbConnection from "../../connections/MainDb";
import ClientsSchema from "./ClientsSchema";
import UsersSchema from "./UsersSchema";

const conn = mainDbConnection.getDbInstance();
export const Users = conn.model("Users", UsersSchema, "Users");
// @hotfix: Collection name is Client (singular)
// We can use plural name through out the code (Collection name can be changed while migrating)
export const Clients = conn.model("Clients", ClientsSchema, "Client");
