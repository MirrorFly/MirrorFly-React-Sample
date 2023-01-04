import React from "react";
import uuidv4 from "uuid/v4";
import renderHTML from "react-render-html";
import lodashCamelCase from "lodash.camelcase";
import _truncate from "lodash/truncate";
import moment from "moment";
import SDK from "../Components/SDK";
import linkify from "./linkify";
import { DateTime } from "luxon";
import { changeTimeFormat, handleMessageParseHtml } from "./Chat/RecentChat";
import {
  IMAGE_FORMATS,
  VIDEO_FORMATS,
  AUDIO_FORMATS,
  DOCUMENT_FORMATS,
  ALLOWED_ALL_FILE_FORMATS,
  CHAT_AUDIOS,
  CHAT_IMAGES,
  MAX_WIDTH_WEB,
  MIN_WIDTH_WEB,
  MAX_HEIGHT_WEB,
  MIN_HEIGHT_WEB,
  MAX_WIDTH_AND,
  MIN_HEIGHT_AND,
  MIN_WIDTH_AND,
  MAX_HEIGHT_AND,
  MIN_OFFSET_WIDTH,
  MIN_OFFSET_HEIGHT,
  INITIALS_COLOR_CODES
} from "./Constants";
import { getExtension } from "../Components/WebChat/Common/FileUploadValidation";
import { REACT_APP_API_URL, REACT_APP_LICENSE_KEY, REACT_APP_SANDBOX_MODE,REACT_APP_SITE_DOMAIN, REACT_APP_AUTOMATION_CHROME_USER, REACT_APP_AUTOMATION_CHROME_PASS, REACT_APP_AUTOMATION_EDGE_USER, REACT_APP_AUTOMATION_FIREFOX_USER, REACT_APP_AUTOMATION_FIREFOX_PASS, REACT_APP_AUTOMATION_EDGE_PASS, REACT_APP_HIDE_NOTIFICATION_CONTENT, REACT_APP_XMPP_SOCKET_HOST } from "../Components/processENV";
import Store from "../Store";
import { getContactNameFromRoster, formatUserIdToJid, isSingleChatJID, getLocalUserDetails } from "./Chat/User";
import { MSG_PROCESSING_STATUS, GROUP_CHAT_PROFILE_UPDATED_NOTIFY, MSG_SENT_STATUS_CARBON, CHAT_TYPE_SINGLE, CHAT_TYPE_GROUP } from "./Chat/Constant";
import toastr from "toastr";
import { isGroupChat } from "./Chat/ChatHelper";
import Push from "push.js";
import { callbacks } from "../Components/callbacks";
import config from "../config";
import { ActiveChatAction } from "../Actions/RecentChatActions";
import { UnreadCountDelete } from "../Actions/UnreadCount"
import { callIntermediateScreen } from "../Actions/CallAction";
import { getFromLocalStorageAndDecrypt, encryptAndStoreInLocalStorage} from "../Components/WebChat/WebChatEncryptDecrypt";

const PNF = require("google-libphonenumber").PhoneNumberFormat;
const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();
window.phoneUtil = phoneUtil;

let arr = [];
const TIME_FORMAT = "hh:mm a";
const FINAL_FORMAT = "d MMM yyyy";

class Utility {
  /**
   * Get element from array by property
   *
   * @param array
   * @param mixed
   * @param string
   * @return mixed
   */
  static getElementFromArrayByProperty(elements, value, property = "id") {
    let selectedScriptIndex = false;

    let selectedElement = elements.filter((element, index) => {
      let filtered = false;
      if (element[property] === value) {
        filtered = true;
        selectedScriptIndex = index;
      }

      return filtered;
    });
    return {
      element: selectedElement.shift(),
      index: selectedScriptIndex
    };
  }

  /**
   * Get specific element attributes from array
   *
   * @param array
   * @param mixed
   * @param string
   * @return mixed
   */
  static getSpecificAttributeFromArray(elements, property) {
    return Array.isArray(elements) && Utility.isString(property)
      ? elements.map((element) => {
          return Utility.isObject(element) && element.hasOwnProperty(property) ? element[property] : null;
        })
      : [];
  }

  /**
   * delete element from array by property value
   *
   * @param array
   * @param mixed
   * @param string
   * @return mixed
   */
  static removeElementFromArrayByProperty(elements, value, property = "id") {
    return elements.filter((element, index) => {
      return element[property] && element[property] !== value;
    });
  }

  /**
   * Safly push element to array
   *
   * @param elements
   * @param element
   * @param string
   * @return array
   */
  static safelyPushElementToArray(elements, element, property = "id") {
    let elementInfo = Utility.getElementFromArrayByProperty(elements, element[property]);

    if (!elementInfo.index && Array.isArray(elements)) {
      elements.push(element);
    }

    return elements;
  }

  /**
   * @description
   * Determines if a reference is an `Object`. Unlike `typeof` in JavaScript, `null`s are not
   * considered to be objects. Note that JavaScript arrays are objects.
   *
   * @param {*} value Reference to check.
   * @returns {boolean} True if `value` is an `Object` but not `null`.
   */
  static isObject(value) {
    return value !== null && typeof value === "object";
  }

  /**
   *
   * @description
   * Determines if a reference is a `String`.
   *
   * @param {*} value Reference to check.
   * @returns {boolean} True if `value` is a `String`.
   */
  static isString(value) {
    return typeof value === "string";
  }

  /**
   * Determines if a value is a regular expression object.
   *
   * @private
   * @param {*} value Reference to check.
   * @returns {boolean} True if `value` is a `RegExp`.
   */
  static isRegExp(value) {
    return toString.call(value) === "[object RegExp]";
  }

  /**
   * @description
   * Determines if a value is a date.
   *
   * @param {*} value Reference to check.
   * @returns {boolean} True if `value` is a `Date`.
   */
  static isDate(value) {
    return toString.call(value) === "[object Date]";
  }

  /**
   * @description
   * Determines if a reference is a `Function`.
   *
   * @param {*} value Reference to check.
   * @returns {boolean} True if `value` is a `Function`.
   */
  static isFunction(value) {
    return typeof value === "function";
  }

  /**
   * @description
   * Determines if a reference is defined.
   *
   * @param {*} value Reference to check.
   * @returns {boolean} True if `value` is defined.
   */
  static isDefined(value) {
    return typeof value !== "undefined";
  }

  /**
   * @description
   * Get image as base 64
   *
   * @param image
   * @param ext
   * @returns string
   */
  static getImageAsBase64(image, ext) {
    return `data:image/${ext};base64,${image}`;
  }

  /**
   * @description
   * Get string as camel case
   *
   * @param string
   * @returns string
   */
  static camelCase(str) {
    let convertedStr = lodashCamelCase(str);
    return convertedStr.charAt(0).toUpperCase() + convertedStr.slice(1);
  }
}

export default Utility;

/**
 * Sorting the array of objects
 */
export function compare(a, b) {
  let aname = getContactNameFromRoster(a);
  let bname = getContactNameFromRoster(b);
  let aLowerName = aname.toLowerCase();
  let bLowerName = bname.toLowerCase();
  if (aLowerName < bLowerName) {
    return -1;
  }
  if (aLowerName > bLowerName) {
    return 1;
  }
  return 0;
}

export function recentChatCompare(a, b) {
  let aname = new Date(a.recent.time);
  let bname = new Date(b.recent.time);
  return aname - bname;
}

export function parsedContacts(contacts) {
  return new Promise((resolve, reject) => {
    return resolve(
      contacts.reduce((acc, current) => {
        const x = acc.find(
          (item) => (item.userId ? item.userId : item.jid) === (current.userId ? current.userId : current.jid)
        );
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, [])
    );
  });
}

/**
 * function is to get formatted date time
 * @param {*} datetime Unix date time
 */
export const getFormattedDateTime = (datetime) => {
  // unix to milliseconds
  const milliseconds = parseInt(datetime, 10);
  datetime = new Date(milliseconds);

  return datetime.toLocaleString("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true
  });
};

/**
 * function is to get formatted date
 * @param {*} datetime Unix date
 */
export const getFormattedDate = (datetime) => {
  // unix to milliseconds
  const milliseconds = parseInt(datetime, 10);
  datetime = new Date(milliseconds);

  return datetime.toLocaleString("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric"
  });
};

/**
 * function is to get formatted date
 * @param {*} datetime Unix date
 */
export const getFormattedDateCallLogs = (datetime) => {
  datetime = new Date(datetime);

  return datetime.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};

/**
 * Convert strings to its actual data type
 * @param {*} inputObj input object
 *
 * @return Object
 */
export const ParseStringToItsDatatype = (inputObj) => {
  var obj = Object.assign({}, inputObj);
  for (let i in obj) {
    switch (true) {
      case String(obj[i]).toLowerCase() === "true":
        obj[i] = true;
        break;
      case String(obj[i]).toLowerCase() === "false":
        obj[i] = false;
        break;
      case String(obj[i]).match(/^[0-9]+$/) != null:
        obj[i] = parseInt(obj[i], 10);
        break;
      case String(obj[i]).match(/^[-+]?[0-9]+\.[0-9]+$/) != null:
        obj[i] = parseFloat(obj[i]);
        break;
      default:
        break;
    }
  }
  return obj;
};

/**
 * Function is to truncate the string based on number of characters
 * @param {*} string
 * @param {*} length
 */
export const TrimString = (string, length) => {
  return _truncate(string, {
    length, // maximum 30 characters
    separator: /,?\.* +/ // separate by spaces, including preceding commas and periods
  });
};

/**
 * To check the valid url.
 */
export const validURL = (str) => {
  if (str === "" || str === null || str === undefined) {
    return false;
  }
  var pattern = new RegExp(
    /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/
    ); // fragment locator
  return pattern.test(str);
};

export const isUrl = (s) => {
  var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  return regexp.test(s);
};

export const validURLCheck = (str) => {
  var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  return regexp.test(str);
};

/**
 * To Escape the Special Characters in Search to Avoid issue in Regex
 * @param {string} stringVal
 * @return {string}
 */
export const escapeRegex = (stringVal) => stringVal.replace(/[\-\[&\/\\#,+()|$^~%.'":*?<>{}]/g, "\\$&");

/**
 * Function is to split the particular text from a tring
 * @param {name} string
 * @param {higlight} length
 * @return {Object}
 */
export const getHighlightedText = (name, higlight) => {
  if (!name || !higlight) return name;
  // Split on higlight term and include term into parts, ignore case
  // var replacedStr = (higlight || '').trim().split(/\s+/).map(x => x.replace(/[-[\]{}()*+!<=:?.\\^$|#\s,]/g, '\\$&')).join("|");
  // Commented "replacedStr" inorder to match space
  higlight = higlight.trim();
  let parts = name.split(new RegExp(`(${escapeRegex(higlight)})`, "gi"));
  return parts.map((part, i) => {
    return (
      <span key={i} style={part.toLowerCase() === higlight.toLowerCase() ? { color: "#4879F9" } : {}}>
        {part}
      </span>
    );
  });
};

export const getConversationHistoryTime = (UTCTime) => {
  let offset = moment().utcOffset();
  return moment.utc(UTCTime).utcOffset(offset).format("LT");
};

export const getDateIndication = (msgId, UTCTime) => {
  let response = moment(UTCTime).format("dddd");
  arr.push({ msgId: msgId, time: response });
  return arr;
};

/**
 * Function to format the phone number in international format
 * @param {data} string
 */
export const getFormatPhoneNumber = (name) => {
  if (name && name !== "undefined" && name.length <= 15) {
    try {
      const number = phoneUtil.parseAndKeepRawInput("+" + name, "");
      return phoneUtil.format(number, PNF.INTERNATIONAL);
    } catch (e) {
      return name;
    }
  }
  return name;
};

/**
 * Function to find someone(using jid) is blocked the logged in user.
 * false: Blocked, true: not blocked
 * @param {jid} string
 */
export const getIsBlockedUser = (jid) => {
  const contactsWhoBlockedMe = Store.getState().contactsWhoBlockedMe.data;

  if (contactsWhoBlockedMe.length > 0) {
    if (contactsWhoBlockedMe.indexOf(jid) > -1) {
      return false;
    }
    return true;
  }
  return true;
};

/**
 * Function to get local time from given time and
 * @param {dateTime} dateTime
 */
export const getLocalTime = (dateTime) => {
  let localDateTime = moment.utc(dateTime).local().format("YYYY-MM-DD h:mm:ss a");
  let localDateTimeSplit = localDateTime.split(" ");
  let removeSeconds = localDateTimeSplit[1].split(":");
  let localTime = removeSeconds[0] + ":" + removeSeconds[1] + " " + localDateTimeSplit[2];
  return {
    localDateTime: localDateTime,
    localTime: localTime
  };
};

/**
 * getFormattedText() handles text and formats into proper special characters
 * @param {string} msg
 */
export const getFormattedText = (text) => {
  if (!text) return "";
  return text.replace(/&nbsp;/g, "").replace(/&amp;/g, "&");
};

export const getFormattedRecentChatText = (text) => {
  if (!text) return "";
  return text
    .replace(/&nbsp;/g, "")
    .replace(/&amp;/g, "&")
    .replace(/\n/g, "&nbsp;&nbsp;");
};

export const convertTextToURL = (inputText = "") => linkify(inputText);

export const captionLink = (text) => {
  if (!text) return "";
  return renderHTML(convertTextToURL(text.replace(/&nbsp;/g, "").replace(/&amp;/g, "&")));
};

/**
 * logout() Method to call the SDK.logout() and removed the localstorage values. <br />
 * Window.location.reload() function performed.
 */
export const logout = async(type = "") => {
  localStorage.clear();
  await deleteAllIndexedDb();
  SDK && SDK.logout();
  if (type === "accountDeleted") {
    encryptAndStoreInLocalStorage("deleteAccount", true);
  }
  if (type !== "block") {
    window.location.reload();
  }
};

export const formatCallLogDate = (date) => {
  const datesDiff = daysBetween(new Date(), new Date(date));
  if (datesDiff === null || datesDiff === undefined || datesDiff === "") {
    return "?";
  }
  if (datesDiff === 0) {
    return "Today";
  } else if (datesDiff === -1) {
    return "Yesterday";
  } else {
    return DateTime.fromJSDate(new Date(date)).toFormat(FINAL_FORMAT);
  }
};

function daysBetween(first, second) {
  // Copy date parts of the timestamps, discarding the time parts.
  var one = new Date(first.getFullYear(), first.getMonth(), first.getDate());
  var two = new Date(second.getFullYear(), second.getMonth(), second.getDate());
  // Do the math.
  var millisecondsPerDay = 1000 * 60 * 60 * 24;
  var millisBetween = two.getTime() - one.getTime();
  var days = millisBetween / millisecondsPerDay;
  // Round down.
  return Math.floor(days);
}

export const formatCallLogTime = (date) => {
  const dateMessage = DateTime.fromMillis(date / 1000);
  return dateMessage.toFormat(TIME_FORMAT);
};

export const durationCallLog = (startDate, endDate) => {
  var ms = endDate / 1000 - startDate / 1000;
  let min = Math.floor((ms / 1000 / 60) << 0);
  let seconds = Math.floor((ms / 1000) % 60);
  return (min <= 9 ? "0" + min : min) + ":" + (seconds <= 9 ? "0" + seconds : seconds);
};

export function capitalizeFirstLetter(string) {
  if (!string) return null;
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getPhoneNumberFromJid(userJid) {
  return userJid.includes("@") ? userJid.split("@")[0] : userJid;
}

export const getUserIdFromJid = (userJid) => {
  return userJid.includes("@") ? userJid.split("@")[0] : userJid;
};

export const getMessageType = (fileType, file) => {
  let msgType;
  const allowedFilescheck = new RegExp("([a-zA-Z0-9s_\\.-:])+(" + ALLOWED_ALL_FILE_FORMATS.join("|") + ")$", "i");
  if (IMAGE_FORMATS.includes(fileType)) {
    msgType = "image";
  } else if (VIDEO_FORMATS.includes(fileType)) {
    msgType = "video";
  } else if (AUDIO_FORMATS.includes(fileType)) {
    msgType = "audio";
  } else if (allowedFilescheck.test(getExtension(file.name)) || DOCUMENT_FORMATS.includes(fileType)) {
    msgType = "file";
  }
  return msgType;
};

// Recalculates Image/Video Width and Height for Multiple Platforms
export const calculateWidthAndHeight = (width, height) => {
  let response = {};

  switch (true) {
    // Horizontal Video
    case width > height:
      let resultHeight = Math.round((height / width) * MAX_WIDTH_WEB),
        resultHeightAnd = Math.round((height / width) * MAX_WIDTH_AND);

      response = {
        webWidth: MAX_WIDTH_WEB,
        webHeight: resultHeight > MIN_HEIGHT_WEB ? resultHeight : MIN_HEIGHT_WEB,
        androidWidth: MAX_WIDTH_AND,
        androidHeight: resultHeightAnd > MIN_HEIGHT_AND ? resultHeightAnd : MIN_HEIGHT_AND
      };
      break;

    // Vertical Video
    case width < height:
      response = {
        webWidth: MIN_WIDTH_WEB,
        webHeight: MAX_HEIGHT_WEB,
        androidWidth: MIN_WIDTH_AND,
        androidHeight: MAX_HEIGHT_AND
      };
      break;

    // Default/Square Video
    default:
      response = {
        webWidth: MAX_WIDTH_WEB,
        webHeight: MAX_WIDTH_WEB,
        androidWidth: MAX_WIDTH_AND,
        androidHeight: MAX_WIDTH_AND
      };
      break;
  }
  return response;
};

// Recalculates Image/Video Width and Height for Multiple Platforms
export const calculateWidthAndHeightOffset = (width, height, offsetWidth, offsetHeight) => {
  let response = {};

  switch (true) {
    case width < offsetWidth && height < offsetHeight:
      if (width < MIN_OFFSET_WIDTH && height < MIN_OFFSET_HEIGHT) {
        if (width === height) {
          response = {
            webWidth: MIN_OFFSET_WIDTH,
            webHeight: MIN_OFFSET_HEIGHT
          };
        } else if (width > height) {
          response = {
            webWidth: MIN_OFFSET_WIDTH,
            webHeight: Math.round((height / width) * MIN_OFFSET_WIDTH)
          };
        } else {
          response = {
            webWidth: Math.round((width / height) * MIN_OFFSET_HEIGHT),
            webHeight: MIN_OFFSET_HEIGHT
          };
        }
      } else {
        response = {
          webWidth: width,
          webHeight: height
        };
      }
      break;

    case height > offsetHeight :
      let resultWidth = Math.round(offsetHeight * (width / height) );
      if(resultWidth > offsetWidth){
          response = {
            webWidth: offsetWidth,
            webHeight: Math.round((height / width) * offsetWidth)
          };
      }
      else {
        response = {
        webWidth: resultWidth > offsetWidth ? offsetWidth : resultWidth,
        webHeight: offsetHeight
      };
    }
      break;

    case width > height:
      let resultHeight = Math.round(offsetWidth / (width / height));
      response = {
        webWidth: offsetWidth,
        webHeight: resultHeight
      };
      break;

    default:
      response = {
        webWidth: offsetWidth,
        webHeight: offsetWidth
      };
      break;
  }
  return response;
};

const getMediaDimension = (blobUrl, mediaType) => {
  return new Promise((resolve) => {
    if (mediaType === "image") {
      const image = new Image();
      image.onload = function () {
        const { naturalWidth: width, naturalHeight: height } = this;
        resolve(calculateWidthAndHeight(width, height));
      };

      image.src = blobUrl;
    } else {
      const video = document.createElement("video");
      video.addEventListener(
        "loadedmetadata",
        () => {
          const { videoWidth: width, videoHeight: height } = video;
          resolve(calculateWidthAndHeight(width, height));
        },
        false
      );
      video.src = blobUrl;
    }
  });
};

export const stripTags = (dirtyString) => {
  const container = document.createElement("div"),
    text = document.createTextNode(dirtyString);
  container.appendChild(text);
  return container.innerHTML;
};

export const getMessageObjSender = async (dataObj, idx) => {
  const { jid, msgType, userProfile, msgId, chatType, message = "", file, fileOptions = {}, replyTo, fileDetails } = dataObj;

  const timestamp = Date.now() * 1000;
  const senderId = userProfile.data.fromUser;
  const msgBody = {
    message_type: msgType,
    nickName: userProfile.data.nickName,
    ...(replyTo && { replyTo })
  };

  if (msgType === "text") {
    msgBody.message = stripTags(message);
  } else {
    let webWidth = 0,
      webHeight = 0,
      androidWidth = 0,
      androidHeight = 0,
      originalWidth = 0,
      originalHeight = 0;

    if (msgType === "image") {
      let mediaFileURL = fileOptions.blobUrl;
      const mediaDimension = await getMediaDimension(mediaFileURL, msgType);
      ({ webWidth, webHeight, androidWidth, androidHeight } = mediaDimension);
    } else if (msgType === "video") {
      ({ webWidth, webHeight, androidWidth, androidHeight, originalWidth, originalHeight } = fileDetails);
    }

    msgBody.media = {
      file,
      caption: fileOptions.caption || "",
      duration: fileOptions.duration || 0,
      fileName: fileOptions.fileName,
      file_size: fileOptions.fileSize,
      file_url: fileOptions.blobUrl,
      is_downloaded: 0,
      is_uploading: idx === 0 ? 1 : 0,
      local_path: "",
      thumb_image: fileOptions.thumbImage,
      webWidth: webWidth,
      webHeight: webHeight,
      androidWidth: androidWidth,
      androidHeight: androidHeight,
      originalWidth,
      originalHeight,
      audioType:fileOptions.audioType
    };
  }

  return {
    chatType: chatType,
    createdAt: changeTimeFormat(timestamp),
    deleteStatus: 0,
    favouriteBy: "0",
    favouriteStatus: 0,
    fromUserId: senderId,
    fromUserJid: formatUserIdToJid(senderId, chatType),
    msgBody: msgBody,
    msgId: msgId,
    msgStatus: 3,
    timestamp: timestamp,
    msgType: MSG_PROCESSING_STATUS,
    publisherId: senderId,
    publisherJid: formatUserIdToJid(senderId),
    ...(isGroupChat(chatType) && {
      fromUserId: getUserIdFromJid(jid),
      fromUserJid: jid
    })
  };
};

export const getMessageObjReceiver = (messgeObject, newChatTo) => {
  const { msgType, msgBody, chatType, msgId, publisherId, publisherJid, profileUpdatedStatus, msgStatus } =
    messgeObject;
  const timestamp = Date.now() * 1000;
  return {
    chatType: chatType,
    createdAt: changeTimeFormat(timestamp),
    deleteStatus: 0,
    favouriteBy: "0",
    favouriteStatus: 0,
    fromUserId: newChatTo,
    fromUserJid: formatUserIdToJid(newChatTo, chatType),
    msgBody: msgBody,
    msgId: msgId,
    msgStatus: msgType === MSG_SENT_STATUS_CARBON ? msgStatus : 1,
    timestamp: timestamp,
    publisherId,
    publisherJid,
    ...(msgType === GROUP_CHAT_PROFILE_UPDATED_NOTIFY && {
      profileUpdatedStatus,
      msgType,
      userId: messgeObject.userId,
      userJid: messgeObject.userJid,
      // Should have the unique msgId for all the messages. But for 'profileUpdate' not receiving the msgId
      // that's why here we give the msgId manually
      msgId: messgeObject.msgId || (messgeObject.timestamp && messgeObject.timestamp.toString()) || uuidv4()
    })
  };
};

export const getRecentChatMsgObj = (dataObj) => {
  const { jid, msgType, userProfile, msgId, chatType, message = "", fileOptions = {} } = dataObj;

  const createdAt = changeTimeFormat(Date.now() * 1000)
  const senderId = userProfile.data.fromUser;
  const msgBody = {
    message_type: msgType,
    nickName: userProfile.data.nickName
  };

  if (msgType === "text") {
    msgBody.message = stripTags(message);
  } else {
    msgBody.media = {
      caption: fileOptions.caption || "",
      duration: fileOptions.duration || 0,
      fileName: fileOptions.fileName,
      file_size: fileOptions.fileSize,
      file_url: fileOptions.blobUrl,
      is_downloaded: 0,
      is_uploading: 1,
      local_path: "",
      thumb_image: fileOptions.thumbImage,
      audioType:fileOptions.audioType
    };
  }
  const fromUserId = getUserIdFromJid(jid);
  const getMute = getFromLocalStorageAndDecrypt("tempMuteUser");
  let parserLocalStorage = getMute ? JSON.parse(getMute) : {};
  const isMuted = parserLocalStorage[fromUserId] ? 1 : 0;
  if (isMuted){
    setTimeout(( ) =>  SDK.updateMuteNotification(jid, true), 1000);
  }

  return {
    chatType: chatType,
    createdAt: createdAt,
    deleteStatus: 0,
    fromUserId: fromUserId,
    msgBody: msgBody,
    msgId: msgId,
    msgStatus: 3,
    muteStatus: isMuted,
    msgType: msgType,
    notificationTo: "",
    publisherId: senderId,
    timestamp: new Date(createdAt).getTime(),
    toUserId: fromUserId,
    unreadCount: 0,
    filterBy: fromUserId
  };
};

export const fileToBlob = async (file) => new Blob([new Uint8Array(await file.arrayBuffer())], { type: file.type });

export const millisToMinutesAndSeconds = (millis) => {
  let minutes = Math.floor(millis / 60000);
  let seconds = parseInt((millis % 60000) / 1000);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
};

export const getDbInstanceName = (type) => {
  let instance = "";
  switch (type) {
    case "image":
      instance = CHAT_IMAGES;
      break;

    case "audio":
      instance = CHAT_AUDIOS;
      break;

    default:
      break;
  }
  return instance;
};

export const retrieveMediaDimension = async (width, height, mediaUrl, msgType) => {
  if (width && width !== 0 && height && height !== 0) {
    return { width: `${width}px`, height: `${height}px` };
  } else {
    let webWidth = 0,
      webHeight = 0;

    const mediaDimension = await getMediaDimension(mediaUrl, msgType);
    ({ webWidth, webHeight } = mediaDimension);
    return { width: `${webWidth}px`, height: `${webHeight}px` };
  }
};

/**
 * return the valid search value for given value
 * @param {string} value
 */
export const getValidSearchVal = (value) => {
  if (!value || typeof value != "string") return value;
  // To Escape the Special Characters in Search to Avoid issue in Regex
  value = value.replace(/[\-\[&\/\\#,+()|$^~%.'":*?<>{}]/g, "\\$&");
  return value.trim();
};

export const getGroupMsgStatus = (participants) => {
  const receiveToAll = participants.find((participant) => participant.msgStatus === 1);
  if (receiveToAll) return 1;

  const seenToAll = participants.find((participant) => participant.msgStatus === 2);
  if (seenToAll) return 2;

  return 0;
};

export const isAppOnline = () => {
  const appOnlineStatus = Store.getState().appOnlineStatus;
  return !!(appOnlineStatus && appOnlineStatus.isOnline);
};

export const blockOfflineAction = (msg = null) => {
  if (!isAppOnline()) {
    msg = msg || "Please check your Internet connection";
    toastr.clear();
    toastr.warning(msg);
    return true;
  }
  return false;
};

export const blockOfflineMsgAction = () => {
  return blockOfflineAction();
};

export const getThumbBase64URL = (thumb) => `data:image/png;base64,${thumb}`;

/**
 * Return TRUE If given 'state' variable value is match with local connection state.
 * Otherwise return FALSE.
 * @param {*} state
 */
export const isConnStateEqualTo = (state, test) => {
  if (!state) return false;
  const connectionState = Store.getState()?.ConnectionStateData?.data;
  state = Array.isArray(state) ? state : [state];
  return state.indexOf(connectionState) > -1;
};

export const capitalizeTxt = (txt) => txt.charAt(0).toUpperCase() + txt.slice(1);

/**
 * dataURLtoFile() to convert base64 to file.
 */
export const dataURLtoFile = (dataurl, filename) => {
  var dataarr = dataurl.split(','), mime = dataarr[0].match(/:(.*?);/)[1],
      bstr = atob(dataarr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  //NOSONAR
  while (n--) {
      const charbuffer = bstr.charCodeAt(n);
      u8arr[n] = charbuffer;
  }
  let blob = new Blob([u8arr], { type: mime });
  blob['lastModifiedDate'] = new Date();
  blob['name'] = filename;
  return blob;
}

export const getEmojiStyle = () => {
  return {
    position: "absolute",
    bottom: 10,
    right: 0,
    cssFloat: "right",
    marginLeft: "200px"
  }
}

export const getMediaClassName = (dropDownStatus, isSender, forward, msgStatus, isChecked) => {
  return `${dropDownStatus ? "settop " : ""} ${isSender ? "sender-row" : "receiver-row"} ${
    forward && msgStatus !== 3 ? "forwardSelect" : ""
  } ${isChecked && forward ? "messageSelected" : ""} `;
};

export const getMessageObjForward = (originalMsg, toJid, newMsgId) => {
  const timestamp = Date.now() * 1000;
  const vcardData = getLocalUserDetails();
  const senderId = vcardData.fromUser;
  
  return {
    ...originalMsg,
    timestamp,
    createdAt: changeTimeFormat(timestamp),
    msgStatus: 3,
    msgType: "processing",
    msgId: newMsgId,
    fromUserJid: formatUserIdToJid(senderId),
    fromUserId: senderId,
    chatType: isSingleChatJID(toJid) ? CHAT_TYPE_SINGLE: CHAT_TYPE_GROUP,
    publisherId: senderId,
    publisherJid: formatUserIdToJid(senderId),
    deleteStatus: 0,
    favouriteBy: "0",
    favouriteStatus: 0,
    msgBody: {
      ...originalMsg.msgBody,
      replyTo:"",
      translatedMessage:"",
      media: {
        ...originalMsg.msgBody.media,
        is_uploading: 8,
        caption: ""
      }
    },
  };
};

export const getRecentChatMsgObjForward = (originalMsg, toJid, newMsgId) => {
  const createdAt = changeTimeFormat(Date.now() * 1000)
  const vcardData = getLocalUserDetails();
  const senderId = vcardData.fromUser;

  return {
    ...originalMsg,
    timestamp: new Date(createdAt).getTime(),
    createdAt: createdAt,
    msgStatus: 3,
    msgId: newMsgId,
    fromUserJid: toJid,
    fromUserId: getUserIdFromJid(toJid),
    chatType: isSingleChatJID(toJid) ? CHAT_TYPE_SINGLE: CHAT_TYPE_GROUP,
    publisherId: senderId,
    deleteStatus: 0,
    notificationTo: "",
    toUserId: getUserIdFromJid(toJid),
    unreadCount: 0,
    filterBy: getUserIdFromJid(toJid),
    msgType: originalMsg?.msgBody?.message_type,
    favouriteBy: "0",
    favouriteStatus: 0,
    msgBody: {
      ...originalMsg.msgBody,
      media: {
        ...originalMsg.msgBody.media,
        caption: ""
      }
    },
  };
};

export const getHashCode = (s) => {
  for(var i = 0, h = 0; i < s.length; i++)
      h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return h;
}

export const getColorCodeInitials = (name) => {
  if (name) {
    const hashCode = getHashCode(name);
    const code = hashCode % INITIALS_COLOR_CODES.length;
    return INITIALS_COLOR_CODES[Math.abs(code)]
  }
  return "#0376da";
}

export const getInitialsFromName = (name = "") => {
  let acronym, matches = [];
  if(!name) return null;
  if(name.match(/\b(\w)/g) && name.match(/\b(\w)/g).length === 1){
    matches = name.split("");
    acronym = [matches[0],matches[1]].join('');
  }
  else {
    matches = name.match(/\b(\w)/g);
    acronym = matches ? [matches[0],matches[1]].join('') : "";
  }
  return acronym && acronym.toUpperCase();
};

export const isBlobUrl = (fileToken) => new RegExp("^(blob:http|blob:https)://", "i").test(fileToken);

export const getLocalWebsettings = () => {
  const webSettings = getFromLocalStorageAndDecrypt('websettings')
  return webSettings ? JSON.parse(webSettings) : {}
}

export const setLocalWebsettings = (key, value) => {
  const webSettings = getFromLocalStorageAndDecrypt('websettings');
  let parserLocalStorage = webSettings ? JSON.parse(webSettings) : {}
  const constructObject = {
    ...parserLocalStorage,
    [key]: value
  }
  encryptAndStoreInLocalStorage('websettings', JSON.stringify(constructObject));
}
export const isTranslateEnabled = () => {
    const settings = getLocalWebsettings();
    return settings?.translate === true ? true : false;
  };

export const getTranslateTargetLanguage = () => {
  const settings = getLocalWebsettings();
  return settings?.translateLang || "";
}

export const getArchiveSetting = () => {
  const settings = getLocalWebsettings();
  return settings?.archive || false;
}

export const getRecentChatItem = (fromUserId) => {
  const { recentChatData: { rosterData: { recentChatItems = [] } = {} } = {} } = Store.getState() || {};
  return recentChatItems.find((ele) => ele.recent?.fromUserId === fromUserId);
}    

export const sendNotification = (displayName = "", imageUrl = "", messageBody = "", fromUser = "") => {
  try {

    let userAgent = window.navigator.userAgent.toLowerCase(),
    macosPlatforms = /(macintosh|macintel|macppc|mac68k|macos)/i,
    windowsPlatforms = /(win32|win64|windows|wince)/i,
    iosPlatforms = /(iphone|ipad|ipod)/i,
    os = null;

    Push.clear();
    const sound = new Audio("sounds/notification.mp3")
    const updateDisplayName = displayName ? displayName.toString() : "";

    if (macosPlatforms.test(userAgent)) {
      os = "macos";
    } else if (iosPlatforms.test(userAgent)) {
      os = "ios";
    } else if (windowsPlatforms.test(userAgent)) {
      os = "windows";
    } else if (/android/.test(userAgent)) {
      os = "android";
    } else if (!os && /linux/.test(userAgent)) {
      os = "linux";
    }

    Push.create(updateDisplayName, {
      body: handleMessageParseHtml(messageBody),
      ...{ icon: imageUrl ? imageUrl : "" },
      timeout: 8000,
      tag: JSON.stringify({fromUserId: fromUser}),
      onClick: (e) => {
        window.focus();
        const recentChat = getRecentChatItem(fromUser);
        const { recent: { chatType, fromUserId } = {} } = recentChat;
        if (chatType && fromUserId) {
          recentChat.chatType = chatType;
          recentChat.chatId = fromUserId;
          recentChat.chatJid = formatUserIdToJid(fromUserId, chatType);
          Store.dispatch(callIntermediateScreen({ hideCallScreen: true }));
          Store.dispatch(UnreadCountDelete({ fromUserId }));
          Store.dispatch(ActiveChatAction(recentChat));
        }
      }
    });


    if(os === 'windows'){
      var windowisChrome = !window.chrome && (!window.chrome.webstore || !window.chrome.runtime);
      if(windowisChrome){
        return true;
      }
    }else {
      return sound.play();
    }

  } catch (error) {
    console.log("sendNotification Error :>> ", error);
  }
};

export const validEmail = (email = "") => {
  const regex = /^\s*([\w+-]+\.)*[\w+]+@([\w+-]+\.)*([\w+-]+\.[a-zA-Z]{2,6})+\s*$/;
  return regex.test(email);
}

export const isSandboxMode = () => {
  return (
    REACT_APP_SANDBOX_MODE === "true" ||
    REACT_APP_XMPP_SOCKET_HOST === "xmpp-preprod-sandbox.mirrorfly.com" ||
    REACT_APP_XMPP_SOCKET_HOST === "xmpp-sandbox-dev.mirrorfly.com"
  );
};

export const getInitializeObj = () => ({
  apiBaseUrl: REACT_APP_API_URL,
  callbackListeners: callbacks,
  licenseKey: REACT_APP_LICENSE_KEY,
  isSandbox: isSandboxMode(),
});

export const getSiteDomain = () => REACT_APP_SITE_DOMAIN || window.location.hostname;

export const getCallFullLink = (callLink) => `${getSiteDomain()}/${callLink}`;

export const isCallLink = (link) => {
  if (!validURL(link) && process.env.NODE_ENV !== "development") return false;
  if (!link.includes(getSiteDomain())) return false;
  const splittedLink = link.split(`${getSiteDomain()}`);
  const callLinkRegex = /\/([0-9a-z]{3})-([0-9a-z]{4})-([0-9a-z]{3})$/gm;
  return splittedLink.length > 1 && callLinkRegex.test(splittedLink[1]);
};

export const isBoxedLayoutEnabled = () => {
  const settings = getLocalWebsettings();
  let boxLayout;
  if (settings && settings?.boxLayout === undefined) {
    boxLayout = true;
    setLocalWebsettings("boxLayout", true);
  } else {
    boxLayout = settings?.boxLayout
  }
  return boxLayout === true && config.boxLayout;
};

export const getGridDimensions = (height, usersCount) => {
  let isMobile = window.innerWidth < 768 ?  true : false
  let width = 0;
  switch (true) {
    case isMobile && usersCount <= 2:
      width = 90 * .80;
      height = 90 * .80 < ( height / 2 ) ? width : height / 2;
      break;
      case isMobile && usersCount <= 4:
      width = 50;
      height = 50 < ( height / 2 ) ? width : height / 2;
      break;
    case usersCount <= 2:
      width = 50;
      height = height * .80;
      break;

    case usersCount <= 4:
      width = 50;
      height = height / 2;
      break;

    case usersCount % 2 === 0:
      width = 100 / (usersCount / 2)
      height = height /2;
      break;
  
    default:
      width = 100 / (((usersCount - 1) / 2) + 1)
      height = height /2;
      break;
  }

  // width = width - 4;
  height = height - 10;
  return { width, height };
};

export const getAutomationLoginCredentials = () => {
  let staticCredential = {};
  if (typeof InstallTrigger !== "undefined") {
    // For Firefox
    staticCredential = {
      username: REACT_APP_AUTOMATION_FIREFOX_USER,
      password: REACT_APP_AUTOMATION_FIREFOX_PASS
    };
  } else {
    if (/Edg/.test(navigator.userAgent)) {
      staticCredential = {
        username: REACT_APP_AUTOMATION_EDGE_USER,
        password: REACT_APP_AUTOMATION_EDGE_PASS
      };
    } else {
      staticCredential = {
        username: REACT_APP_AUTOMATION_CHROME_USER,
        password: REACT_APP_AUTOMATION_CHROME_PASS
      };
    }
  }
  return staticCredential;
};

export const handleFilterBlockedContact = (rosterData) => {
  let data = rosterData.filter(function (item) {
    return item.isAdminBlocked !== true;
  });
  return data;
}

const deleteAllIndexedDb = async() => {
  window.indexedDB.deleteDatabase("mirrorflydb");
}

export const shouldHideNotification = () => REACT_APP_HIDE_NOTIFICATION_CONTENT === "true";

let recorder = null;
export const setRecorder = (recorderNew) => {
  recorder = recorderNew;
}

export const stopRecorder = () => {
  if (recorder != null) {
    recorder.stop();
    encryptAndStoreInLocalStorage("recordingStatus", true);
  }
}
