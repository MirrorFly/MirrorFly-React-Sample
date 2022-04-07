import { TYPING_STATUS, TYPING_STATUS_REMOVE } from '../Actions/Constants';

const concatTyping = (array1, array2) => {
    const { fromUserId } = array2
    let index = array1.findIndex(el => el.fromUserId === fromUserId);
    if (index > -1) return array1;
    array1.unshift(array2);
    return array1;
}
const removeTyping = (existingArray, fromUserId) => existingArray.filter((message) => message.fromUserId !== fromUserId )

const initialState = {
    id: null,
    data: []
}

export function TypingReducer(state = initialState, action = {}) {
    const { payload: { id, data } = {} } = action
    switch (action.type) {
        case TYPING_STATUS:
            return {
                ...state,
                ...{
                    id: id,
                    data: concatTyping(state.data, data)
                }
            }
        case TYPING_STATUS_REMOVE:
            const { fromUserId } = data
            return {
                ...state,
                ...{
                    id: id,
                    data: removeTyping(state.data, fromUserId)
                }
            }
        default:
            return state;
    }
}
