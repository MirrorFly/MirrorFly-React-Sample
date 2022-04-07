import {
  RECENT_STATUS_UPDATE
} from '../Actions/Constants';
import { checkMessageStatus } from '../Helpers/Chat/Recall';

const initialState = {
  id: null,
  data: {}
}

export function RecentChatStatusReducer(state = initialState, action = {}) {

  const { id, data } = action.payload || {}
  if (action.type === RECENT_STATUS_UPDATE) {
    return {
      ...state,
      id,
      data: {
        msgId: data.msgId,
        status: checkMessageStatus(data.participants)
      }
    }
  }
  return state;
}
