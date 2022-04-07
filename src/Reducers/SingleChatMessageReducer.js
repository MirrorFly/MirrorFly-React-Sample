import uuidv4 from 'uuid/v4';
import {
    SINGLE_CHAT_MESSAGE_HISTORY, SINGLE_CHAT_MEDIA, SINGLE_CHAT_MEDIA_RESET,
    SINGLE_CHAT_MEDIA_UPDATE, SINGLE_CHAT_SELECTED_MEDIA, SINGLE_CHAT_SELECTED_MEDIA_RESET,
    SINGLE_CHAT_MESSAGE_RESET, SINGLE_CHAT_MESSAGE_REMOVE, SINGLE_CHAT_MESSAGE_RECALL, CHAT_SEEN_PENDING_MSG,
    CLEAR_CHAT_SEEN_PENDING_MSG, DELETE_CHAT_SEEN_PENDING_MSG
} from '../Actions/Constants';
import { updateRecall } from '../Helpers/Chat/Recall'
import { concatMedia, concatMessageArray } from '../Helpers/Chat/ChatHelper'

const initialState = {
    id: null,
    data: []
}

const removeMessage = (newMesssage, existingArray) => {
    return existingArray.filter((message) => {
        const { broadcast_msgid, msgId } = message
        let updateMessageId = broadcast_msgid || msgId
        return newMesssage.indexOf(updateMessageId) === -1;
    });
}

export function SingleChatMessageReducer(state = initialState, action = {}) {
    const { id, data } = action.payload || {}
    switch (action.type) {
        case SINGLE_CHAT_MESSAGE_HISTORY:
            return {
                ...state,
                ...{
                    id: id,
                    data: data.length > 0 ? concatMessageArray(data, state.data, 'msgId', 'timestamp') : []
                }
            };
        case SINGLE_CHAT_MESSAGE_RECALL:
            return {
                ...state,
                id,
                data: updateRecall(data, state.data)
            }
        case SINGLE_CHAT_MESSAGE_REMOVE:
            return {
                ...state,
                ...{
                    id: id,
                    data: removeMessage(data, state.data)
                }
            };
        case SINGLE_CHAT_MESSAGE_RESET:
            return {
                id,
                data: []
            }
        default:
            return state;
    }
}

export function SingleChatMediaReducer(state = initialState, action) {
    const { id, data } = action.payload || {}
    switch (action.type) {
        case SINGLE_CHAT_MEDIA:
            return {
                ...state,
                ...{
                    id: id,
                    data: concatMedia(data, state.data)
                }
            };
        case SINGLE_CHAT_MEDIA_UPDATE:
            return {
                id: id,
                data: data
            };
        case SINGLE_CHAT_MEDIA_RESET:
            return {
                id: null,
                data: []
            }
        default:
            return state;
    }
}

export function SingleChatSelectedMediaReducer(state = [], action) {
    switch (action.type) {
        case SINGLE_CHAT_SELECTED_MEDIA:
            return action.payload
        case SINGLE_CHAT_SELECTED_MEDIA_RESET:
            return {
                id: null,
                data: []
            }
        default:
            return state
    }
}

export const chatSeenPendingMsgReducer = (state = { id: uuidv4(), data: [] }, action = {}) => {
    let { id, data } = state;
    switch (action.type) {
        case CHAT_SEEN_PENDING_MSG:
            const messageObj = action?.payload?.messageObj;
            if (messageObj) {
                id = uuidv4();
                data.push(messageObj);
            }
            return {
                id,
                data
            }
        case DELETE_CHAT_SEEN_PENDING_MSG:
            const msgIndex = data.findIndex(msg => msg.msgId === action.payload.messageId);
            if (msgIndex > -1) {
                id = uuidv4();
                data.splice(msgIndex, 1);
            }
            return {
                id: id,
                data: data
            };
        case CLEAR_CHAT_SEEN_PENDING_MSG:
            return {
                id: uuidv4(),
                data: []
            }
        default:
            return state;
    }
}
