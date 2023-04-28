import { INSERT_CALL_LOG, FETCHING_CALL_LOG, RESET_CALL_LOG, DELETE_CALL_LOG } from './Constants';

export const insertCallLog = (callLog) => {
    return {
        type: INSERT_CALL_LOG,
        callLog
    }
}

export const deleteAllCallLog = (callLog) => {
    return {
        type: DELETE_CALL_LOG,
        callLog
    }
}

export const fetchingCallLog = (isFetchingCallLog) => {
    return {
        type: FETCHING_CALL_LOG,
        isFetchingCallLog
    }
}

export const resetCallLog = () => {
    return {
        type: RESET_CALL_LOG
    }
}
