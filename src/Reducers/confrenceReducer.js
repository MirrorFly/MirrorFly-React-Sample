import { CONFRENCE_POPUP_STATUS } from '../Actions/Constants';

export function showConfrenceReducer(state = [], action = {}) {
    if (action.type === CONFRENCE_POPUP_STATUS) {
        return action.payload;
    }
    return state;
}
