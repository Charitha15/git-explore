import mongoose, { Schema } from 'mongoose';

const BusinessCallsSchema = new Schema({
  organisationId: { type: String, required: true },
  user: { type: String, required: true, ref: 'IVRVirtualProfile' },
  destinationNumber: { type: String, required: true },
  initiatorNumber: { type: String, required: true },
  didNumber: { type: String, required: true },
  status: { type: String },
  duration: { type: Number, default: 0, required: true },
  isCallEnded: { type: Boolean, default: false, required: true },
  recording: { type: String, default: false, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default BusinessCallsSchema;
