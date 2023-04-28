import { INSERT_CALL_LOG, FETCHING_CALL_LOG, RESET_CALL_LOG, AUDIO_CALL_MUTE, DELETE_CALL_LOG, CALLLOG, CLEAR_ALL, CLEAR_MESSAGE } from '../Actions/Constants';

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
        case DELETE_CALL_LOG:
            return handleCallLogDelete(state, action)
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

function handleCallLogDelete(state, action) {
    const { type, status, callLogIds } = action.callLog;
    let splittedArr, ismatched = false;
    const newState = { ...state };
    newState.callLogUpdated = !newState.callLogUpdated;
    let newCallLogs = { ...newState.callLogs };

    if (type === CALLLOG && status === CLEAR_ALL) { // clear all callLogs
        for (let key in newCallLogs) {
            if (newCallLogs[key].roomId !== callLogIds && ismatched !== true) {
                delete newCallLogs[key]
            }
            else if (ismatched !== true) {
                delete newCallLogs[key]
                ismatched = true;
            }
        }
        newState.callLogs = newCallLogs;
        return newState;
    }
    else if (type === CALLLOG && status === CLEAR_MESSAGE) { //clear selected callLogs
        splittedArr = callLogIds.split(",");
        for (let key in newCallLogs) {
            if (splittedArr.includes(key)) {
                delete newCallLogs[key]
            }
        }
        newState.callLogs = newCallLogs;
        return newState;
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
