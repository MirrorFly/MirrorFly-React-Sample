import { RecentChatUpdateAction } from "../../../Actions/RecentChatActions";
import { chatSeenPendingMsg } from "../../../Actions/SingleChatMessageActions";
import { changeTimeFormat } from "../../../Helpers/Chat/RecentChat";
import { formatUserIdToJid, isLocalUser } from "../../../Helpers/Chat/User";
import { getMessageObjReceiver, getMessageObjReceiverEdited } from "../../../Helpers/Utility";
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
  getChatHistoryMessagesData,
  getRecentChatMessagesData,
  getActiveConversationChatId
} from "../../../Helpers/Chat/ChatHelper";
import { UnreadCountUpdate, UnreadCountDelete, UnreadUserObj, GroupNotificationCount } from "../../../Actions/UnreadCount";
import { ChatMessageHistoryDataAction } from "../../../Actions/ChatHistory";
import {getFromLocalStorageAndDecrypt} from "../WebChatEncryptDecrypt";
import { MessageActionEdited } from "../../../Actions/MessageActions";

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
  const { msgType, fromUserId, fromUserJid, toUserId, msgId, timestamp, chatType, msgBody,
     publisherId, editedStatus = 0, msgStatus, deleteStatus, archiveStatus, userId, profileUpdatedStatus } = messgeObject;
  const newChatTo = msgType === "carbonSentMessage" ? toUserId : fromUserId;
  const newChatFrom = chatType === "groupchat" ? publisherId : fromUserId;
  const updateTime = changeTimeFormat(timestamp);
  const userDetails = getMessageSenderDetails(newChatFrom, rosterDataArray);
  const leftGroup = !msgType && msgType === "receiveMessage" && msgBody === "3";
  const x = new Date();
  let UTCseconds = x.getTime() + x.getTimezoneOffset() * 60 * 1000;

  // Temp - Reorder Issue Fix
  if (Number(UTCseconds).toString().length > 13) UTCseconds = UTCseconds / 1000;

  //get RecentChatData from Store
  const recentStoreData = getRecentChatMessagesData();
  const mappedResult = recentStoreData && recentStoreData.some((messageObject) => msgId === messageObject.msgId);

  /**
   * update the chat message if message alredy exist in recent chat
   */
  if (recentChatNames && recentChatNames?.indexOf(newChatTo) !== -1) {
    let constructNewMessage = {};
    if (editedStatus === 1) {
      constructNewMessage = {
        ...messgeObject,
        chatType: chatType,
        contactDetails: userDetails,
        editedStatus: editedStatus,
        filterBy: newChatTo,
        fromUserId: newChatTo,
        leftGroup: leftGroup,
        MessageType: msgType ? msgType : msgBody.message_type || "",
        msgType: msgBody.message_type ? msgBody.message_type : msgType,
        publisher: newChatFrom,
        publisherId: newChatFrom,
      }
    } else {
      constructNewMessage = {
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
        timestamp: parseInt(UTCseconds),
        editedStatus: editedStatus
      };
    }
    if ((mappedResult === false && editedStatus === 0) || (mappedResult === true && editedStatus === 1)) {
      Store.dispatch(RecentChatUpdateAction(constructNewMessage));
    }
  } else {
    /**
     * New chat that is not alreay exist in recent chat
     */
    const getMute = getFromLocalStorageAndDecrypt("tempMuteUser");
    let parserLocalStorage = getMute ? JSON.parse(getMute) : {};
    const isMuted = parserLocalStorage[newChatTo]?.isMuted ? 1 : 0;
    const newMessage = {
      archiveStatus: editedStatus === 1 ? archiveStatus : 0,
      chatType: chatType,
      editedStatus: editedStatus,
      msgBody: msgBody,
      msgId: msgId,
      msgStatus: editedStatus === 1 ? msgStatus : 0,
      muteStatus: isMuted,
      msgType: msgBody.message_type ? msgBody.message_type : msgType,
      deleteStatus: editedStatus === 1 ? deleteStatus : 0,
      fromUserId: newChatTo,
      timestamp: editedStatus === 1 ? timestamp : parseInt(UTCseconds),
      publisher: newChatFrom,
      publisherId: newChatFrom,
      toUserId: toUserId,
      createdAt: updateTime,
      filterBy: newChatTo,
      userId,
      profileUpdatedStatus
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
  const editedStatus = messgeObject?.editedStatus || 0;
  const editMessageId = messgeObject?.editMessageId || "";
  const UnreadUserObjData = Store.getState().UnreadUserObjData;

  if (isActiveConversationUserOrGroup(newChatTo)) {
    const publisherId = singleChat ? newChatTo : messgeObject.publisherId;
    if ([MSG_RECEIVE_STATUS, MSG_RECEIVE_STATUS_CARBON].indexOf(messgeObject.msgType) > -1) {
            if (currentState?.browserTabData?.isVisible) {
        const groupId = singleChat ? "" : newChatTo;
        if (!UnreadUserObjData[messgeObject.fromUserId] || (UnreadUserObjData[messgeObject.fromUserId] && UnreadUserObjData[messgeObject.fromUserId].count == 0) || (UnreadUserObjData[messgeObject.fromUserId].apiOriginalCount == 0 && UnreadUserObjData[messgeObject.fromUserId].fullyViewedChat && UnreadUserObjData[messgeObject.fromUserId].unreadRealTimeMsgCount >= UnreadUserObjData[messgeObject.fromUserId].count)) {
        SDK.sendSeenStatus(formatUserIdToJid(publisherId), messgeObject.msgId, groupId);
        }
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
  let conversationChatObj = {};
  if (Object.keys(conversationHistory).includes(newChatTo)) {
    if (editedStatus === 1) { //Incase of server gives updated time, time handled from storeData
      conversationChatObj = getMessageObjReceiverEdited(messgeObject, newChatTo, conversationHistory);
      const constructedObj = {
        ...conversationChatObj,
        editMessageId: (editMessageId && editMessageId !== messgeObject?.msgId) ? editMessageId : "",
      }
      Store.dispatch(MessageActionEdited(constructedObj));
    } else {
      conversationChatObj = getMessageObjReceiver(messgeObject, messgeObject.fromUserId);
    }

    const dispatchData = {
      data: [conversationChatObj],
      ...(singleChat
        ? { userJid: formatUserIdToJid(newChatTo) }
        : { groupJid: formatUserIdToJid(newChatTo, CHAT_TYPE_GROUP) })
    };
  
    if (!UnreadUserObjData[messgeObject.fromUserId] || (UnreadUserObjData[messgeObject.fromUserId] && UnreadUserObjData[messgeObject.fromUserId].count == 0) || (UnreadUserObjData[messgeObject.fromUserId].apiOriginalCount == 0 && UnreadUserObjData[messgeObject.fromUserId].fullyViewedChat && UnreadUserObjData[messgeObject.fromUserId].unreadRealTimeMsgCount >= UnreadUserObjData[messgeObject.fromUserId].count)) {
      Store.dispatch(ChatMessageHistoryDataAction(dispatchData));
    }
    
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
          const UnreadUserObjData = Store.getState().UnreadUserObjData;
          if (!UnreadUserObjData[message.fromUserId] || UnreadUserObjData[message.fromUserId]?.fullyViewedChat || UnreadUserObjData[message.fromUserId]?.count == 0) {
            SDK.sendSeenStatus(formatUserIdToJid(fromUserId), message.msgId, groupId);
          }
          
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
  const { msgType, fromUserId, fromUserJid,  publisherId, msgBody, toUserId, groupId, msgId, profileUpdatedStatus } = messgeObject;
  const editedStatus = messgeObject?.editedStatus || 0;
  if (
    [MSG_RECEIVE_STATUS, MSG_RECEIVE_STATUS_CARBON].indexOf(msgType) > -1 &&
    !isLocalUser(publisherId) &&
    notificationMessageType.indexOf(msgBody) === -1 && editedStatus === 0)
  {
    const activeConversationId = getActiveConversationChatId();
    const { unreadDataObj } = Store.getState().unreadCountData;
    const UnreadUserObjData = Store.getState().UnreadUserObjData;
    const unreadRealTimeMsgCount = (UnreadUserObjData && UnreadUserObjData[fromUserId]) ? (UnreadUserObjData[fromUserId]?.unreadRealTimeMsgCount + 1 ) : 1;
    const unreadMsgCount =(unreadDataObj && unreadDataObj[fromUserId]) ? (unreadDataObj[fromUserId]?.count + 1 ) : 1;
    if(!activeConversationId || (activeConversationId != fromUserId)){
    Store.dispatch(UnreadCountUpdate({ fromUserId }));
    let unreadMsgId = (unreadMsgCount == 1 ) ? msgId : null;
    Store.dispatch(UnreadUserObj({ count: parseInt(unreadMsgCount), fromUserId: fromUserId, chatJid: fromUserJid, unreadMsgId, unreadRealTimeMsgCount })); 
    } else if(activeConversationId && unreadDataObj[fromUserId]?.count != 0 && !unreadDataObj[fromUserId]?.fullyViewedChat){
      Store.dispatch(UnreadCountUpdate({ fromUserId }));
      Store.dispatch(UnreadUserObj({ count: parseInt(unreadMsgCount), fromUserId: fromUserId, chatJid: fromUserJid, unreadRealTimeMsgCount })); 
    }    
  }

  if (
    GROUP_UPDATE_ACTIONS.indexOf(profileUpdatedStatus) > -1 &&
    !isLocalUser(publisherId) &&
    editedStatus === 0
  ) {
    const { unreadDataObj } = Store.getState().unreadCountData;
    const UnreadUserObjData = Store.getState().UnreadUserObjData;
    const groupNotificationMsgCount = Store.getState().groupNotificationMsgCount;
    const unreadMsgCount = unreadDataObj[fromUserId]?.count || 0;
    const unreadRealTimeMsgCount = UnreadUserObjData[fromUserId]?.unreadRealTimeMsgCount || 0;
    const countSet = Math.ceil(unreadRealTimeMsgCount / 21);
    const setNumber = (countSet == 0 ) ? 1 : countSet;
    const userNotificationCounts = groupNotificationMsgCount[fromUserId] || {};
    const previousSetNumberCount = userNotificationCounts[setNumber] || 0;
    if(unreadMsgCount == 0){
      Store.dispatch(UnreadUserObj({ count: parseInt(unreadMsgCount), fromUserId: fromUserId, chatJid: fromUserJid, unreadMsgId: msgId })); 
    }
    Store.dispatch(GroupNotificationCount({
      fromUserId,
      setNumber,
      notificationCount: previousSetNumberCount + 1
    }));
  }
  

  if ([MSG_SENT_SEEN_STATUS_CARBON].indexOf(msgType) > -1) {
    const updateId = groupId ? groupId : toUserId;
    Store.dispatch(UnreadCountDelete({ fromUserId: updateId }));
  }
};
