import getDbInstance from "../../connections/MainDb";
import { Schema } from 'mongoose';
import { Organisations } from ".";

const Organisations = new Schema(
  {
    organisation_id: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String
    },
    logo: {
      type: String
    },
    client_id: {
      type: String
    },
    contact_name: {
      type: String
    },
    phone_number: {
      type: String
    },
    address: {
      type: Object
    },
    plan: {
      type: String
    },
    status: {
      type: String, // ["CREATED", "ACTIVE", "INACTIVE"]
      default: 'CREATED'
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,getDbInstance
    },
    deleted_at: {
      type: Date
    },
    call_priority_routing: {
      type: Boolean,
      default: false
    },
    isOrgOutboundCallEnabled: {
      type: Boolean,
      default: false
    },
    call_minutes_available: {
      type: Number,
      default: 0
    },
    callerTuneUrl: {
      type: String
    },
    is_caller_tune_enable: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// const Organisations = mongo_db.model(
//   'Organisations',
//   OrganisationsSchema,
//   'Organisations'
// );
export default Organisations;
// export default Organisations = getDbInstance();