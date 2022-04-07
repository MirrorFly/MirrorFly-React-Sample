import uuidv4 from 'uuid/v4';
import { POPUP_STATE, TYPED_CONTENT } from './Constants';

export const popUpState = (data) => {
    return {
        type: POPUP_STATE,
        payload: {
            popUpId: uuidv4(),
            localState:data
        }
    }
}

export const saveMessageContent = (data) => {
    return {
        type: TYPED_CONTENT,
        payload: {
            messageContent:data
        }
    }
}
