import { CALLCONNECTION_STATE_DATA, CALL_CONVERSION, PIN_USER, LARGE_VIDEO_USER, CALL_DURATION_TIMESTAMP } from '../Actions/Constants';

export function CallConnectionStateReducer(state = [], action = {}) {
    if (action.type === CALLCONNECTION_STATE_DATA) {
        return action.payload;
    }
    return state;
}

export function callConversionReducer(state = {}, action = {}) {
    if (action.type === CALL_CONVERSION) {
        return action.payload;
    }
    return state;
}

export function pinUserReducer(state = {}, action = {}) {
    if (action.type === PIN_USER) {
        return action.payload;
    }
    return state;
}

export function largeVideoUserReducer(state = {}, action = {}) {
    if (action.type === LARGE_VIDEO_USER) {
        return action.payload;
    }
    return state;
}

export function callDurationTimestampReducer(state = {}, action = {}) {
    if (action.type === CALL_DURATION_TIMESTAMP) {
        return action.payload;
    }
    return state;
}
