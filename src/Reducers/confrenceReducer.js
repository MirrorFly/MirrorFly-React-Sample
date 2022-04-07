import { CONFRENCE_POPUP_STATUS, RESET_CONFRENCE_POPUP_STATUS } from '../Actions/Constants';

const initialState = {
    id: null,
    data: {}
  };

export function showConfrenceReducer(state = [], action = {}) {
    if (action.type === CONFRENCE_POPUP_STATUS) {
        return action.payload;
    } else if (action.type === RESET_CONFRENCE_POPUP_STATUS) {
        return initialState;
    }
    return state;
}
