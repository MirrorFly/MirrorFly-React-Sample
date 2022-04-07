import {
    CALLCONNECTION_STATE_DATA,
    CONFRENCE_POPUP_STATUS,
    CALL_CONVERSION,
    PIN_USER,
    LARGE_VIDEO_USER,
    CALL_DURATION_TIMESTAMP,
    AUDIO_CALL_MUTE
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

        let volumeLevelClassName = 0.50;
        if (userJid) {
            if (!volumeLevelsBasedOnUserJid[userJid]) {
                volumeLevelsBasedOnUserJid[userJid] = 0.50;
            }
            volumeLevelsInDBBasedOnUserJid[userJid] = volumelevel ? volumelevel : -100;
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

            if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) > -10) {
                volumeLevelClassName = 0.80;
            } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) > -20) {
                volumeLevelClassName = 0.76;
            } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) > -30) {
                volumeLevelClassName = 0.72;
            } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) > -40) {
                volumeLevelClassName = 0.68;
            } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) > -50) {
                volumeLevelClassName = 0.62;
            } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) > -60) {
                volumeLevelClassName = 0.58;
            } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) > -70) {
                volumeLevelClassName = 0.54;
            } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) > -80) {
                volumeLevelClassName = 0.50;
            } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) > -90) {
                volumeLevelClassName = 0.50;
            } else if (parseInt(volumeLevelsInDBBasedOnUserJid[userJid]) > -95) {
                volumeLevelClassName = 0.50;
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
                showVoiceDetect
            }
        });
        if (volumeLevelResettingTimeout !== null && userJid === largeUserJid) {
            clearInterval(volumeLevelResettingTimeout);
            volumeLevelResettingTimeout = null;
        }

        volumeLevelResettingTimeout = setTimeout(() => {
            volumeLevelsBasedOnUserJid[largeUserJid] = 0.50;
            showVoiceDetect = true;
            dispatch({
                type: LARGE_VIDEO_USER,
                payload: {
                    userJid: largeUserJid,
                    volumeLevelsBasedOnUserJid,
                    showVoiceDetect
                }
            });
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
