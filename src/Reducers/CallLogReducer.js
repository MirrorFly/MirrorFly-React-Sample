import { INSERT_CALL_LOG, FETCHING_CALL_LOG, RESET_CALL_LOG, AUDIO_CALL_MUTE } from '../Actions/Constants';

const CALL_LOGS_DEFAULT_STATE = {
    isFetchingCallLog: false,
    callLogUpdated: false,
    callLogs: {},
    callAudioMute: false,
}

export const callLogReducer = (state = CALL_LOGS_DEFAULT_STATE, action = {}) => {
    switch (action.type) {
        case INSERT_CALL_LOG:
            return insertCallLog(state, action);
        case FETCHING_CALL_LOG:
            return { ...state, isFetchingCallLog: action.isFetchingCallLog }
        case RESET_CALL_LOG:
            return { ...CALL_LOGS_DEFAULT_STATE }
        case AUDIO_CALL_MUTE:
            return {
                ...state,
                callAudioMute:action.payload
            }
        default:
            return state;
    }
}

function insertCallLog(state, action) {
    const newState = { ...state };
    const { callLog } = action;
    newState.callLogUpdated = !newState.callLogUpdated;
    const newCallLogs = { ...newState.callLogs };
    newCallLogs[callLog.roomId] = callLog;
    newState.callLogs = newCallLogs;
    return newState;
}
