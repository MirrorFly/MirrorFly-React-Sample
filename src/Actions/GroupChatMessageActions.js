import uuidv4 from 'uuid/v4';
import {
    GROUP_CHAT_MESSAGE_RESET,
    GROUP_CHAT_MEDIA_ACTION,
    GROUP_CHAT_MEDIA_RESET,
    GROUP_CHAT_MEDIA_UPDATE,
    GROUP_CHAT_SELECTED_MEDIA,
    GROUP_CHAT_SELECTED_MEDIA_RESET,
    SINGLE_CHAT_MESSAGE_RESET,
    SINGLE_CHAT_MEDIA_RESET,
    GROUP_CHAT_MESSAGE_REMOVE,
    GROUP_CHAT_MESSAGE_RECALL
} from './Constants';

export const GroupChatMessageDelete = (messageIds, dispatch) => {
    return new Promise((resolve,reject)=>{
        dispatch({
            type: GROUP_CHAT_MESSAGE_REMOVE,
            payload: {
                id: uuidv4(),
                data:messageIds
            }
        })
        resolve(true)
    })
}

export const updateRecallGroupMessage = (data, dispatch) => {
    return new Promise((resolve,reject)=>{
        dispatch({
            type: GROUP_CHAT_MESSAGE_RECALL,
            payload: {
                id: uuidv4(),
                data
            }
        })
        resolve(true)
    })
}

export const chatResetMessage = (data) => (dispatch) =>
    new Promise((resolve, reject) =>{
        dispatch({
            type: GROUP_CHAT_MESSAGE_RESET,
            payload: {}
        });
        dispatch({
            type: SINGLE_CHAT_MESSAGE_RESET,
            payload: {}
        });
        dispatch({
            type: SINGLE_CHAT_MEDIA_RESET,
            payload: {}
        })
        dispatch({
            type: GROUP_CHAT_MEDIA_RESET,
            payload: {}
        })
        resolve(true)
    });

export const GroupChatMediaDataAction = (data) => {
    return {
        type: GROUP_CHAT_MEDIA_ACTION,
        payload: {
            id: uuidv4(),
            data
        }
    }
}

export const GroupChatMediaResetAction = (data) => {
    return {
        type: GROUP_CHAT_MEDIA_RESET,
        payload: {}
    }
}

export const GroupChatMediaUpdateAction = (data) => {
    return {
        type: GROUP_CHAT_MEDIA_UPDATE,
        payload: {
            id: uuidv4(),
            data
        }
    }
}

export const GroupChatSelectedMediaAction = (data) => {
    return {
        type: GROUP_CHAT_SELECTED_MEDIA,
        payload: {
            id: uuidv4(),
            data
        }
    }
}

export const GroupChatSelectedMediaReset = () => {
    return {
        type: GROUP_CHAT_SELECTED_MEDIA_RESET,
        payload: {}
    }
}

export const GroupChatMessengeReset =()=>{
    return{
        type:GROUP_CHAT_MESSAGE_RESET,
    }
}
