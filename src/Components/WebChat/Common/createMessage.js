import { RecentChatUpdateAction } from "../../../Actions/RecentChatActions";
import { chatSeenPendingMsg } from "../../../Actions/SingleChatMessageActions";
import { changeTimeFormat } from "../../../Helpers/Chat/RecentChat";
import { formatUserIdToJid, isLocalUser } from "../../../Helpers/Chat/User";
import { getMessageObjReceiver, shouldHideNotification } from "../../../Helpers/Utility";
import Store from "../../../Store";
import SDK from "../../SDK";
import {
  CHAT_TYPE_GROUP,
  GROUP_UPDATE_ACTIONS,
  MSG_RECEIVE_STATUS,
  MSG_RECEIVE_STATUS_CARBON,
  MSG_SENT_SEEN_STATUS_CARBON
} from "../../../Helpers/Chat/Constant";
import {
  isActiveConversationUserOrGroup,
  notificationMessageType,
  isSingleChat,
  isGroupChat,
  getChatHistoryMessagesData
} from "../../../Helpers/Chat/ChatHelper";
import { UnreadCountUpdate, UnreadCountDelete } from "../../../Actions/UnreadCount";
import { ChatMessageHistoryDataAction } from "../../../Actions/ChatHistory";
import browserNotify from "../../../Helpers/Browser/BrowserNotify";
import {getFromLocalStorageAndDecrypt} from "../WebChatEncryptDecrypt";

const getMessageSenderDetails = (newChatFrom, rosterDataArray) => {
  const rosterDetail = rosterDataArray.find((profile) => {
    const rosterJid = profile.username ? profile.username : profile.jid;
    return newChatFrom === rosterJid;
  });
  return rosterDetail || { contactNumber: newChatFrom };
};

export const updateRecentChatMessage = (messgeObject, stateObject) => {
  const { recentChatData, rosterData } = stateObject;
  const { data: rosterDataArray = [] } = rosterData;
  const { rosterData: { recentChatNames } = {} } = recentChatData;
  const { msgType, fromUserId, fromUserJid, toUserId, msgId, timestamp, chatType, msgBody, publisherId } = messgeObject;

  const newChatTo = msgType === "carbonSentMessage" ? toUserId : fromUserId;
  const newChatFrom = chatType === "groupchat" ? publisherId : fromUserId;
  const updateTime = changeTimeFormat(timestamp);
  const userDetails = getMessageSenderDetails(newChatFrom, rosterDataArray);
  const leftGroup = !msgType && msgType === "receiveMessage" && msgBody === "3";
  const x = new Date();
  let UTCseconds = x.getTime() + x.getTimezoneOffset() * 60 * 1000;

  // Temp - Reorder Issue Fix
  if (Number(UTCseconds).toString().length > 13) UTCseconds = UTCseconds / 1000;

  /**
   * update the chat message if message alredy exist in recent chat
   */
  if (recentChatNames && recentChatNames?.indexOf(newChatTo) !== -1) {
    const constructNewMessage = {
      ...messgeObject,
      MessageType: msgType ? msgType : msgBody.message_type || "",
      msgType: msgBody.message_type ? msgBody.message_type : msgType,
      publisher: newChatFrom,
      publisherId: newChatFrom,
      leftGroup: leftGroup,
      filterBy: newChatTo,
      fromUserId: newChatTo,
      chatType: chatType,
      contactDetails: userDetails,
      createdAt: updateTime,
      timestamp: parseInt(UTCseconds)
    };
    Store.dispatch(RecentChatUpdateAction(constructNewMessage));
  } else {
    /**
     * New chat that is not alreay exist in recent chat
     */
    const getMute = getFromLocalStorageAndDecrypt("tempMuteUser");
    let parserLocalStorage = getMute ? JSON.parse(getMute) : {};
    const isMuted = parserLocalStorage[newChatTo]?.isMuted ? 1 : 0;
    if (isMuted) {
      SDK.updateMuteNotification(formatUserIdToJid(newChatTo, chatType), true);
    }
    const newMessage = {
      archiveStatus: 0,
      chatType: chatType,
      msgBody: msgBody,
      msgId: msgId,
      msgStatus: 0,
      muteStatus: isMuted,
      msgType: msgBody.message_type ? msgBody.message_type : msgType,
      deleteStatus: 0,
      unreadCount: 0,
      fromUserId: newChatTo,
      timestamp: parseInt(UTCseconds),
      publisher: newChatFrom,
      publisherId: newChatFrom,
      toUserId: toUserId,
      createdAt: updateTime,
      filterBy: newChatTo
    };
    Store.dispatch(RecentChatUpdateAction(newMessage));
  }
  if (!msgType && msgType === "receiveMessage" && (msgBody === "4" || msgBody === "2")) {
    SDK.getGroupProfileUpdate(fromUserJid);
  }
};

export const updateConversationMessage = (messgeObject, currentState) => {
  const newChatTo = messgeObject.msgType === "carbonSentMessage" ? messgeObject.toUserId : messgeObject.fromUserId;
  const singleChat = isSingleChat(messgeObject.chatType);

  if (isActiveConversationUserOrGroup(newChatTo)) {
    const publisherId = singleChat ? newChatTo : messgeObject.publisherId;
    if ([MSG_RECEIVE_STATUS, MSG_RECEIVE_STATUS_CARBON].indexOf(messgeObject.msgType) > -1) {
      if (currentState?.browserTabData?.isVisible) {
        const groupId = singleChat ? "" : newChatTo;
        SDK.sendSeenStatus(formatUserIdToJid(publisherId), messgeObject.msgId, groupId);
      } else {
        Store.dispatch(chatSeenPendingMsg(messgeObject));
      }
    }
    if (GROUP_UPDATE_ACTIONS.indexOf(messgeObject?.profileUpdatedStatus) && !isLocalUser(messgeObject.publisherId)) {
      SDK.updateRecentChatUnreadCount(messgeObject?.fromUserJid);
    }
  } else {
    // If the Chat is Already Opened but if it is Not Currently Active, Store the Messages for Sending Seen Status
    if (!isLocalUser(messgeObject.publisherId)) {
      Store.dispatch(chatSeenPendingMsg(messgeObject));
    }
  }

  const conversationHistory = getChatHistoryMessagesData();
  if (Object.keys(conversationHistory).includes(newChatTo)) {
    const conversationChatObj = getMessageObjReceiver(messgeObject, messgeObject.fromUserId);

    const dispatchData = {
      data: [conversationChatObj],
      ...(singleChat
        ? { userJid: formatUserIdToJid(newChatTo) }
        : { groupJid: formatUserIdToJid(newChatTo, CHAT_TYPE_GROUP) })
    };
    Store.dispatch(ChatMessageHistoryDataAction(dispatchData));
  }
};

/**
 * Update all delivered message seen status
 */
export const updateMsgSeenStatus = () => {
  const state = Store.getState();
  if (state?.activeChatData?.data?.recent) {
    const pendingMessages = state?.chatSeenPendingMsgData?.data || [];
    pendingMessages.map((message) => {
      const fromUserId = isGroupChat(message.chatType) ? message.publisherId : message.fromUserId;
      const groupId = isGroupChat(message.chatType) ? message.fromUserId : "";
      if (isActiveConversationUserOrGroup(message.fromUserId)) {
        if (GROUP_UPDATE_ACTIONS.indexOf(message?.profileUpdatedStatus) > -1) {
          if (!isLocalUser(message.publisherId)) SDK.updateRecentChatUnreadCount(message?.fromUserJid);
        } else {
          SDK.sendSeenStatus(formatUserIdToJid(fromUserId), message.msgId, groupId);
        }
      }
    });
  }
};

/**
 * Update the unread count for the received message
 * @param {*} messgeObject
 * @param {*} stateObject
 */
export const updateMessageUnreadCount = (messgeObject, stateObject) => {
  const { msgType, fromUserId, publisherId, chatType, msgBody, profileUpdatedStatus, toUserId, groupId } = messgeObject;

  if (
    [MSG_RECEIVE_STATUS, MSG_RECEIVE_STATUS_CARBON].indexOf(msgType) > -1 &&
    !isLocalUser(publisherId) &&
    ((shouldHideNotification() && browserNotify.isPageHidden ) || !isActiveConversationUserOrGroup(fromUserId, chatType)) &&
    notificationMessageType.indexOf(msgBody) === -1
  ) {
    Store.dispatch(UnreadCountUpdate({ fromUserId }));
  }

  if (
    ((shouldHideNotification()&& browserNotify.isPageHidden ) || !isActiveConversationUserOrGroup(fromUserId, chatType)) &&    GROUP_UPDATE_ACTIONS.indexOf(profileUpdatedStatus) > -1 &&
    !isLocalUser(publisherId)
  ) {
    Store.dispatch(UnreadCountUpdate({ fromUserId }));
  }

  if ([MSG_SENT_SEEN_STATUS_CARBON].indexOf(msgType) > -1) {
    const updateId = groupId ? groupId : toUserId;
    Store.dispatch(UnreadCountDelete({ fromUserId: updateId }));
  }
};
