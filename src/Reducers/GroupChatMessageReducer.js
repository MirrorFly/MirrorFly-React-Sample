import {
    GROUP_CHAT_MESSAGE_HISTORY,
    GROUP_CHAT_MESSAGE_RESET,
    GROUP_CHAT_MEDIA_ACTION,
    GROUP_CHAT_MEDIA_RESET,
    GROUP_CHAT_MEDIA_UPDATE,
    GROUP_CHAT_SELECTED_MEDIA,
    GROUP_CHAT_SELECTED_MEDIA_RESET,
    GROUP_CHAT_MESSAGE_REMOVE,
    GROUP_CHAT_MESSAGE_UPDATE_STATUS,
    GROUP_CHAT_MESSAGE_RECALL
} from '../Actions/Constants';
import { updateRecall, checkMessageStatus } from '../Helpers/Chat/Recall'
import { concatMedia, concatMessageArray } from '../Helpers/Chat/ChatHelper'

const initialState = {
    id: null,
    data: []
}

const removeMessage = (newMesssage, existingArray) => {
    return existingArray.filter((message) => {
        return newMesssage.indexOf(message.msgId) === -1;
    });
}

const updateStatus = (newMesssage, existingArray) => {
    const { msgId, participants } = newMesssage
    return existingArray.map((message) => {
        if (msgId === message.msgId) {
            return {
                ...message,
                msgStatus: checkMessageStatus(participants)
            }
        }
        return message
    });
}

export function GroupChatMessageReducer(state = initialState, action = {}) {
    const { id, data } = action.payload || {}
    switch (action.type) {
        case GROUP_CHAT_MESSAGE_HISTORY:
            return {
                ...state,
                ...{
                    id: id,
                    data: concatMessageArray(data, state.data, 'msgId', 'timestamp')
                }
            };
        case GROUP_CHAT_MESSAGE_UPDATE_STATUS:
            return {
                ...state,
                ...{
                    id: id,
                    data: updateStatus(data, state.data)
                }
            };
        case GROUP_CHAT_MESSAGE_RECALL:
            return {
                ...state,
                id,
                data: updateRecall(data, state.data)
            }
        case GROUP_CHAT_MESSAGE_REMOVE:
            return {
                ...state,
                ...{
                    id: id,
                    data: removeMessage(data, state.data)
                }
            };
        case GROUP_CHAT_MESSAGE_RESET:
            return {
                id: null,
                data: []
            }
        default:
            return state;
    }
}

export function GroupChatMediaReducer(state = initialState, action = {}) {
    const { id, data } = action.payload || {}
    switch (action.type) {
        case GROUP_CHAT_MEDIA_ACTION:
            return {
                ...state,
                ...{
                    id: id,
                    data: concatMedia(data, state.data)
                }
            };
        case GROUP_CHAT_MEDIA_UPDATE:
            return {
                id: id,
                data: data
            };
        case GROUP_CHAT_MEDIA_RESET:
            return {
                id: null,
                data: []
            }
        default:
            return state;
    }
}

export function GroupChatSelectedMediaReducer(state = [], action = {}) {
    switch (action.type) {
        case GROUP_CHAT_SELECTED_MEDIA:
            return action.payload
        case GROUP_CHAT_SELECTED_MEDIA_RESET:
            return {
                id: null,
                data: []
            }
        default:
            return state
    }
}
