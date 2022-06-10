import moment from "moment";
import { isGroupChat } from "./ChatHelper";
import { getFormatPhoneNumber } from "../Utility";
import { MSG_PROCESSING_STATUS_ID, MSG_SENT_ACKNOWLEDGE_STATUS_ID,
  MSG_DELIVERED_STATUS_ID, MSG_SEEN_STATUS_ID, CHAT_TYPE_GROUP, GROUP_CREATED,
  GROUP_USER_ADDED, GROUP_USER_REMOVED, GROUP_USER_LEFT,
  GROUP_PROFILE_INFO_UPDATED, GROUP_USER_MADE_ADMIN } from './Constant';
import { isLocalUser, getContactNameFromRoster, getDataFromRoster } from "./User";
window.moment = moment;

export const sortBydate = (chatMessages) => {
  return chatMessages.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
};

export const sortBydatenewChat = (newMessages) => {
  return newMessages.sort((a, b) => {
    const { recent: firstchat } = a;
    const { recent: secondchat } = b;
    return new Date(secondchat.time.replace(/ /g, "T")).getTime() >
      new Date(firstchat.time.replace(/ /g, "T")).getTime()
      ? 1
      : -1;
  });
};

export const handleSplitUserId = (userId) => userId && userId.split("@").shift();

export const messageNotification = ["sentMessage", "carbonSentMessage", "carbonReceiveMessage", "receiveMessage"];

export const isRenderMessageType = (messageType) => {
  return (
    ["sentMessage", "carbonSentMessage", "carbonReceiveMessage", "receiveMessage", "carbonSentSeen"].indexOf(
      messageType
    ) === -1
  );
};

export const changeTimeFormat = (time) => {
  if(!time) return '';
  return moment((time / 1000000) * 1000)
    .utc()
    .format("YYYY-MM-DD HH:mm:ss");
};

export const timeFormat = (time) => {
  let offset = moment().utcOffset();
  return moment.utc(time).utcOffset(offset).format("MM/DD/YYYY [at] h:mm:ss A");
};

export const receiveNotification = ["delivered", "receive", "carbonDelivered"];

export const messageDeliveryStatus = {
  [MSG_SENT_ACKNOWLEDGE_STATUS_ID]: "user-status-sent",
  [MSG_DELIVERED_STATUS_ID]: "user-status-receive",
  [MSG_SEEN_STATUS_ID]: "user-status",
  [MSG_PROCESSING_STATUS_ID]: "msg-processing"
};

/**
 * keepin the order of the message delivery status
 * 3 - processing, 0 - sent, 1 - delivered to remote user, 2 - seen by remote user
 */
export const msgStatusOrder = [MSG_PROCESSING_STATUS_ID,MSG_SENT_ACKNOWLEDGE_STATUS_ID,MSG_DELIVERED_STATUS_ID,MSG_SEEN_STATUS_ID];

export const groupstatus = (publisherId, toUserId, status, roster, chatType = CHAT_TYPE_GROUP) => {
  var publisherName = getContactNameFromRoster(getDataFromRoster(publisherId)) || getFormatPhoneNumber(publisherId);
  var toUserName = getContactNameFromRoster(getDataFromRoster(toUserId)) || getFormatPhoneNumber(toUserId);
  const groupName = isGroupChat(chatType) ? "this group" : "broadcast";
  const isPublisherLocalUser = isLocalUser(publisherId);
  const isToUserLocalUser = isLocalUser(toUserId);
  let msgContent;
  if (status === GROUP_CREATED) {
    if (isPublisherLocalUser) {
      msgContent = "You created " + groupName;
    } else {
      msgContent = publisherName + " created " + groupName;
    }
  } else if (status === GROUP_USER_ADDED) {
    if (isPublisherLocalUser) {
      msgContent = "You added";
    } else {
      msgContent = publisherName + " added";
    }
    if (isToUserLocalUser) {
      if (!isPublisherLocalUser) {
        msgContent = msgContent + " you";
      } else {
        msgContent = "";
      }
    } else {
      msgContent = msgContent + " " + toUserName;
    }
  } else if (status === GROUP_USER_REMOVED || status === GROUP_USER_LEFT) {
    if (isPublisherLocalUser) {
      msgContent = "You ";
    } else {
      msgContent = publisherName;
    }
    if (isToUserLocalUser) {
      if (isPublisherLocalUser) {
        msgContent = msgContent + " left ";
      } else {
        msgContent = msgContent + " removed you";
      }
    } else {
      if (isPublisherLocalUser) {
        msgContent = msgContent + " removed " + toUserName;
      } else {
        if (toUserId === publisherId) {
          msgContent = msgContent + " left ";
        } else {
          msgContent = msgContent + " removed " + toUserName;
        }
      }
    }
  } else if (status === GROUP_PROFILE_INFO_UPDATED) {
    if (isPublisherLocalUser) {
      msgContent = "You updated " + groupName + " profile";
    } else {
      msgContent = publisherName + " updated " + groupName + " profile";
    }
  } else if (status === GROUP_USER_MADE_ADMIN) {
    if (isToUserLocalUser) {
      msgContent = "You are now an admin";
    } else {
      msgContent = toUserName + " is now an admin";
    }
  }
  return msgContent;
};

export const handleMessageParseHtml = (msg = "") => {
  const parseResult = new DOMParser().parseFromString(msg, "text/html");
  return parseResult && parseResult.documentElement.textContent;
}
