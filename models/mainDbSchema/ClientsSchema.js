import { Schema } from "mongoose";

const ClientsSchema = new Schema({
  metro_auth_key: {
    type: String,
  },
});

export default ClientsSchema;
