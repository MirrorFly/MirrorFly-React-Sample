import {
  CALL_STAR_ORIGINAL_MESSAGE,
  REMOVE_ALL_STARRED_MESSAGE,
  REMOVE_STARRED_MESSAGE_CLEAR_CHAT,
  REMOVE_STARRED_MESSAGE_DELETE_CHAT,
  STARRED_MESSAGEE_LIST,
  UPDATE_STARRED_MESSAGE_LIST,
  UPDATE_STARRED_MESSAGE_STATUS
} from "../Actions/Constants";
import { updatedStarredMessageStatus, updateStarredList } from "../Helpers/Chat/ChatHelper";

const initialState = {
  id: null,
  data: []
};

const chatHistoryPageType ={
  id: null,
  fromPage: null,
  callOriginStrMsg : false,
  activeId: null,
  msgId: null
}

export function StarredMessagesReducer(state = initialState, action = {}) {
  const { payload: { id, data, originalMsg } = {} } = action;

  switch (action.type) {
    case STARRED_MESSAGEE_LIST:
      return action.payload;

    case UPDATE_STARRED_MESSAGE_LIST:
      return {
        ...state,
        ...{
          id: id,
          data: updateStarredList(data, state.data, originalMsg)
        }
      };

    case REMOVE_ALL_STARRED_MESSAGE:
      return initialState;

    case REMOVE_STARRED_MESSAGE_CLEAR_CHAT:
    case REMOVE_STARRED_MESSAGE_DELETE_CHAT:
      return {
        ...state,
        ...{
          id: id,
          data: state.data.filter((el) => el.fromUserId !== data.fromUserId)
        }
      };

    case UPDATE_STARRED_MESSAGE_STATUS:
      return {
        ...state,
        ...{
          id: id,
          data: updatedStarredMessageStatus(data, state.data)
        }
      };
    default:
      return state;
  }
}

export function starMsgPageTypeReducer(state = chatHistoryPageType, action = {}) {
  const { payload: { id, data } = {} } = action;
  if(action.type == CALL_STAR_ORIGINAL_MESSAGE ){
    return {
      ...{
        id: id,
        fromPage: "starPage",
        callOriginStrMsg: data.callOriginStrMsg,
        activeId: data.activeId,
        msgId: data.msgId
      }
    }
  } else {
    return state;
  }
}
