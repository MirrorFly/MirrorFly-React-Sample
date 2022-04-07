import uuidv4 from 'uuid/v4';
import {
    SINGLE_CHAT_MEDIA, SINGLE_CHAT_MEDIA_RESET,SINGLE_CHAT_MESSAGE_REMOVE,
    SINGLE_CHAT_MEDIA_UPDATE, SINGLE_CHAT_SELECTED_MEDIA, SINGLE_CHAT_SELECTED_MEDIA_RESET,SINGLE_CHAT_MESSAGE_RECALL,UPDATE_GROUP_NAME,
    CHAT_SEEN_PENDING_MSG, DELETE_CHAT_SEEN_PENDING_MSG, CLEAR_CHAT_SEEN_PENDING_MSG
} from './Constants';

export const SingleChatMessageDelete = (messageIds, dispatch) => {
    return new Promise((resolve,reject)=>{
        dispatch({
            type: SINGLE_CHAT_MESSAGE_REMOVE,
            payload: {
                id: uuidv4(),
                data:messageIds
            }
        })
        resolve(true)
    })
}

export const updateRecallMessage = (data, dispatch) => {
    return new Promise((resolve,reject)=>{
        dispatch({
            type: SINGLE_CHAT_MESSAGE_RECALL,
            payload: {
                id: uuidv4(),
                data
            }
        })
        resolve(true)
    })
}

export const SingleChatMediaDataAction = (data) => {
    return {
        type: SINGLE_CHAT_MEDIA,
        payload: {
            id: uuidv4(),
            data
        }
    }
}

export const SingleChatMediaResetAction = (data) => {
    return {
        type: SINGLE_CHAT_MEDIA_RESET,
        payload: {}
    }
}

export const SingleChatMediaUpdateAction = (data) => {
    return {
        type: SINGLE_CHAT_MEDIA_UPDATE,
        payload: {
            id: uuidv4(),
            data
        }
    }
}

export const SingleChatSelectedMediaAction = (data) => {
    return {
        type: SINGLE_CHAT_SELECTED_MEDIA,
        payload: {
            id: uuidv4(),
            data
        }
    }
}

export const SingleChatSelectedMediaReset = () => {
    return {
        type: SINGLE_CHAT_SELECTED_MEDIA_RESET,
        payload: {}
    }
}

export const updateGroupName = (data)=> {
    return {
        type:UPDATE_GROUP_NAME,
        payload:{
            id: uuidv4(),
            data
        }
    }
}

/**
 * When user chat application is in different tab or minimized scenario
 * shouldn't send the message seen status. At this time, store those messages
 * here & when user come back to application, get the message from here & send seen status
 * @param {*} messageObj
 */
export const chatSeenPendingMsg = (messageObj) => {
    return {
        type:CHAT_SEEN_PENDING_MSG,
        payload:{
            messageObj
        }
    }
}

export const deleteChatSeenPendingMsg = (messageId) => {
    return {
        type:DELETE_CHAT_SEEN_PENDING_MSG,
        payload:{
            messageId
        }
    }
}

export const clearChatSeenPendingMsg = () => {
    return {
        type:CLEAR_CHAT_SEEN_PENDING_MSG
    }
}
