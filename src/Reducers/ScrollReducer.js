import { SCROLL_DOWN_CHAT_HISTORY } from '../Actions/Constants';
import uuidv4 from 'uuid/v4';
const scrollDownInitState = {
    id: uuidv4()
}
export function scrollBottomChatHistoryReducer(state = scrollDownInitState, action = {}) {
    if (action.type === SCROLL_DOWN_CHAT_HISTORY) {
        return action.payload;
    }
    return state;
}
