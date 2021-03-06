import getDbInstance from "../../connections/MainDb";
import { Schema } from 'mongoose';

const FcmTokenSchema = new Schema({
  firebase_token: String,
  os: String, // eg: iOS
  os_version: String, // eg: 13.2.2
  device_id: String, // eg: iPhone 7.1
  device_unique_id: String, // eg: FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9
  session_id: String,
  created_at: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'ACTIVE'
  }
});

const IVRVirtualProfileSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  organization_id: {
    type: String
  },
  group_id: {
    type: String
  },
  v_mobile_no: {
    type: String
  },
  v_mobile_nos: [{ type: String }],
  zvr_name: {
    type: String
  },
  zvr_mobile_no: {
    type: String,
    required: true
  },
  zvr_email: {
    type: String
  },
  zvr_link: {
    type: String
  },
  password: {
    type: String
    // required: true,
  },
  encryption_key: {
    type: String,
    required: true
  },
  location: {
    type: Object
  },
  address: {
    type: String
  },
  landmarks: {
    type: Array
  },
  instruction_text: {
    type: String
  },
  lm_audio_list: {
    type: Array,
    default: []
  },
  avail_audio_list: {
    type: Array,
    default: []
  },
  mm_url: {
    type: String
  },
  ref_code: {
    type: String,
    unique: true
  },
  ref_count: {
    type: Number,
    default: 0
  },
  credits: {
    type: Number,
    default: 0
  },
  refered_by: {
    type: String
  },
  refered_by_code: {
    type: String
  },
  random_code: {
    type: String
  },
  roles: {
    type: Array
  },
  client_id: {
    type: String
  },
  session_id: {
    type: String
  },
  session_ids: {
    type: Array
  },
  status: {
    type: String,
    default: 'ACTIVE'
  },
  waitlist_category: {
    type: String
  },
  statuses: {
    type: Object
  },
  reg_ec_sites: {
    type: Object,
    default: {}
  },
  active: {
    type: Boolean,
    default: true
  },
  is_transitioned: {
    type: Boolean
  },
  is_droppedoff: {
    type: Boolean
  },
  call_filter_id: {
    type: String
  },
  call_filter_off_time_id: {
    type: String
  },
  inactivated_at: {
    type: Date
  },
  activate_at: {
    type: Date
  },
  free_trial_cancelled_at: {
    type: Date
  },
  initial_activated_at: {
    type: Date
  },
  call_limit: {
    type: Number,
    default: 6000
  },
  is_business_account: {
    type: Boolean,
    default: false
  },
  cc_client_ids: {
    type: Array,
    default: []
  },
  trusted_services: {
    type: Array,
    default: []
  },
  plans_stack: {
    type: Array,
    default: []
  },
  numbers_sent: {
    type: Object
  },
  alloted_v_mobile_no: {
    type: String
  },
  alloted_at: {
    type: Date
  },
  numbers_sent_at: {
    type: Date
  },
  expire_on: {
    type: Date
  },
  expired_at: {
    type: Date
  },
  subscriptions: {
    type: Array
  },
  firebase_tokens: [FcmTokenSchema],
  firebase_token: {
    // Deprecated: Instead use firebase_tokens
    type: String
  },
  subscription_id: {
    type: String
  },
  subscription_status: {
    type: String
  },
  registered_at: {
    type: Date,
    default: Date.now
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  waitlist_at: {
    type: Date
  },
  livelist_at: {
    type: Date
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  free_trial: {
    type: Boolean
  },
  free_trial_start_at: {
    type: Date
  },
  free_trial_end_at: {
    type: Date
  },
  free_trial_cancel_at: {
    type: Date
  },
  change_to_vmn: {
    type: String
  },
  sign_up_type: {
    type: String
  },
  signup_ip: {
    type: String
  },
  upgraded_to_pro: {
    // will be true only of users who upgrade to pro from essential / free
    type: Boolean,
    default: false
  },
  // is_permanent_call_block_on: {
  //   type: Boolean,
  //   default: false,
  // },
  organisation: {
    type: Object
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  deleted_at: {
    type: Date
  },
  upgradation_in_process: {
    type: Boolean
  },
  source: {
    type: String // IAP_IOS,IAP_ANDROID...
  },
  is_manual_referral_code: {
    type: Boolean
  },
  v_mobile_no_details: {
    type: Object
  },
  has_locked: {
    type: Boolean,
    default: false
  },
  is_pro: {
    type: Boolean,
    default: false
  },
  is_kyc_completed: {
    type: Boolean
  },
  is_kyc_mandatory: {
    type: Boolean
  },
  user_type: {
    type: String,
    default: 'CONSUMER'
  },
  terminated_at: {
    type: Date
  },
  do_ekyc_later: {
    type: Boolean
  },
  preferences: {
    type: Object,
    default: { onboard_cards: true }
  },
  demo_needed: {
    type: Date
  },
  is_onboard: {
    type: Boolean,
    default: false
  },
  isOutboundCallEnabled: {
    type: Boolean,
    default: false
  },
  callerTuneUrl: {
    type: String
  },
  is_caller_tune_enable: {
    type: Boolean,
    default: false
  }
});

IVRVirtualProfileSchema.index({ v_mobile_no: 1 });
IVRVirtualProfileSchema.index({ 'organisation.organisation_id': 1 });

export default IVRVirtualProfileSchema;

/*
  status:
  1 - in progress
  2 - complete
  9 - disabled
*/
