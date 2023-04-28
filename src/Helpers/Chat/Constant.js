export const BLOCK_CONTACT_TYPE = 'block_user';
export const UNBLOCK_CONTACT_TYPE = 'unblock_user';
export const CHAT_TYPE_SINGLE = 'chat';
export const CHAT_TYPE_GROUP = 'groupchat';
export const CHAT_TYPE_BROADCAST = 'broadcast';
export const MSG_PROCESSING_STATUS_ID = 3;
export const MSG_SENT_ACKNOWLEDGE_STATUS_ID = 0;
export const MSG_DELIVERED_STATUS_ID = 1;
export const MSG_SEEN_STATUS_ID = 2;
export const MSG_PROCESSING_STATUS = 'processing';
export const MSG_SENT_ACKNOWLEDGE_STATUS = 'acknowledge';
export const MSG_DELIVERED_STATUS = 'delivered';
export const MSG_DELIVERED_STATUS_CARBON = 'carbonDelivered';
export const MSG_SEEN_STATUS = 'seen';
export const MSG_SEEN_STATUS_CARBON = 'carbonSeen';
export const MSG_SENT_SEEN_STATUS_CARBON = 'carbonSentSeen';
export const MSG_SEEN_ACKNOWLEDGE_STATUS = 'acknowledge';
export const MSG_SENT_STATUS_CARBON = 'carbonSentMessage';
export const MSG_SENT_STATUS = 'sentMessage';
export const MSG_RECEIVE_STATUS_CARBON = 'carbonReceiveMessage';
export const MSG_RECEIVE_STATUS = 'receiveMessage';
export const MSG_DELETE_STATUS_CARBON = 'carbonDeleteMessage';
export const MSG_DELETE_STATUS = 'deleteMessage';
export const USER_PRESENCE_STATUS_ONLINE = 'online';
export const USER_PRESENCE_STATUS_OFFLINE = 'unavailable';
export const GROUP_USER_ADDED = 'userAdded';
export const GROUP_USER_REMOVED = 'userRemoved';
export const GROUP_USER_MADE_ADMIN = 'madeAdmin';
export const GROUP_USER_LEFT = 'userLeft';
export const GROUP_PROFILE_INFO_UPDATED = 'profileUpdated';
export const GROUP_CHAT_PROFILE_UPDATED_NOTIFY = 'groupProfileUpdated';
export const GROUP_CREATED = 'groupCreated';
export const LOGOUT = "logout";
export const MULTI_DEVICE_LOGOUT_MSG = "New device logged in with this username. Logging out here.";
export const CARBON_LOGOUT = "carbonLogout";
export const DEFAULT_USER_STATUS = "I am in MirrorFly"
export const CONNECTION_STATE_CONNECTED = 'CONNECTED';
export const CONNECTION_STATE_DISCONNECTED = 'DISCONNECTED';
export const CONNECTION_STATE_CONN_FAILED = 'CONNECTIONFAILED';
export const CONNECTION_STATE_AUTH_FAILED = 'AUTHENTICATIONFAILED';
export const CONNECTION_STATE_ERROR_OCCURED = 'ERROROCCURED';
export const CONNECTION_STATE_CONNECTING = 'CONNECTING';
export const MSG_CLEAR_CHAT = 'clearChat';
export const MSG_CLEAR_CHAT_CARBON = 'carbonClearChat';
export const MSG_DELETE_CHAT = 'deleteChat';
export const MSG_DELETE_CHAT_CARBON = 'carbonDeleteChat';
export const DELETE_CALL_LOG = 'deleteCallLog';
export const DEFAULT_TITLE_NAME = "MirrorFly";
export const AUDIO_ACC_WINDOWS = "audio/vnd.dlna.adts";
export const THIS_MESSAGE_WAS_DELETED = "This message was deleted";
export const YOU_DELETED_THIS_MESSAGE = "You deleted this message";
export const BRAND_NAME = "MirrorFly";
export const MAP_URL = "https://maps.googleapis.com/maps/api/staticmap"
export const GROUP_UPDATE_ACTIONS = [
  GROUP_USER_ADDED,
  GROUP_USER_REMOVED,
  GROUP_USER_MADE_ADMIN,
  GROUP_PROFILE_INFO_UPDATED,
  GROUP_USER_LEFT
];
export const NEW_CHAT_CONTACT_PERMISSION_DENIED = "You have denied contact permission on mobile. Allow permission for MirrorFly to access contacts and start a new chat.";
export const NEW_GROUP_CONTACT_PERMISSION_DENIED = "You have denied contact permission on mobile. Allow permission for MirrorFly to access contacts and start a new group.";
export const ADD_PARTICIPANT_GROUP_CONTACT_PERMISSION_DENIED = "You have denied contact permission on mobile. Allow permission for MirrorFly to access contacts and add a new participant.";
export const NEW_CALL_CONTACT_PERMISSION_DENIED = "You have denied contact permission on mobile. Allow permission for MirrorFly to access contacts and start a new call.";
export const ADD_PARTICIPANT_CALL_CONTACT_PERMISSION_DENIED = "You have denied contact permission on mobile. Allow permission for MirrorFly to access contacts and add a new participant.";
export const REPORT_FROM_CONTACT_INFO = "REPORT_FROM_CONTACT_INFO";
export const LOGIN_EXCEEDED_ERROR_MESSAGE = "You have reached maximum sessions allowed.";
export const COMMON_ERROR_MESSAGE = "Something went wrong. Please try again.";
export const SESSION_LOGOUT = "The session has been logged out";
export const SERVER_LOGOUT = "serverLogout";

