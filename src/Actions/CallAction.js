import {
    CALLCONNECTION_STATE_DATA,
    CONFRENCE_POPUP_STATUS,
    CALL_CONVERSION,
    PIN_USER,
    LARGE_VIDEO_USER,
    CALL_DURATION_TIMESTAMP,
    AUDIO_CALL_MUTE,
    CALL_INTERMEDIATE_SCREEN,
    RESET_CALL_INTERMEDIATE_SCREEN,
    RESET_CONFRENCE_POPUP_STATUS,
    CALL_POOR_CONNECTION_STATUS_POPUP,
    CALL_POOR_CONNECTION_STATUS_ICON,
    CALL_QUALITY
} from './Constants';
import uuidv4 from 'uuid/v4';
import { getLocalUserDetails } from '../Helpers/Chat/User';

let volumeLevelsInDBBasedOnUserJid = [];
let volumeLevelsBasedOnUserJid = [];
let volumeLevelResettingTimeout = null;
let speakingUser = {};
let largeUserJid = null;
let showVoiceDetect = false;
let pinUserData = {};

export const CallConnectionState = (data) => {
    return {
        type: CALLCONNECTION_STATE_DATA,
        payload: {
            id: uuidv4(),
            data
        }
    }
}
export const showConfrence = (data) => {
    return {
        type: CONFRENCE_POPUP_STATUS,
        payload: {
            id: uuidv4(),
            data
        }
    }
}

export const resetConferencePopup = () => {
    return {
        type: RESET_CONFRENCE_POPUP_STATUS,
        payload: {
            id: uuidv4()
        }
    }
}

export const callConversion = (dataObj) => {
    return {
        type: CALL_CONVERSION,
        payload: dataObj || {}
    }
}

export const isMuteAudioAction = (dataObj = false) => {
    return {
        type: AUDIO_CALL_MUTE,
        payload: dataObj
    }
}

export const pinUser = (userJid) => {
    return (dispatch, getState) => {
        const state = getState();
        pinUserData = state.pinUserData;
        userJid = userJid && pinUserData.userJid !== userJid ? userJid : null;

        dispatch({
            type: PIN_USER,
            payload: {
                userJid
            }
        })
    }
}

export const selectLargeVideoUser = (userJid, volumelevel) => {
    return (dispatch, getState) => {
        if (largeUserJid === null) {
            largeUserJid = userJid;
        }
        const state = getState();
        const showConfrenceData = state.showConfrenceData;
        const {
            data: {
                remoteStream = []
            } = {}
        } = showConfrenceData || {};

        let volumeLevelClassName;
        let volumeLevelVideo = 0;
        if (userJid) {
            if (!volumeLevelsBasedOnUserJid[userJid]) {
                volumeLevelsBasedOnUserJid[userJid] = 0.50;
            }
            volumeLevelsInDBBasedOnUserJid[userJid] = volumelevel ? volumelevel : 0;
            if (Object.keys(volumeLevelsInDBBasedOnUserJid).length > 1) {
                let largest = Object.values(volumeLevelsInDBBasedOnUserJid)[0];
                userJid = Object.keys(volumeLevelsInDBBasedOnUserJid)[0];
                for (const index in volumeLevelsInDBBasedOnUserJid) {
                    if (volumeLevelsInDBBasedOnUserJid[index] > largest) {
                        largest = volumeLevelsInDBBasedOnUserJid[index];
                        userJid = index;
                    }
                }
            }

            if (!speakingUser.jid) {
                largeUserJid = userJid;
            }

            if (speakingUser.jid === userJid) {
                if (speakingUser.count >= 2) {
                    largeUserJid = userJid;
                    speakingUser.jid = userJid
                    speakingUser.count = 1
                } else {
                    speakingUser.count += 1;
                }
            } else {
                speakingUser.jid = userJid
                speakingUser.count = 1;
            }
            volumeLevelVideo = volumeLevelsInDBBasedOnUserJid[userJid];
            if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) <= 0) {
                volumeLevelClassName = 0.50;
            } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) <= 1) {
                volumeLevelClassName = 0.52;
            } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) <= 2) {
                volumeLevelClassName = 0.54;
            } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) <= 3) {
                volumeLevelClassName = 0.58;
            } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) <= 4) {
                volumeLevelClassName = 0.60;
            } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) <= 5) {
                volumeLevelClassName = 0.64;
            } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) <= 6) {
                volumeLevelClassName = 0.68;
            } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) <= 7) {
                volumeLevelClassName = 0.72;
            } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) <= 8) {
                volumeLevelClassName = 0.76;
            } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) <= 9) {
                volumeLevelClassName = 0.78;
            } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) <= 10) {
                volumeLevelClassName = 0.80;
            }            

            showVoiceDetect = false;
            if (volumeLevelsBasedOnUserJid[userJid]) {
                if ((volumeLevelsBasedOnUserJid[userJid] === 0.50 && volumeLevelClassName !== 0.50) || (volumeLevelsBasedOnUserJid[userJid] !== 0.50 && volumeLevelClassName === 0.50)) {
                    showVoiceDetect = true;
                }
            }
        } else {
            showVoiceDetect = true;
            const vcardData = getLocalUserDetails();
            if (remoteStream && remoteStream.length > 0) {
                remoteStream.map((rs) => {
                    let id = rs.fromJid;
                    id = id.includes("@") ? id.split("@")[0] : id;
                    if (id !== vcardData.fromUser) {
                        largeUserJid = rs.fromJid
                    }
                });
            }
        }
        volumeLevelsBasedOnUserJid[userJid] = volumeLevelClassName;

        dispatch({
            type: LARGE_VIDEO_USER,
            payload: {
                userJid: largeUserJid,
                volumeLevelsBasedOnUserJid,
                showVoiceDetect,
                volumeLevelVideo: volumeLevelVideo
            }
        });
        if (volumeLevelResettingTimeout !== null && userJid === largeUserJid) {
            clearInterval(volumeLevelResettingTimeout);
            volumeLevelResettingTimeout = null;
        }

        volumeLevelResettingTimeout = setTimeout(() => {
            setTimeout(() => {
                showVoiceDetect = false;
                dispatch({
                    type: LARGE_VIDEO_USER,
                    payload: {
                        userJid: largeUserJid,
                        volumeLevelsBasedOnUserJid,
                        showVoiceDetect
                    }
                });
            }, 1000);
        }, 1000);
    }
}

export const callDurationTimestamp = (timestamp) => {
    return {
        type: CALL_DURATION_TIMESTAMP,
        payload: {
            callDurationTimestamp: timestamp
        }
    }
}

export const resetData = () => {
    volumeLevelsInDBBasedOnUserJid = [];
    volumeLevelsBasedOnUserJid = [];
    volumeLevelResettingTimeout = null;
    speakingUser = {};
    largeUserJid = null;
    showVoiceDetect = false;
    pinUserData = {};
}

export const callIntermediateScreen = (data) => {
    return {
        type: CALL_INTERMEDIATE_SCREEN,
        payload: {
            id: uuidv4(),
            data
        }
    }
}

export const resetCallIntermediateScreen = () => {
    return {
        type: RESET_CALL_INTERMEDIATE_SCREEN,
        payload: {
            id: uuidv4()
        }
    }
}

export const setCallQuality = (data) => {
    return {
        type: CALL_QUALITY,
        payload: {
            id: uuidv4(),
            data
        }
    }
}

export const setPoorConnectionPopUp = (data) => {
    return {
        type: CALL_POOR_CONNECTION_STATUS_POPUP,
        payload: {
            id: uuidv4(),
            data
        }
    }
}

export const setPoorConnectionIcon = (data) => {
    return {
        type: CALL_POOR_CONNECTION_STATUS_ICON,
        payload: {
            id: uuidv4(),
            data
        }
    }
}
