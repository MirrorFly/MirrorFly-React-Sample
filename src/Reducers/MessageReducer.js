import {
    MESSAGE_DATA, REPLY_MESSAGE_DATA, REPLY_MESSAGE_RESET,
    MESSAGE_INFO_DATA, MESSAGE_INFO_UPDATE, MESSAGE_FORWARD_ADD, MESSAGE_FORWARD_REMOVE,
    MESSAGE_FORWARD_RESET
} from '../Actions/Constants';
import { changeTimeFormat } from '../Helpers/Chat/RecentChat'
import { getMsgStatusInOrder } from '../Helpers/Chat/ChatHelper';

export function MessageReducer(state = [], action = {}) {
    if (action.type === MESSAGE_DATA) {
        return action.payload;
    }
    return state;
}

const updateReplyMessage = (newMessage, replyMessageArray = []) => {
    const firstObject = newMessage;
    if (!firstObject) return [];
    const checkalreadyExist = replyMessageArray.find(message => (message && message.replyMsgId === firstObject.replyMsgId));
    if (!checkalreadyExist) {
        return [...replyMessageArray, firstObject]
    }
    return replyMessageArray; //.concat(firstObject);
}

export function ReplyMessageReducer(state = [], action = {}) {
    const { payload: { id, data } = {} } = action
    switch (action.type) {
        case REPLY_MESSAGE_DATA:
            return {
                ...state,
                id,
                data: updateReplyMessage(data, state.data)
            }
        case REPLY_MESSAGE_RESET:
            return {
                id: null,
                data: []
            }
        default:
            return state;
    }
}

function stringContainjid(s, word) {
    return new RegExp('\\b' + word + '\\b', 'i').test(s);
}

const updateMessageInfo = (time, activeUserId, messageStatus, participants = []) => {
    return participants.map(participant => {
        const { userId, deliveredTime, seenTime, msgStatus } = participant

        if (stringContainjid(activeUserId, userId)) {
            return {
                ...participant,
                ...(messageStatus === 1 && { deliveredTime: (time && deliveredTime === '0000-00-00 00:00:00') ? changeTimeFormat(time) : deliveredTime }),
                ...(messageStatus === 2 && { seenTime: (time && seenTime === '0000-00-00 00:00:00') ? changeTimeFormat(time) : seenTime }),
                msgStatus: getMsgStatusInOrder(msgStatus, messageStatus)
            }
        }
        return participant;
    })
}

export function messageInfoReducer(state = [], action = {}) {

    const { payload: { id, data, activeUserId, messageStatus = '', time } = {} } = action
    switch (action.type) {
        case MESSAGE_INFO_DATA:
            return {
                ...state,
                id,
                data: data
            }
        case MESSAGE_INFO_UPDATE:
            return {
                ...state,
                id,
                data: {
                    ...state.data,
                    participants: updateMessageInfo(time, activeUserId, messageStatus, state.data?.participants)
                }
            }

        default:
            return state;
    }
}


const initialState = {
    id: null,
    data: [],
    totalMessage: 0
}

export function messageForwardReducer(state = initialState, action = {}) {
    const { payload: { id, data } = {} } = action
    switch (action.type) {
        case MESSAGE_FORWARD_ADD:
            const updatedArray = [...state.data, data]
            return {
                ...state,
                id,
                data: updatedArray,
                totalMessage: updatedArray.length
            }
        case MESSAGE_FORWARD_REMOVE:
            const filterMessage = state.data.filter(ele => ele.msgId !== data)
            return {
                ...state,
                id,
                data: filterMessage,
                totalMessage: filterMessage.length
            }
        case MESSAGE_FORWARD_RESET:
            return initialState
        default:
            return state;
    }
}
