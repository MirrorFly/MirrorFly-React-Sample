import uuidv4 from 'uuid/v4';
import { TYPING_STATUS, TYPING_STATUS_REMOVE } from './Constants';

export const TypingDataAction = (data) => {
    return {
        type: TYPING_STATUS,
        payload: {
            id: uuidv4(),
            data
        }
    }
}


export const TypingDataRemove = (data) => {
    return {
        type: TYPING_STATUS_REMOVE,
        payload: {
            id: uuidv4(),
            data
        }
    }
}
