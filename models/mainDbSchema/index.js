import * as mainDbConnection from "../../connections/MainDb";
import ClientsSchema from "./ClientsSchema";
import UsersSchema from "./UsersSchema";
import OrganisationSchema from "./OrganisationSchema";
import IVRVirtualprofileSchema from "./IVRVirtualprofileSchema";
import BussinesscallSchema from "./BussinesscallSchema";
import BusinessDIDNumbersSchema from "./BussinessDIDNumbersSchema";

const conn = mainDbConnection.getDbInstance();
export const Users = conn.model("Users", UsersSchema, "Users");
// @hotfix: Collection name is Client (singular)
// We can use plural name through out the code (Collection name can be changed while migrating)
export const Clients = conn.model("Clients", ClientsSchema, "Client");

export const Organisations = conn.model("Organisations", OrganisationSchema, "Organisations");
export const IVRVirtualProfile = conn.model("IVRVirtualProfile", IVRVirtualprofileSchema, "IVRVirtualProfile");
export const BusinessCalls = conn.model("BusinessCalls", BussinesscallSchema, "BusinessCalls");
export const BusinessVirtualNumbers = conn.model("BusinessVirtualNumbers", BusinessDIDNumbersSchema, "BusinessVirtualNumbers");
export const BusinessDIDNumbers = conn.model("BusinessDIDNumbers",BusinessDIDNumbersSchema,"BusinessDIDNumbers");
