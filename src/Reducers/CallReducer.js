import { CALLCONNECTION_STATE_DATA, CALL_CONVERSION, PIN_USER, LARGE_VIDEO_USER, CALL_DURATION_TIMESTAMP, CALL_POOR_CONNECTION_STATUS_POPUP, CALL_POOR_CONNECTION_STATUS_ICON, CALL_QUALITY } from '../Actions/Constants';

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

const initialStateQuality = {
    id: null,
    data: "GOOD"
};

const initialStatePopupAndIcon = {
    id: null,
    data: false
};

export function callQualityReducer(state = initialStateQuality, action = {}) {
    if (action.type === CALL_QUALITY) {
        return action.payload;
    }
    return state;
}

export function callQualityPopupReducer(state = initialStatePopupAndIcon, action = {}) {
    if (action.type === CALL_POOR_CONNECTION_STATUS_POPUP) {
        return action.payload;
    }
    return state;
}

export function callQualityIconReducer(state = initialStatePopupAndIcon, action = {}) {
    if (action.type === CALL_POOR_CONNECTION_STATUS_ICON) {
        return action.payload;
    }
    return state;
}
