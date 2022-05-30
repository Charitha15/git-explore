import mongoose, { Schema } from 'mongoose';

const BusinessDIDNumbersSchema = new Schema({
  associatedOrganisation: { type: Schema.Types.ObjectId, ref: 'Organisations' },
  virtualNumber: { type: String, required: true },
  type: { type: String, enum: ['DID', 'VMN'], required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// const BusinessDIDNumbers = mongoose.model(
//   'BusinessDIDNumbers', BusinessDIDNumbersSchema, 'BusinessDIDNumbers'
// );
export default BusinessDIDNumbersSchema;
