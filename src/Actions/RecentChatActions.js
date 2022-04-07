import uuidv4 from 'uuid/v4';
import {
    RECENT_CHAT_DATA, RECENT_NOTIFICATION_UPDATE,
    RECENT_ROSTER_UPDATE, ACTIVE_CHAT_DATA,
    ACTIVE_CHAT_UPDATE, DELETE_SINGLE_CHAT, SINGLE_CHAT_MESSAGE_RESET, UPDATE_ROSTER_LAST_MESSAGE, RESET_TO_DEFAULT, RESET_RECENT_CHAT,
    UPDATE_MSG_BY_LAST_MSGID,
    MODAL_ACTIVE_CLASS,
    RECONNECT_RECENT_CHAT_UPDATE,
    UPDATE_MUTE_RECENT_CHAT,
    UPDATE_ARCHIVE_RECENT_CHAT
} from './Constants';

export const RecentChatAction = (data, refreshUnreadCount) => {
    return {
        type: RECENT_CHAT_DATA,
        payload: {
            id: uuidv4(),
            data,
            refreshUnreadCount: !!refreshUnreadCount
        }
    }
}

export const ReconnectRecentChatAction = (data, refreshUnreadCount) => {
    return {
        type: RECONNECT_RECENT_CHAT_UPDATE,
        payload: {
            id: uuidv4(),
            data,
            refreshUnreadCount
        }
    }
}

export const RecentChatUpdateAction = (newMessage) => {
    const { filterBy, ...rest } = newMessage
    return {
        type: ACTIVE_CHAT_UPDATE,
        payload: {
            id: uuidv4(),
            data: rest,
            filterBy
        }
    }
}

export const RecentChatUpdateNotification = (newMessage) => {
    const { filterBy, ...rest } = newMessage
    return {
        type: RECENT_NOTIFICATION_UPDATE,
        payload: {
            id: uuidv4(),
            data: rest,
            filterBy
        }
    }
}

export const RecentChatRoster = (rosterData) => {
    return {
        type: RECENT_ROSTER_UPDATE,
        payload: {
            rosterData
        }
    }
}
export const ResetActiveChatAction = () => {
    return {
        type: SINGLE_CHAT_MESSAGE_RESET,
        payload: {
            id: uuidv4(),
        }
    }
}

export const ActiveChatAction = (data) => {
    return {
        type: ACTIVE_CHAT_DATA,
        payload: {
            id: uuidv4(),
            data
        }
    }
}

export const ActiveChatResetAction = () => {
    return {
        type: RESET_TO_DEFAULT
    }
}

export const modalActiveClassAction = (data = false) => {
    return {
        type: MODAL_ACTIVE_CLASS,
        payload: data
    }
}

export const deleteActiveChatAction = (data) => {
    return {
        type: DELETE_SINGLE_CHAT,
        payload: {
            id: uuidv4(),
            data
        }
    }
}
export const clearLastMessageinRecentChat = (data) => {
    return {
        type: UPDATE_ROSTER_LAST_MESSAGE,
        payload: {
            id: uuidv4(),
            data
        }
    }
}

export const resetRecentChat = () => {
    return {
        type: RESET_RECENT_CHAT
    }
}

export const updateMsgByLastMsgId = (data) => {
    return {
        type: UPDATE_MSG_BY_LAST_MSGID,
        payload: {
            id: uuidv4(),
            data
        }
    }
}

export const updateMuteStatusRecentChat = (data) => {
    return {
        type: UPDATE_MUTE_RECENT_CHAT,
        payload: {
            id: uuidv4(),
            data
        }
    }
}

export const updateArchiveStatusRecentChat = (data) => {
    return {
        type: UPDATE_ARCHIVE_RECENT_CHAT,
        payload: {
            id: uuidv4(),
            data
        }
    }
}
