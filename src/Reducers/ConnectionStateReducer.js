import uuidv4 from 'uuid/v4';
import { CONNECTION_STATE_DATA } from '../Actions/Constants';

export function ConnectionStateReducer(state = { id: uuidv4(), data: null }, action = {}) {
    if (action.type === CONNECTION_STATE_DATA) {
        return action.payload;
    }
    return state;
}
