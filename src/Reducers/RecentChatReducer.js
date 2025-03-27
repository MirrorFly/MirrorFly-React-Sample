import uuidv4 from "uuid/v4";
import {
  RECENT_NOTIFICATION_UPDATE,
  RECENT_CHAT_DATA,
  RECENT_RECALL_UPDATE,
  ACTIVE_CHAT_DATA,
  ACTIVE_CHAT_UPDATE,
  PROFILE_IMAGE_CHAT_DATA,
  RECENT_REMOVE_MESSAGE_UPDATE,
  RECENT_ROSTER_UPDATE,
  DELETE_SINGLE_CHAT,
  RESET_TO_DEFAULT,
  UPDATE_ROSTER_LAST_MESSAGE,
  UPDATE_GROUP_NAME,
  RESET_RECENT_CHAT,
  UPDATE_MSG_BY_LAST_MSGID,
  MODAL_ACTIVE_CLASS,
  RECONNECT_RECENT_CHAT_UPDATE,
  UPDATE_MUTE_RECENT_CHAT,
  UPDATE_ARCHIVE_RECENT_CHAT,
  UNREAD_MESSAGE_DELETE,
  UPDATE_MESSAGE_STATUS,
  CLEAR_ALL_CHAT,
  UPDATE_ACTIVE_CHAT_DATA
} from "../Actions/Constants";
import { updateRecall, emptyMessage } from "../Helpers/Chat/Recall";
import { MEDIA_MESSAGE_TYPES } from "../Helpers/Constants";
import { getMsgStatusInOrder } from "../Helpers/Chat/ChatHelper";

const updateRecentChat = (filterBy, newMessage, recentChatArray = []) => {
  const checkalreadyExist = recentChatArray.find((message) => message.fromUserId === filterBy);
  if (!checkalreadyExist) {
    newMessage.archiveStatus = 0;
    return [...recentChatArray, newMessage];
  }
  return recentChatArray.map((recentItem) => {
    if (recentItem.fromUserId === filterBy) {
      return {
        ...recentItem,
        ...newMessage,
        deleteStatus: 0
      };
    }
    return recentItem;
  });
};

const updateMuteRecentChat = (data, stateData) => {
  return stateData.map((element) => {
    if (element.fromUserId === data.fromUserId) {
      element.muteStatus = data.isMuted ? 1 : 0;
    }
    return element;
  });
};

const updateRecentUnreadCount = (data, stateData) => {
  return stateData.map((element) => {
    return element;
  });
};

const updateRecentChatMessageStatus = (data, stateData) => {
  return stateData?.map((element) => {
    if (element.fromUserId === data.fromUserId && element.msgId === data.msgId) {
      element.msgStatus = getMsgStatusInOrder(element.msgStatus, data.msgStatus);
    }
    if(!element.msgType || element.msgType == undefined){
      element.msgType = element.msgBody.message_type
    }
    return element;
  });
};

const updateArchiveRecentChat = (data, stateData) => {
  return stateData.map((element) => {
    if (element.fromUserId === data.fromUserId) {
      element.archiveStatus = data.isArchived ? 1 : 0;
    }
    return element;
  });
};

const updateReconnectRecentChat = (newRecentChat, oldRecentChat = []) => {
  const pendingMsgChats = oldRecentChat.filter((chat) => chat.msgStatus === 3 && MEDIA_MESSAGE_TYPES.includes(chat.msgType));

  return newRecentChat.map((recentItem) => {
    const pendingChat = pendingMsgChats.find((pending) => pending.fromUserId === recentItem.fromUserId);
    if (pendingChat) {
      return {
        ...pendingChat,
        ...recentItem
      };
    } else {
      return {
        ...recentItem
      };
    }
  });
};

const deletedChatList = (deleteData, currentArray) => {
  const { fromUserId } = deleteData;
  return currentArray.filter((element, id) => element["fromUserId"] !== fromUserId);
};

const clearMessageInRecentChat = (data, id) => {
  return data.find((element) => {
    if (element.recent.fromUserId === id) {
      element.recent.msgBody = {};
      element.recent.msgType = "";
      element.recent.createdAt = "";
      element.recent.msgStatus = 4;
      return element;
    }
    return false;
  });
};

const updateMsgByLastMsgId = (newMessage, recentChatList = []) => {
  const msgIndex = recentChatList.findIndex((msg) => msg.lastMsgId === newMessage.msgId);
  if (msgIndex > -1) {
    recentChatList[msgIndex] = { ...recentChatList[msgIndex], ...newMessage };
    recentChatList[msgIndex]["msgType"] = newMessage?.msgBody?.message_type || newMessage.msgType;
  }
  return recentChatList.sort((a, b) => (b.msgId > a.msgId ? 1 : -1));
};

const clearAllRecentChat = (stateData) => {
  return stateData.map((element) => {
    if (element) {
      element.msgBody = {};
      element.msgType = "";
      element.createdAt = "";
      element.msgStatus = 4;
      return element;
    }
  });
};

export function RecentChatReducer(state = [], action = {}) {
  let { payload: { id, data, filterBy, rosterData, refreshUnreadCount } = {} } = action;
  refreshUnreadCount = !!refreshUnreadCount;
  let isServerReconnect = data?.serverReconnect ? true : false;
  switch (action.type) {
    case RECENT_CHAT_DATA:
      if(state.data && !isServerReconnect){
        let newpayLoadData = action.payload.data.filter(newObj => {
          return !state.data.some(existingObj => existingObj.msgId === newObj.msgId);
        });
        let constructData = [...state.data, ...newpayLoadData]
        const latestObjects = constructData.reduce((acc, obj) => {
          if (!acc[obj.fromUserId] || acc[obj.fromUserId].timestamp < obj.timestamp) {
              acc[obj.fromUserId] = obj;
          }
          return acc;
        }, {});
        action.payload.data = Object.values(latestObjects);
      }
      return action.payload
    case RECONNECT_RECENT_CHAT_UPDATE:
      return {
        ...state,
        id,
        data: updateReconnectRecentChat(action.payload?.data, state.data),
        refreshUnreadCount
      };
    case UPDATE_MESSAGE_STATUS:
      return {
        ...state,
        id,
        data: updateRecentChatMessageStatus(action.payload?.data, state.data),
        refreshUnreadCount
      };
    case ACTIVE_CHAT_UPDATE:
      return {
        ...state,
        id,
        data: updateRecentChat(filterBy, data, state.data),
        refreshUnreadCount
      };
    case RECENT_NOTIFICATION_UPDATE:
      return {
        ...state,
        data: updateRecentChat(filterBy, data, state.data),
        refreshUnreadCount
      };
    case RECENT_REMOVE_MESSAGE_UPDATE:
      return {
        ...state,
        id,
        data: emptyMessage(data, state.data),
        refreshUnreadCount
      };
    case RECENT_RECALL_UPDATE:
      return {
        ...state,
        id,
        data: updateRecall(data, state.data),
        refreshUnreadCount
      };
    case RECENT_ROSTER_UPDATE:
      return {
        ...state,
        rosterData,
        refreshUnreadCount
      };
    case DELETE_SINGLE_CHAT:
      return {
        ...state,
        id,
        data: deletedChatList(data, state.data),
        refreshUnreadCount
      };
    case UPDATE_ROSTER_LAST_MESSAGE:
      return {
        ...state,
        id,
        ...state.data,
        rosterData: [
          ...state.rosterData.recentChatNames,
          clearMessageInRecentChat(state.rosterData.recentChatItems, data)
        ],
        refreshUnreadCount
      };
    case RESET_RECENT_CHAT:
      return [];
    case UPDATE_MSG_BY_LAST_MSGID:
      return {
        ...state,
        id,
        data: updateMsgByLastMsgId(data, state.data),
        refreshUnreadCount
      };
    case UPDATE_MUTE_RECENT_CHAT:
      return {
        ...state,
        id,
        data: updateMuteRecentChat(data, state.data),
        refreshUnreadCount
      };
    case UPDATE_ARCHIVE_RECENT_CHAT:
      return {
        ...state,
        id,
        data: updateArchiveRecentChat(data, state.data),
        refreshUnreadCount
      };
    case UNREAD_MESSAGE_DELETE:
      return {
        ...state,
        id,
        data: updateRecentUnreadCount(data, state.data),
        refreshUnreadCount
      };
    case CLEAR_ALL_CHAT:
      return {
        ...state,
        id,
        data: clearAllRecentChat(state.data)
      };

    default:
      return state;
  }
}

export function ActiveChatReducer(state = [], action = {}) {
  switch (action.type) {
    case ACTIVE_CHAT_DATA:
      return action.payload;
    case UPDATE_GROUP_NAME:
      const { nickName } = action.payload.data.groups[0];
      const updatedData = state.data?.roster || {};
      updatedData["nickName"] = nickName;
      return {
        ...state,
        id: action.payload.id,
        ...state.data,
        roster: updatedData
      };
    case UPDATE_MUTE_RECENT_CHAT:
      if (!state.data) return state;
      {
        const {
          chatId,
          recent: { muteStatus }
        } = state.data || {};
        const { fromUserId, isMuted } = action.payload.data;
        const newMuteStatus = chatId === fromUserId ? Number(isMuted) : muteStatus;
        return {
          ...state,
          id: uuidv4(),
          data: {
            ...state.data,
            recent: {
              ...state.data.recent,
              muteStatus: newMuteStatus
            }
          }
        };
      }
    case UPDATE_ARCHIVE_RECENT_CHAT:
      if (!state.data) return state;
      {
        const {
          chatId,
          recent: { archiveStatus }
        } = state.data || {};
        const { fromUserId, isArchived } = action.payload.data;
        const newArchiveStatus = chatId === fromUserId ? Number(isArchived) : archiveStatus;
        return {
          ...state,
          id: uuidv4(),
          data: {
            ...state.data,
            recent: {
              ...state.data.recent,
              archiveStatus: newArchiveStatus
            }
          }
        };
      }
    case UPDATE_ACTIVE_CHAT_DATA:
      return {
        ...state,
        id: uuidv4(),
        data: {
          ...state.data,
          recent: {
            ...state.data.recent,
            ...action.payload.data
          }
        }
      };

    case RESET_TO_DEFAULT:
      return [];
    default:
      return state;
  }
}

export function WebChatProfileImageReducer(state = [], action = {}) {
  if (action.type === PROFILE_IMAGE_CHAT_DATA) {
    return action.payload;
  }
  return state;
}

const initialState = {
  modalPopup: false
};
export function modalPopUpReducer(state = initialState, action = {}) {
  if (action.type === MODAL_ACTIVE_CLASS) {
    return {
      ...state,
      modalPopup: action.payload
    };
  }
  return state;
}
