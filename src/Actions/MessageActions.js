import uuidv4 from "uuid/v4";
import {
  updateConversationMessage,
  updateRecentChatMessage,
  updateMessageUnreadCount
} from "../Components/WebChat/Common/createMessage";
import {
  MESSAGE_DATA,
  MESSAGE_FORWARD_ADD,
  MESSAGE_FORWARD_REMOVE,
  MESSAGE_FORWARD_RESET,
  MESSAGE_INFO_DATA,
  RECENT_RECALL_UPDATE,
  RECENT_REMOVE_MESSAGE_UPDATE,
  REPLY_MESSAGE_DATA,
  RECENT_STATUS_UPDATE,
  UPDATE_MESSAGE_STATUS,
  DELETE_MESSAGE_FOR_ME,
  DELETE_MESSAGE_FOR_EVERYONE,
  MESSAGE_INFO_UPDATE,
  UPDATE_STARRED_MESSAGE_LIST,
  UPDATE_STARRED_MESSAGE_STATUS,
  CLEAR_ALL_CHAT,
  SELECTED_MESSAGE_INFO
} from "./Constants";
import { getFormatPhoneNumber } from "../Helpers/Utility";
import { deleteChatSeenPendingMsg } from "./SingleChatMessageActions";
import { TypingDataAction, TypingDataRemove } from "./TypingAction";
import {
  GROUP_CHAT_PROFILE_UPDATED_NOTIFY,
  MSG_SEEN_ACKNOWLEDGE_STATUS,
  MSG_SEEN_STATUS,
  MSG_SENT_SEEN_STATUS_CARBON,
  MSG_DELETE_STATUS,
  MSG_DELETE_STATUS_CARBON,
  MSG_DELIVERED_STATUS_CARBON,
  MSG_DELIVERED_STATUS,
  MSG_DELIVERED_STATUS_ID,
  MSG_SEEN_STATUS_ID
} from "../Helpers/Chat/Constant";
import { getContactNameFromRoster, getDataFromRoster } from "../Helpers/Chat/User";
import { handleArchiveActions, handleTempArchivedChats } from "../Helpers/Chat/ChatHelper";
import { TYPE_DELAY_TIME } from "../Helpers/Constants";
import SDK from "../Components/SDK";

const getTypingUserDetails = (newChatFrom) => {
  const rosterDetail = getDataFromRoster(newChatFrom);
  return rosterDetail ? getContactNameFromRoster(rosterDetail) : getFormatPhoneNumber(newChatFrom.split("@")[0]);
};

const typingTime = {};
export const MessageAction = (data) => (dispatch, getState) => {
  const { timestamp = Date.now(), msgType, type, msgId: currentMsgId = null, fromUserId = null } = data;
  if (!msgType || msgType === "carbonReceiveAcknowledge" || msgType === "carbonSentAcknowledge") {
    return;
  }

  const getcurrentState = getState();

  // When message is seen, then delete the seen messages from pending seen message list
  const pendingMessages = getcurrentState?.chatSeenPendingMsgData?.data || [];
  if (
    pendingMessages.length > 0 &&
    (msgType === MSG_SENT_SEEN_STATUS_CARBON || (msgType === MSG_SEEN_ACKNOWLEDGE_STATUS && type === MSG_SEEN_STATUS))
  ) {
    dispatch(deleteChatSeenPendingMsg(currentMsgId));
  }

  if (msgType === "composing" || msgType === "carbonComposing" || msgType === "carbonGone" || msgType === "gone") {
    if (msgType === "composing" || msgType === "carbonComposing") {
      const { groupId } = data;
      let displayName;
      if (groupId) {
        displayName = getTypingUserDetails(fromUserId);
      }
      data.displayName = displayName;
      dispatch(TypingDataAction(data));
      clearTimeout(typingTime[data.fromUserId]);
      typingTime[data.fromUserId] = setTimeout(() => {
        dispatch(TypingDataRemove(data));
      }, TYPE_DELAY_TIME + 1000);
    } else {
      dispatch(TypingDataRemove(data));
    }
  }

  if (
    msgType === "recallMessage" ||
    msgType === "carbonRecallMessage" ||
    msgType === "carbonSentRecall" ||
    msgType === "carbonReceiveRecall" ||
    (msgType === "acknowledge" && type === "recall")
  ) {
    dispatch({
      type: RECENT_RECALL_UPDATE,
      payload: {
        id: uuidv4(),
        data
      }
    });
    dispatch({
      type: DELETE_MESSAGE_FOR_EVERYONE,
      payload: {
        id: uuidv4(),
        data
      }
    });
    dispatch({
      type: UPDATE_STARRED_MESSAGE_LIST,
      payload: {
        id: uuidv4(),
        data: {
          msgId: data.msgId,
          favouriteStatus: 0
        }
      }
    });
    handleTempArchivedChats(data.fromUserId, data.chatType);
  }

  if (
    msgType === "carbonMessageClear" ||
    msgType === "messageClear" ||
    msgType === "clear_message" ||
    msgType === MSG_DELETE_STATUS ||
    msgType === MSG_DELETE_STATUS_CARBON
  ) {
    dispatch({
      type: RECENT_REMOVE_MESSAGE_UPDATE,
      payload: {
        id: uuidv4(),
        data
      }
    });
    dispatch({
      type: DELETE_MESSAGE_FOR_ME,
      payload: {
        id: uuidv4(),
        data
      }
    });

    handleTempArchivedChats(data.fromUserId, data.chatType);
    
    // Removing All Starred Messages
    if (msgType === MSG_DELETE_STATUS || msgType === MSG_DELETE_STATUS_CARBON) {
      for (const msgId in data.msgIds) {
        dispatch({
          type: UPDATE_STARRED_MESSAGE_LIST,
          payload: {
            id: uuidv4(),
            data: {
              msgId: data.msgIds[msgId],
              favouriteStatus: 0
            }
          }
        });
      }
    }
    
    if ((msgType === MSG_DELETE_STATUS || msgType === MSG_DELETE_STATUS_CARBON) && data.lastMsgId) {
      SDK.getMessageById(data.lastMsgId);
    }
  }

  if (msgType === "carbonDelivered" || msgType === "delivered" || msgType === "carbonSeen" || msgType === "seen") {
    dispatch({
      type: UPDATE_MESSAGE_STATUS,
      payload: {
        id: uuidv4(),
        data
      }
    });
    dispatch({
      type: MESSAGE_INFO_UPDATE,
      payload: {
        id: uuidv4(),
        activeUserId: data.publisherId,
        time: timestamp,
        editedTimeUpdated: data.timestamp,
        messageStatus:
          msgType === MSG_DELIVERED_STATUS_CARBON || msgType === MSG_DELIVERED_STATUS
            ? MSG_DELIVERED_STATUS_ID
            : MSG_SEEN_STATUS_ID
      }
    });
    dispatch({
      type: UPDATE_STARRED_MESSAGE_STATUS,
      payload: {
        id: uuidv4(),
        data
      }
    });
  }

  if (msgType === "acknowledge" && type === "acknowledge") {
    dispatch({
      type: UPDATE_MESSAGE_STATUS,
      payload: {
        id: uuidv4(),
        data
      }
    });
  }

  if (msgType === "carbonClearAllChat") {
    dispatch({
      type: CLEAR_ALL_CHAT,
      payload: {
        id: uuidv4(),
        data
      }
    });
  }
 
  dispatch({
    type: MESSAGE_DATA,
    payload: {
      id: uuidv4(),
      data
    }
  });

  if (
    msgType === "sentMessage" ||
    msgType === "carbonSentMessage" ||
    msgType === "carbonReceiveMessage" ||
    msgType === "receiveMessage" ||
    msgType === GROUP_CHAT_PROFILE_UPDATED_NOTIFY
  ) {
    handleArchiveActions(data);
    updateConversationMessage(data, getcurrentState);
    updateMessageUnreadCount(data, getcurrentState);
    updateRecentChatMessage(data, getcurrentState);
    return;
  }

  if (msgType === "carbonSentSeen") {
    updateMessageUnreadCount(data, getcurrentState);
  }

};

export const ReplyMessageAction = (data) => {
  return {
    type: REPLY_MESSAGE_DATA,
    payload: {
      id: uuidv4(),
      data
    }
  };
};


export const MessageActionEdited = (data) => {
  return {
    type: "MESSAGE_EDIT",
    payload: {
      id: uuidv4(),
      data
    }
  };
};

export const messageInfoAction = (data, forceUpdate) => {
  const { statusUpdate = true, msgId } = data;
  return (dispatch, getState) => {
    const getcurrentState = getState();
    if (statusUpdate) {
      const messageObject = getcurrentState?.recentChatData?.data.find((ele) => ele.msgId === msgId);
      if (messageObject) {
        dispatch({
          type: RECENT_STATUS_UPDATE,
          payload: {
            id: uuidv4(),
            data
          }
        });
      }
    }

    dispatch({
      type: MESSAGE_INFO_DATA,
      payload: {
        id: uuidv4(),
        data
      }
    });
  };
};

export const messageForwardAdd = (data) => {
  return {
    type: MESSAGE_FORWARD_ADD,
    payload: {
      id: uuidv4(),
      data
    }
  };
};

export const messageForwardRemove = (data) => {
  return {
    type: MESSAGE_FORWARD_REMOVE,
    payload: {
      id: uuidv4(),
      data
    }
  };
};

export const messageForwardReset = () => {
  return {
    type: MESSAGE_FORWARD_RESET,
    payload: {}
  };
};

export const selectedMessageInfo = (data) => {
  return (dispatch) => {
        dispatch({
            type: SELECTED_MESSAGE_INFO,
            payload: data
        });
  }
}
