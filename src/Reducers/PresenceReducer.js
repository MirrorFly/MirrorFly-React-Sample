import { PRESENCE_STATUS } from '../Actions/Constants';

export function PresenceReducer(state = [], action = {}) {
    if (action.type === PRESENCE_STATUS) {
        return action.payload;
    }
    return state;
}
