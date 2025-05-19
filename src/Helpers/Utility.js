import React from "react";
import uuidv4 from "uuid/v4";
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
  INITIALS_COLOR_CODES,
  NO_INTERNET
} from "./Constants";
import { getExtension } from "../Components/WebChat/Common/FileUploadValidation";
import { REACT_APP_LICENSE_KEY, REACT_APP_SITE_DOMAIN, REACT_APP_AUTOMATION_CHROME_USER, REACT_APP_AUTOMATION_CHROME_PASS, REACT_APP_AUTOMATION_EDGE_USER, REACT_APP_AUTOMATION_FIREFOX_USER, REACT_APP_AUTOMATION_FIREFOX_PASS, REACT_APP_AUTOMATION_EDGE_PASS, REACT_APP_HIDE_NOTIFICATION_CONTENT } from "../Components/processENV";
import Store from "../Store";
import { getContactNameFromRoster, formatUserIdToJid, isSingleChatJID, getLocalUserDetails, handleMentionedUser, getDataFromRoster } from "./Chat/User";
import { MSG_PROCESSING_STATUS, GROUP_CHAT_PROFILE_UPDATED_NOTIFY, MSG_SENT_STATUS_CARBON, CHAT_TYPE_SINGLE, CHAT_TYPE_GROUP, SERVER_LOGOUT } from "./Chat/Constant";
import toastr from "toastr";
import { isGroupChat, removeTempMute, setTempMute } from "./Chat/ChatHelper";
import Push from "push.js";
import { callbacks } from "../Components/callbacks";
import config from "../config";
import { ActiveChatAction, updateMuteStatusRecentChat } from "../Actions/RecentChatActions";
import { UnreadCountDelete } from "../Actions/UnreadCount"
import { callIntermediateScreen } from "../Actions/CallAction";
import { getFromLocalStorageAndDecrypt, encryptAndStoreInLocalStorage} from "../Components/WebChat/WebChatEncryptDecrypt";
import userList from "../Components/WebChat/RecentChat/userList";
import { SettingsDataAction } from "../Actions/SettingsAction";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { toast } from "react-toastify";

const HtmlToReactParser = require('html-to-react').Parser;
const htmlToReactParser = new HtmlToReactParser();

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
  let obj = Object.assign({}, inputObj);
  for (let i in obj) {
    switch (true) {
      case String(obj[i]).toLowerCase() === "true":
        obj[i] = true;
        break;
      case String(obj[i]).toLowerCase() === "false":
        obj[i] = false;
        break;
      case String(obj[i]).match(/^\d+$/) != null:
        obj[i] = parseInt(obj[i], 10);
        break;
      case String(obj[i]).match(/^[-+]?\d+\.\d+$/) != null:
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
    separator: /[\/,?.+]/ // separate by spaces, including preceding commas and periods
  });
};

/**
 * To check the valid url.
 */
export const validURL = (str) => {
  if (str === "" || str === null || str === undefined) {
    return false;
  }
    const protocol = '(?:(?:https?|ftp):\\/\\/)?';
    const ipV4 = '(?:(?!(?:10|127)(?:\\.\\d{1,3}){3})(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4])))';
    const domainName = '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))';
    const port = '(?::\\d{2,5})?';
    const path = '(?:\\/\\S*)?';
    const pattern = new RegExp(`${protocol}(?:${ipV4}|${domainName})${port}${path}$`);
    // fragment locator
    return pattern.test(str);
};

export const isUrl = (s) => {
  const regexp = /^(ftp|https?):\/\/[\w#!:.?+=&%@\-\/]+$/;
  return regexp.test(s);
};

export const validURLCheck = (str) => {
  const regexp = /^(ftp|https?):\/\/[\w#!:.?+=&%@\-\/]+$/;
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
  higlight = higlight.replace(/\\/g, "").trim();
  let parts = name.split(new RegExp(`(${escapeRegex(higlight)})`, "gi"));
  return parts.map((part, i) => {
    let index = i;
    return (
      <span key={index} style={part.toLowerCase() === higlight.toLowerCase() ? { color: "#4879F9" } : {}}>
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
    return contactsWhoBlockedMe.indexOf(jid) <= -1;
  }
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

export const placeCaretAtEnd = (el) => {
  if (!el) {
    return;
  }
  el.focus();
  if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } else if (typeof document.body.createTextRange != "undefined") {
    const textRange = document.body.createTextRange();
    textRange.moveToElementText(el);
    textRange.collapse(false);
    textRange.select();
  }
};

export const captionLink = (text, mentionedUserId, userId, chatType) => {
  if (!text) return "";
  const regex = /<span\s[^>]*>@([^<]+)<\/span>/g;
  text = text.replace(regex, "@[?]");
  return htmlToReactParser.parse(handleMentionedUser(getFormattedText(text), mentionedUserId, userId, null, chatType));
};

/**
 * logout() Method to call the SDK.logout() and removed the localstorage values. <br />
 * Window.location.reload() function performed.
 */
export const logout = async(type = "") => {
  if(isAppOnline()){
    await SDK.logout();
    localStorage.clear();
    await deleteAllIndexedDb();
    if (type === "accountDeleted") {
      encryptAndStoreInLocalStorage("deleteAccount", true);
      // deleteItemFromLocalStorage("getuserprofile")
    }
    if (type === SERVER_LOGOUT) {
      encryptAndStoreInLocalStorage("serverLogout", type);
    }
    if (type !== "block") {
      window.location.reload();
    }
  } else {
    toastr.warning(NO_INTERNET);
  }
};

export const formatCallLogDate = (date) => {
  const datesDiff = daysBetween(new Date(), new Date(date));
  if (datesDiff === null || datesDiff === undefined ||  Number.isNaN(datesDiff)) {
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
  let one = new Date(first.getFullYear(), first.getMonth(), first.getDate());
  let two = new Date(second.getFullYear(), second.getMonth(), second.getDate());
  // Do the math.
  let millisecondsPerDay = 1000 * 60 * 60 * 24;
  let millisBetween = two.getTime() - one.getTime();
  let days = millisBetween / millisecondsPerDay;
  // Round down.
  return Math.floor(days);
}

export const formatCallLogTime = (date) => {
  const dateMessage = DateTime.fromMillis(date / 1000);
  return dateMessage.toFormat(TIME_FORMAT);
};

export const durationCallLog = (startDate, endDate) => {
  let ms = endDate / 1000 - startDate / 1000;
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
  return new Promise((resolve, reject) => {
    if (mediaType === "image") {
      const image = new Image();
      image.onload = function () {
        const { naturalWidth: width, naturalHeight: height } = this;
        resolve(calculateWidthAndHeight(width, height));
      };
      image.onerror = (error) => {
        console.error("Error loading image:", error);
        resolve(calculateWidthAndHeight(0, 0));
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
      video.addEventListener("error", (event) => {
        console.error("Error loading video:", event);
        resolve(calculateWidthAndHeight(0, 0));
      });
    }
  });
};

export const stripTags = (dirtyString) => {
  const container = document.createElement("div"),
    text = document.createTextNode(dirtyString);
  container.appendChild(text);
  return container.innerHTML;
};

//Handled edited message in conversation messages
export const getMessageObjEdited = async (dataObj, storeData) => {
  const { jid, msgType, userProfile, chatType, message = "", file, fileOptions = {}, replyTo, mentionedUsersIds, meet, editMessageId} = dataObj;
  const senderId = userProfile.data.fromUser;
  const msgBody = {
    message_type: msgType,
    nickName: userProfile.data.nickName,
    ...(replyTo && { replyTo }),
    mentionedUsersIds: mentionedUsersIds,
  };
  
  const chatId = jid.split('@');
  const timestamp = storeData[chatId[0]]?.messages[editMessageId]?.timestamp;
  const deleteStatus = storeData[chatId[0]]?.messages[editMessageId]?.deleteStatus;
  const favouriteBy = storeData[chatId[0]]?.messages[editMessageId]?.favouriteBy;
  const favouriteStatus = storeData[chatId[0]]?.messages[editMessageId]?.favouriteStatus;
  const thumbImage = storeData[chatId[0]]?.messages[editMessageId]?.msgBody?.media?.thumb_image;
  const fileUrl = storeData[chatId[0]]?.messages[editMessageId]?.msgBody?.media?.file_url;

  if (msgType === "text") {
    msgBody.message = stripTags(message);
  } else if (msgType === "meet") {
    msgBody.message = stripTags(message);
    msgBody.meet = meet;
  } else {
    let webWidth = 0,
      webHeight = 0,
      androidWidth = 0,
      androidHeight = 0,
      originalWidth = 0,
      originalHeight = 0;
    const media = storeData[chatId[0]]?.messages[editMessageId]?.msgBody?.media || {};
    const is_downloaded = media?.is_downloaded;
    const is_uploading = media?.is_uploading;
    const local_path = media?.local_path;

    if (msgType === "image") {
      ({ webWidth, webHeight, androidWidth, androidHeight } = media);
    } else if (msgType === "video") {
      ({ webWidth, webHeight, androidWidth, androidHeight, originalWidth, originalHeight } = media);
    }
    msgBody.message = "";
    msgBody.media = {
      file,
      androidWidth: androidWidth,
      androidHeight: androidHeight,
      audioType: fileOptions?.audioType,
      caption: fileOptions?.caption || "",
      duration: fileOptions?.duration || 0,
      fileName: fileOptions?.fileName || "",
      file_size: fileOptions?.fileSize || 0,
      file_url: fileUrl || "",
      is_downloaded: is_downloaded,
      is_uploading: is_uploading,
      local_path: local_path || "",
      thumb_image: thumbImage || "",
      webWidth: webWidth,
      webHeight: webHeight,
      originalWidth,
      originalHeight,
    };
  }

  return {
    chatType: chatType,
    createdAt: changeTimeFormat(timestamp),
    deleteStatus: deleteStatus,
    favouriteBy: favouriteBy,
    favouriteStatus: favouriteStatus,
    fromUserId: senderId,
    fromUserJid: formatUserIdToJid(senderId, chatType),
    msgBody: msgBody,
    msgId: editMessageId,
    editedStatus: 1,
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

export const getMessageObjSender = async (dataObj, idx) => {
  const { jid, msgType, userProfile, msgId, chatType, message = "", file, fileOptions = {}, replyTo, fileDetails, mentionedUsersIds, meet} = dataObj;
  const timestamp = Date.now() * 1000;
  const senderId = userProfile.data.fromUser;
  const msgBody = {
    message_type: msgType,
    nickName: userProfile.data.nickName,
    ...(replyTo && { replyTo }),
    mentionedUsersIds: mentionedUsersIds
  };

  if (msgType === "text") {
    msgBody.message = stripTags(message);
  } 
  else if(msgType === "meet"){
    msgBody.message = stripTags(message);
    msgBody.meet = meet;
  }
  else {
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
    msgBody.message = "";
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
    editedStatus: 0,
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

//Handled edited messges in received conversation messages
export const getMessageObjReceiverEdited = (messgeObject, newChatTo, conversationStore) => {
  const { msgType, msgStatus, msgBody, chatType, msgId, publisherId, fromUserId, publisherJid, profileUpdatedStatus, timestamp, editedStatus } =
    messgeObject;
  
  const conversationHistory = conversationStore;
  const chatId = msgType === "carbonSentMessage" ? newChatTo : fromUserId;
  const createdAt = conversationHistory[chatId]?.messages[msgId]?.createdAt;
  const timestampOriginal = conversationHistory[chatId]?.messages[msgId]?.timestamp;
  const deleteStatus = conversationHistory[chatId]?.messages[msgId]?.deleteStatus;
  const favouriteBy = conversationHistory[chatId]?.messages[msgId]?.favouriteBy;
  const favouriteStatus = conversationHistory[chatId]?.messages[msgId]?.favouriteStatus;


  return {
    chatType: chatType,
    createdAt: createdAt,
    deleteStatus: deleteStatus || 0,
    editedStatus: editedStatus,
    favouriteBy: favouriteBy || "0",
    favouriteStatus: favouriteStatus || 0,
    fromUserId: fromUserId,
    fromUserJid: formatUserIdToJid(fromUserId, chatType),
    msgBody: msgBody,
    msgId: msgId,
    msgStatus: msgType === MSG_SENT_STATUS_CARBON ? msgStatus : 1,
    timestamp: timestampOriginal || timestamp,
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

export const getMessageObjReceiver = (messgeObject, newChatTo) => {
  const { msgType, msgBody, chatType, msgId, publisherId, publisherJid, profileUpdatedStatus, msgStatus } =
    messgeObject;
  const timestamp = Date.now() * 1000;
  return {
    chatType: chatType,
    createdAt: changeTimeFormat(timestamp),
    deleteStatus: 0,
    editedStatus: 0,
    favouriteBy: "0",
    favouriteStatus: 0,
    fromUserId: newChatTo,
    fromUserJid: formatUserIdToJid(newChatTo, chatType),
    msgBody: msgBody,
    msgId: msgId,
    msgStatus: msgStatus,
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

//Handled Edited message object for RecentChat
export const getRecentMsgObjEdited = (dataObj, storeData) => {
  const { jid, msgType, userProfile, chatType, message = "", fileOptions = {}, mentionedUsersIds, meet, editMessageId = "" } = dataObj;
  const fromUserId = getUserIdFromJid(jid);
  const matchingObject = storeData.find(obj => obj.fromUserId === fromUserId);
  const mappedResult = storeData.some((messageObject) => editMessageId === messageObject.msgId);
  if (!mappedResult) { 
    return {};
  } else {
    const senderId = userProfile.data.fromUser;
    const msgBody = {
      message_type: msgType,
      nickName: userProfile.data.nickName,
      mentionedUsersIds: mentionedUsersIds,
    };

    const createdAt = matchingObject.createdAt;
    const timestamp = matchingObject.timestamp;
    const deleteStatus = matchingObject.deleteStatus;
    const unreadCount = matchingObject.unreadCount;
    const thumbImage = matchingObject.thumb_image;
    const fileUrl = matchingObject.file_url;

    if (msgType === "text") {
      msgBody.message = stripTags(message);
    } else if (msgType === "meet") {
      msgBody.message = stripTags(message);
      msgBody.meet = meet;
    } else {
      msgBody.media = {
        audioType: fileOptions.audioType,
        caption: fileOptions.caption || "",
        duration: fileOptions.duration || 0,
        fileName: fileOptions.fileName || "",
        file_size: fileOptions.fileSize || 0,
        file_url: fileUrl || "",
        is_downloaded: 0,
        is_uploading: 1,
        local_path: "",
        thumb_image: thumbImage || "",
      };
    }
    const getMute = getFromLocalStorageAndDecrypt("tempMuteUser");
    let parserLocalStorage = getMute ? JSON.parse(getMute) : {};
    const isMuted =
      (parserLocalStorage[fromUserId] && parserLocalStorage[fromUserId].isMuted ? 1 : 0) || getMuteStatus(fromUserId);

    return {
      chatType: chatType,
      createdAt: createdAt,
      editedStatus: 1,
      deleteStatus: deleteStatus,
      fromUserId: fromUserId,
      msgBody: msgBody,
      msgId: editMessageId,
      msgStatus: 3,
      muteStatus: isMuted,
      msgType: msgType,
      notificationTo: "",
      publisherId: senderId,
      timestamp: timestamp,
      toUserId: fromUserId,
      unreadCount: unreadCount,
      filterBy: fromUserId
    };
  }
};

export const getRecentChatMsgObj = (dataObj) => {
  const { jid, msgType, userProfile, msgId, chatType, message = "", fileOptions = {}, mentionedUsersIds, meet } = dataObj;

  const createdAt = changeTimeFormat(Date.now() * 1000)
  const senderId = userProfile.data.fromUser;
  const msgBody = {
    message_type: msgType,
    nickName: userProfile.data.nickName,
    mentionedUsersIds: mentionedUsersIds
  };

  if (msgType === "text") {
    msgBody.message = stripTags(message);
  } 
  else if(msgType === "meet"){
    msgBody.message = stripTags(message);
    msgBody.meet = meet;
  }
  else {
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
  const isMuted =
    (parserLocalStorage[fromUserId] && parserLocalStorage[fromUserId].isMuted ? 1 : 0) || getMuteStatus(fromUserId);

  return {
    chatType: chatType,
    createdAt: createdAt,
    deleteStatus: 0,
    fromUserId: fromUserId,
    msgBody: msgBody,
    msgId: msgId,
    editedStatus: 0,
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

export const getMuteStatus = (fromUserId) => {
  const recentChat = Store.getState().recentChatData.data.find((chat) => chat.fromUserId === fromUserId)?.muteStatus;
  const roster = getDataFromRoster(getUserIdFromJid(fromUserId))?.isMuted;
  return recentChat || roster || 0;
}

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

export const fetchMoreParticipantsData = (userLists, searchValue) => {
  let userListArr = userLists;
  let searchWith = getValidSearchVal(searchValue);
  userList.getUsersListFromSDK(Math.ceil((userListArr.length / 20) + 1), searchWith);
}

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

export const getThumbBase64URL = (thumb) => {
  if (thumb !== "" && thumb !== null) {
    return `data:image/png;base64,${thumb}`
  } else {
    return `data:image/png;base64,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`;
  }
};

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
  let dataarr = dataurl.split(','), mime = dataarr[0].match(/^data:(.*?);/),
      bstr = atob(dataarr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  //NOSONAR
  while (n--) {
      const charbuffer = bstr.charCodeAt(n);
      u8arr[n] = charbuffer;
  }
  let blob = new Blob([u8arr], { type: mime[1] });
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
    editedStatus: 0,
    favouriteBy: "0",
    favouriteStatus: 0,
    msgBody: {
      ...originalMsg.msgBody,
      replyTo:"",
      translatedMessage:"",
      media: {
        ...originalMsg.msgBody.media,
        is_uploading: 8
      }
    },
  };
};

export const getRecentChatMsgObjForward = (originalMsg, toJid, newMsgId, msdIdIndex) => {
  const createdAt = changeTimeFormat(Date.now() * 1000)
  const vcardData = getLocalUserDetails();
  const senderId = vcardData.fromUser;
  const timestamp = new Date(createdAt).getTime() + msdIdIndex;

  const fromUserId = getUserIdFromJid(toJid);
  const getMute = getFromLocalStorageAndDecrypt("tempMuteUser");
  let parserLocalStorage = getMute ? JSON.parse(getMute) : {};
  const isMuted =
    (parserLocalStorage[fromUserId] && parserLocalStorage[fromUserId].isMuted ? 1 : 0) || getMuteStatus(fromUserId);

  return {
    ...originalMsg,
    timestamp,
    createdAt: createdAt,
    msgStatus: 3,
    msgId: newMsgId,
    fromUserJid: toJid,
    fromUserId: getUserIdFromJid(toJid),
    chatType: isSingleChatJID(toJid) ? CHAT_TYPE_SINGLE : CHAT_TYPE_GROUP,
    publisherId: senderId,
    deleteStatus: 0,
    editedStatus: 0,
    notificationTo: "",
    muteStatus: isMuted,
    toUserId: getUserIdFromJid(toJid),
    unreadCount: 0,
    filterBy: getUserIdFromJid(toJid),
    msgType: originalMsg?.msgBody?.message_type,
    favouriteBy: "0",
    favouriteStatus: 0,
    msgBody: {
      ...originalMsg.msgBody,
      media: {
        ...originalMsg.msgBody.media
      }
    }
  };
};

export const getHashCode = (s) => {
  let h = 0;
  for(let i = 0; i < s.length; i++)
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
  if (containsOnlyEmojis(name)) {
    if (name.includes(" ")) {
      const wordsArray = name.split(" "); // Split by space
      acronym = [wordsArray[0].substring(0, 2), wordsArray[1].substring(0, 2)].join('');
    } else {
      acronym = name.length >= 4 ? name.substring(0, 4): name;
    }
    return acronym && acronym.toUpperCase();
  } else {
    name = removeEmojis(name);
  }

  if (containsOnlySpecialCharacters(name)) {
    if (name.includes(" ")) {
      const wordsArray = name.split(" "); // Split by space
      acronym = [wordsArray[0].substring(0, 1), wordsArray[1].substring(0, 1)].join('');
    } else {
      acronym = name.length >= 2 ? name.substring(0, 2): name;
    }
    return acronym && acronym.toUpperCase();
  } else {
    name = removeSpecialCharacters(name);
  }

  if(name.match(/\b(\w)/g) && name.match(/\b(\w)/g).length === 1){
    matches = name.split("");
    acronym = [matches[0],matches[1]].join('');
  } else {
    matches = name.match(/\b(\w)/g);
    acronym = matches ? [matches[0],matches[1]].join('') : "";
  }
  return acronym && acronym.toUpperCase();
};

const containsOnlyEmojis = (inputString) => {
  inputString = inputString.replace(/ /g, "");
  // Regular expression to match emojis
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1F004}-\u{1F0CF}\u{1F170}-\u{1F251}\u{2702}]/gu;
  // Use the regular expression to check if the string contains only emojis
  const matches = inputString.match(emojiRegex);
  // If matches exist and they cover the entire string length, it contains only emojis
  return matches !== null && matches.join('') === inputString;
}

const removeEmojis = (inputString) =>  {
  // Regular expression to match emojis
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1F004}-\u{1F0CF}\u{1F170}-\u{1F251}\u{2702}]/gu;
  // Use the replace method to replace emojis with the specified text
  const replacedString = inputString.replace(emojiRegex, "");
  return replacedString.trim();
}

const containsOnlySpecialCharacters = (inputString) => {
  inputString = inputString.replace(/ /g, "");
  // Regular expression to match special characters
  const specialCharacterRegex = /^[^a-zA-Z0-9\s]+$/;
  // Use test method to check if the string consists only of special characters
  return specialCharacterRegex.test(inputString);
}

const removeSpecialCharacters = (inputString) => {
  /// Regular expression to match special characters (excluding spaces)
  const specialCharacterRegex = /[^a-zA-Z0-9\s]/g;
  // Use the replace method to remove special characters
  const cleanedString = inputString.replace(specialCharacterRegex, "");
  return cleanedString.trim();
}

export const isBlobUrl = (fileToken) => /^(blob:http|blob:https):\/\//i.test(fileToken);

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


    if (os === 'windows') {
      const windowisChrome = (!window.chrome.webstore || !window.chrome.runtime) && !window.chrome;
      if (windowisChrome) {
        return true;
      }
    } else {
      return true;
    }

  } catch (error) {
    console.log("sendNotification Error :>> ", error);
  }
};

export const validEmail = (email = "") => {
  const regex = /^([_a-zA-Z0-9-!#$%&+]+(\.[_a-zA-Z0-9-!#$%&+]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,6})+)$/;
  return regex.test(email);
}

export const getInitializeObj = () => ({
  callbackListeners: callbacks,
  licenseKey: REACT_APP_LICENSE_KEY
});

export const getSiteDomain = () => REACT_APP_SITE_DOMAIN || window.location.hostname;

export const getCallFullLink = (callLink) => `${getSiteDomain()}/${callLink}`;

export const isCallLink = (link) => {
  if (!validURL(link) && process.env.NODE_ENV !== "development") return false;
  if (!link?.includes(getSiteDomain())) return false;
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

export const deleteAllIndexedDb = async() => {
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

export const handleScheduledTimeFormat = (scheduledTime) => {
  const scheduledDateTime = parseInt(scheduledTime, 10);
  const dateObject = new Date(scheduledDateTime);
  const optionsDate = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  const optionsTime = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // Use 12-hour format (true) or 24-hour format (false)
  };

  const dateString = dateObject.toLocaleString('en-US', optionsDate);
  const timeString = dateObject.toLocaleString('en-US', optionsTime);

  return `${dateString} ${timeString.replace(',', '')}`;
}

export const generateImageThumbnail = (file, fileExtension) =>
  new Promise((resolve, reject) => {
    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl); // Clean up object URL
        const width = img.width;
        const height = img.height;
        // Scale down the image if necessary
        const scaleFactor = calculateScaleFactor(width, height, 600);
        const scaledWidth = width * scaleFactor;
        const scaledHeight = height * scaleFactor;
        const canvas = document.createElement("canvas");
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
        const context = canvas.getContext("2d");
        context.drawImage(img, 0, 0, scaledWidth, scaledHeight);
        const imageType = `image/${fileExtension}`;
        const thumb = canvas.toDataURL(imageType, 0.9).replace(/^data:image\/\w+;base64,/, "");
        resolve(thumb);
      };
      img.src = objectUrl;
      img.onerror = (error) => {
        URL.revokeObjectURL(objectUrl); // Clean up object URL
        console.error("Error loading image:", error);
        reject(error);
      };
      
    } catch (error) {
      console.error("Thumbnail generation error:", error);
      resolve("");
    }
  });

// Helper function to calculate the scale factor
const calculateScaleFactor = (width, height, targetWidth) => {
  return targetWidth / width;
};

// Helper function to update the mute settings
export const updateMuteSettings = (isMuted) => {
  const isNotificationEnabled = !isMuted;
  const constructObject = {
    ["Notifications"]: isNotificationEnabled
  };
  Store.dispatch(SettingsDataAction(constructObject));
  setLocalWebsettings("Notifications", isNotificationEnabled);
};

export const updateMuteNotification = (data) => {
  if (data.isMuted) {
    setTempMute(data.fromUserId, true);
  } else {
    removeTempMute(data.fromUserId);
  }
};

export const updateMuteStatus = (data) => {
  const { fromUserJid = "" } = data;
  const userJids = fromUserJid.split(",");
  userJids.forEach((jid) => {
    const fromUserId = getUserIdFromJid(jid);
    const constructObject = {
      ...data,
      fromUserJid: jid,
      fromUserId,
      isMuted: data.isMuted
    };
    updateMuteNotification(constructObject);
    Store.dispatch(updateMuteStatusRecentChat(constructObject));
  });
};

export const loadFFMPEG = async () => {
  try {
    const ffmpeg = new FFmpeg({
      log: true
    });
    if (!ffmpeg.loaded) {
      await ffmpeg.load();
    }
    return ffmpeg;
  } catch (err) {
    console.log("loadFFMPEG", err);
  }
};

export const convertVideoFile = async (file) => {
  const ffmpeg = await loadFFMPEG();
  const inputName = file.name;
  const outputName = file.name.replace(/\.[^/.]+$/, ".mp4");
  const fileURL = URL.createObjectURL(file);
  const cleanUpFFmpeg = async () => {
    try {
      URL.revokeObjectURL(fileURL);
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch (e) {
      console.warn("FFmpeg cleanup error:", e);
    }
  };
  try {
    await ffmpeg.writeFile(inputName, await fetchFile(fileURL));
    await ffmpeg.exec(["-i", inputName, "-c", "copy", outputName]);
    const data = await ffmpeg.readFile(outputName);
    const convertedFile = new File([data.buffer], outputName, {
      type: "video/mp4",
      lastModified: file.lastModified
    });
    return convertedFile;
  } catch (err) {
    console.error("convertVideoFile error:", err);
    toast.error("Unable to convert the file");
  } finally {
    await cleanUpFFmpeg();
    ffmpeg.terminate();
  }
};