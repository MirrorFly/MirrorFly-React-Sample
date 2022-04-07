import { SCROLL_DOWN_CHAT_HISTORY } from './Constants';
import uuidv4 from 'uuid/v4';

export const scrollBottomChatHistoryAction = () => {
    return {
        type: SCROLL_DOWN_CHAT_HISTORY,
        payload: {
            id: uuidv4()
        }
    }
}
