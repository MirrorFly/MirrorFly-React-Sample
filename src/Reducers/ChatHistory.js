import {
  CHAT_MESSAGE_HISTORY,
  UPDATE_MESSAGE_STATUS,
  UPDATE_UPLOAD_STATUS,
  CLEAR_CHAT_HISTORY,
  DELETE_CHAT_HISTORY,
  DELETE_MESSAGE_FOR_ME,
  DELETE_MESSAGE_FOR_EVERYONE,
  UPDATE_TYPED_MESSAGE,
  CANCEL_MEDIA_UPLOAD,
  RETRY_MEDIA_UPLOAD,
  UPDATE_FAVOURITE_STATUS,
  REMOVE_ALL_FAVOURITE_STATUS,
  TRANSLATE_MESSAGE,
  CLEAR_ALL_CHAT,
  CLEAR_CHAT_HISTORY_ACTION_COMMON,
  CANCEL_MEDIA_DOWNLOAD,
  CHAT_MESSAGE_EDIT
} from "../Actions/Constants";
import {
  clearChatHistoryOffline,
  getChatHistoryData,
  getUpdatedHistoryData,
  getUpdatedHistoryDataUpload,
  removeFavouriteStatusHistory,
  updateDeletedMessageInHistory,
  updateFavouriteStatusHistory,
  updateMediaUploadStatusHistory,
  updateMessageTranslate
} from "../Helpers/Chat/ChatHelper";

const initialState = {
  id: null,
  data: {}
};

export function ChatConversationHistoryReducer(state = initialState, action = {}) {
  const { id, data } = action.payload || {};
  switch (action.type) {
    case CHAT_MESSAGE_HISTORY:
      return {
        ...state,
        ...{
          id: id,
          data: getChatHistoryData(data, state.data)
        }
      };

    case CLEAR_CHAT_HISTORY_ACTION_COMMON:
      let msg = clearChatHistoryOffline(data, state.data);
      return {
        ...state,
        ...{
          id: id,
          data: {
            ...state.data,
            [data.id]: {
              messages: msg
            }
         }
        }
      }  

    case UPDATE_MESSAGE_STATUS:
      return {
        ...state,
        ...{
          id: id,
          data: getUpdatedHistoryData(data, state.data)
        }
      };

    case UPDATE_UPLOAD_STATUS:
      return {
        ...state,
        ...{
          id: id,
          data: getUpdatedHistoryDataUpload(data, state.data)
        }
      };

    case CANCEL_MEDIA_UPLOAD:
    case CANCEL_MEDIA_DOWNLOAD:
    case RETRY_MEDIA_UPLOAD:
      return {
        ...state,
        ...{
          id: id,
          data: updateMediaUploadStatusHistory(data, state.data)
        }
      };

    case UPDATE_FAVOURITE_STATUS:
      return {
        ...state,
        ...{
          id: id,
          data: updateFavouriteStatusHistory(data, state.data)
        }
      };

    case REMOVE_ALL_FAVOURITE_STATUS:
      return {
        ...state,
        ...{
          id: id,
          data: removeFavouriteStatusHistory(data, state.data)
        }
      };

    case CLEAR_CHAT_HISTORY:
      return {
        ...state,
        ...{
          id: id,
          data: {
            ...state.data,
            [data.fromUserId]: {
              messages: {}
            }
          }
        }
      };

    case CLEAR_ALL_CHAT:
      return {
        ...state,
        ...{
          id: id,
          data: {}
        }
      };

    case DELETE_CHAT_HISTORY:
      const currentData = { ...state.data };
      delete currentData[data.fromUserId];
      return {
        ...state,
        ...{
          id: id,
          data: currentData
        }
      };

    case DELETE_MESSAGE_FOR_ME:
    case DELETE_MESSAGE_FOR_EVERYONE:
      return {
        ...state,
        ...{
          id: id,
          data: updateDeletedMessageInHistory(action.type, data, state.data)
        }
      };

    case UPDATE_TYPED_MESSAGE:
      return {
        ...state,
        ...{
          id: id,
          data: {
            ...state.data,
            [data.chatId]: {
              ...state.data[data.chatId],
              typedMessage: data.message
            }
          }
        }
      };

    case TRANSLATE_MESSAGE:
      return {
        ...state,
        ...{
          id: id,
          data: updateMessageTranslate(data, state.data)
        }
      };
    default:
      return state;
  }
}

export function EditStatusReducer(state = {}, action = {}){
  if (action.type === CHAT_MESSAGE_EDIT) {
      return {
        ...state,
        [action.payload.msgId]: action.payload.data
      }
  }
  return state;
}
