/**
 * To get the constants from .env file.
 */
export const {
  REACT_APP_XMPP_SOCKET_HOST,
  REACT_APP_SSL,
  REACT_APP_ENCRYPT_KEY,
  REACT_APP_API_URL,
  REACT_APP_SOCKETIO_SERVER_HOST,
  REACT_APP_LICENSE_KEY,
  REACT_APP_MAX_USERS_CALL,
  REACT_APP_GOOGLE_TRANSLATE_API_KEY,
  REACT_APP_GOOGLE_LOCATION_API_KEY,
  REACT_APP_SKIP_OTP_LOGIN,
  REACT_APP_SITE_DOMAIN,
  REACT_APP_AUTOMATION_URL,
  REACT_APP_AUTOMATION_CHROME_USER,
  REACT_APP_AUTOMATION_CHROME_PASS,
  REACT_APP_AUTOMATION_FIREFOX_USER,
  REACT_APP_AUTOMATION_FIREFOX_PASS,
  REACT_APP_AUTOMATION_EDGE_USER,
  REACT_APP_AUTOMATION_EDGE_PASS,
  REACT_APP_TERMS_AND_CONDITIONS,
  REACT_APP_PRIVACY_POLICY,
  REACT_APP_CONTACT_EMAIL,
  REACT_APP_HIDE_NOTIFICATION_CONTENT,
} = process.env

export const REACT_APP_PROFILE_NAME_CHAR = 30
export const REACT_APP_GROUP_NAME_CHAR = 25
export const REACT_APP_STATUS_CHAR = 139
export const UNBLOCK_CONTACT = "Unblock Contact"
export const BLOCK_CONTACT = "Block Contact"
export const NO_RECENT_CHAT_INFO = "Oh snap It seems like there are no chat!"
export const NO_RECENT_CLICK_ON_INFO = "Click on "
export const NO_RECENT_SEARCH_CONTACTS_INFO = "or Search to start a Convo!"
export const NAME_CANNOT_BE_EMPTY = "Oh snap It seems like there no chat!"
export const STATUS_CANNOT_BE_EMPTY = "Status cannot be empty"
export const VIEW_PROFILE_INFO = "Profile image, name and status can be changed at anytime"
export const CHECK_INTERENT_CONNECTIVITY = "Check your network connectivity"
export const NO_SEARCH_CHAT_CONTACT_FOUND = "No chats or contacts found"
export const NO_SEARCH_CONTACT_FOUND = "No contacts found"
export const NO_RESULTS_FOUND = "No results found"
export const NO_SEARCH_CALLLOG_FOUND = "No calllog found"
export const MEDIA_AND_DOCS = "Media and Docs"
export const VIEW_PHOTO = "View Photo"
export const TAKE_PHOTO = "Take Photo"
export const REMOVE_PHOTO = "Remove Photo"
export const CANCEL = "Cancel"
export const REMOVE = "Remove"
export const IMAGE_TYPE_ONLY_ALLOWED = "Image type only allowed to upload"
export const FILE_SIZE_UPLOAD_LIMIT = "File size should not exceed 2MB"
export const CROP_PHOTO = "Drag and Adjust"
export const PROFILE = "Profile"
export const UPLOAD_PHOTO = "Upload Photo"
export const CAMERA_NOT_FOUND = "Camera Not Found!"
export const CAMERA_ERROR = "There was an error with accessing the camera"
export const REMOVE_YOUR_PROFILE_PHOTO = "Remove your profile photo?"
export const YOUR_STATUS = "Your Status"
export const ABOUT_AND_PHONE_NO = "About and phone number"
export const ABOUT_AND_EMAIL_ID = "About and email"
export const CAMERA_PERMISSION_DENIED = "Camera not authorized. Please check your media permissions settings"
export const AUDIO_PERMISSION_DENIED = "Audio Microphone not authorized. Please check your media permissions settings"
export const PERMISSION_DENIED = "Permission denied"
export const RETAKE = "Retake"
export const ENABLE_NOTIFICATIONS = "Please enable browser notifications"

export const REACT_APP_CONTACT_SYNC = process.env.REACT_APP_CONTACT_SYNC === "true" ? true : false
