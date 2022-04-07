import uuidv4 from 'uuid/v4';
import { UNREAD_MESSAGE_ADD, UNREAD_MESSAGE_UPDATE, UNREAD_MESSAGE_DELETE, RESET_UNREAD_COUNT } from './Constants';

export const UnreadCountAdd = (data) => {
    return {
        type: UNREAD_MESSAGE_ADD,
        payload: {
            id: uuidv4(),
            data
        }
    }
}

export const UnreadCountUpdate = (data) => {
    return {
        type: UNREAD_MESSAGE_UPDATE,
        payload: {
            id: uuidv4(),
            data
        }
    }
}

export const ResetUnreadCount = () => {
    return {
        type: RESET_UNREAD_COUNT
    }
}

export const UnreadCountDelete = (data) => (dispatch) =>
    new Promise((resolve, reject) => {
        dispatch({
            type: UNREAD_MESSAGE_DELETE,
            payload: {
                id: uuidv4(),
                data
            }
        });
        resolve(true)
});
