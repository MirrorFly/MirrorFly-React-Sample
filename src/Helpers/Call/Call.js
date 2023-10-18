import {
    getFormatPhoneNumber,
    getInitialsFromName,
    getUserIdFromJid
} from '../Utility';
import Store from '../../Store';
import {
    selectLargeVideoUser,
    pinUser,
    showConfrence
} from '../../Actions/CallAction';
import {
    CALL_RINGING_DURATION,
    CALL_SESSION_STATUS_CLOSED,
    CALL_STATUS_CALLING,
    CALL_STATUS_DISCONNECTED,
    CALL_STATUS_RINGING,
    DISCONNECTED_SCREEN_DURATION
} from '../../Helpers/Call/Constant';
import callLogs from '../../Components/WebCall/CallLogs/callLog';
import {
    getLocalUserDetails,
    getUserDetails,
    initialNameHandle
} from '../Chat/User';
import {
    REACT_APP_MAX_USERS_CALL
} from '../../Components/processENV';
import SDK from '../../Components/SDK';
import {
    removeRemoteStream,
    resetCallData
} from '../../Components/callbacks';
import browserNotify from '../Browser/BrowserNotify';
import {
    callLinkToast
} from '../../Components/ToastServices/CustomToast';
import { getFromLocalStorageAndDecrypt, encryptAndStoreInLocalStorage, deleteItemFromLocalStorage} from '../../Components/WebChat/WebChatEncryptDecrypt';

let callingRemoteStreamRemovalTimer = null;
let missedCallNotificationTimer = null;

/**
 * Determines whether a specific string is a valid room name.
 *
 * @param {(string|undefined)} room - The name of the conference room to check
 * for validity.
 * @returns {boolean} If the specified room name is valid, then true; otherwise,
 * false.
 */
export function isRoomValid(roomId) {
    return Boolean(roomId);
}

/**
 * Determines whether a specific string is a valid call mode.
 *
 * @param {(string|undefined)} room - The name of the conference room to check
 * for validity.
 * @returns {boolean} If the specified room name is valid, then true; otherwise,
 * false.
 */
export function isCallModeValid(callMode) {
    return ['onetoone', 'onetomany'].indexOf(callMode) > -1;
}

/**
 * Return the user details such as name, image from current call info
 *
 * @param {(object)} callData - current call CALLING respone data
 * @param {(object)} localUserData - local user details
 * @param {(object)} object - contains the local user contact list & group list details
 * @return {object}
 */
export function getCallUsersDetails(callData, localUserData, {
    localRoster: localRoster,
    groupList: groupList
}) {
    let userDetailObj = {};
    if (!callData || !localUserData) {
        return userDetailObj;
    }
    let currentUser = localUserData?.fromuser;
    let userListArr = callData.userList ? callData.userList.split(',') : [];
    let userListLength = userListArr.length;
    if (callData.callMode === 'onetoone' && userListLength && localRoster && Array.isArray(localRoster) && localRoster.length > 0) {
        userListArr.push(callData.from);
        const userListNumberArr = userListArr.map((user) => user.split('@')[0]);
        let displayName = null;
        localRoster.forEach((roster) => {
            let rosterJid = roster.username || roster.jid;
            let currentUserIndex = userListNumberArr.indexOf(rosterJid);
            if (currentUser && currentUserIndex > -1 && currentUser !== rosterJid) {
              userDetailObj = {
                ...roster
              };
              const name = userDetailObj.displayName || userDetailObj.name || getFormatPhoneNumber(userListNumberArr[currentUserIndex]);
              displayName = displayName ? `${displayName}, ${name}` : name;
              userDetailObj['image'] = userListLength > 1 ? null : userDetailObj.image;
            }
        }); 
        userDetailObj['displayName'] = displayName;

        if (!userDetailObj.displayName) {
            userListNumberArr.map((userNumber) => {
                if (currentUser && currentUser !== userNumber) {
                    const formatNumber = getFormatPhoneNumber(userNumber);
                    userDetailObj['displayName'] = userDetailObj.displayName ? `${userDetailObj.displayName}, ${formatNumber}` : formatNumber;
                }
            })
        }
    }

    if (callData.callMode === 'onetomany' && groupList && groupList.length) {
        groupList.map((group) => {
            let groupJid = group.groupId;
            let user = callData.groupId || callData.to;
            user = user && user.includes("@") ? user.split('@')[0] : user;
            if (groupJid === user) {
                userDetailObj['displayName'] = group.groupName;
                userDetailObj['image'] = group.groupImage;
                userDetailObj['jid'] = groupJid;
            }
        })
    }
    userDetailObj['totalMembers'] = userListLength;
    userDetailObj['chatType'] = callData.callMode === 'onetomany' ? 'groupchat' : 'chat';
    return {
        ...userDetailObj
    };
}

function getFromJidFromRemoteStream(remoteStream) {
    const vcardData = getLocalUserDetails();
    let fromJid = "";
    if (remoteStream.length > 0) {
        remoteStream.map((rs) => {
            let id = rs.fromJid;
            id = id.includes("@") ? id.split("@")[0] : id;
            if (id !== vcardData.fromUser) {
                fromJid = rs.fromJid
            }
        });
    }
    return fromJid;
}

/**
 * Hanlde the check whether the call conversion request popup display or not
 * 
 * @param {*} showConfrenceData 
 */
export function requestCallConversion(showConfrenceData = {}, callMode = '') {
    const data = showConfrenceData.data || {};
    const {
        remoteStream,
        localVideoMuted,
        remoteVideoMuted
    } = data;
    if (remoteStream && Array.isArray(remoteStream) && remoteStream.length === 2 && callMode === 'onetoone') {
        let fromJid = getFromJidFromRemoteStream(remoteStream);
        return localVideoMuted && fromJid && remoteVideoMuted[fromJid];
    }
    return false;
}

export function resetPinAndLargeVideoUser(fromJid) {
    if (!fromJid) {
        Store.dispatch(selectLargeVideoUser());
        Store.dispatch(pinUser());
    }
    const state = Store.getState();
    const largeVideoUserData = state.largeVideoUserData;
    if (largeVideoUserData.userJid === fromJid) {
        Store.dispatch(selectLargeVideoUser());
    }
    // If pinned user disconnected from the call, Need to remove the user.
    const pinUserData = state.pinUserData;
    if (pinUserData.userJid === fromJid) {
        Store.dispatch(pinUser(fromJid));
    }
}

export function dispatchDisconnected(statusMessage, remoteStreams = []) {
    const {
        getState,
        dispatch
    } = Store;
    const showConfrenceData = getState().showConfrenceData;
    const {
        data
    } = showConfrenceData;
    statusMessage = statusMessage || CALL_STATUS_DISCONNECTED;
    dispatch(showConfrence({
        ...(data || {}),
        callStatusText: statusMessage,
        remoteStream: remoteStreams.length > 1 ? remoteStreams : data.remoteStream,
        stopSound: true
    }))
}

export const disconnectCallConnection = (remoteStreams = []) => {
    const callConnectionData = JSON.parse(getFromLocalStorageAndDecrypt('call_connection_status'))
    SDK.endCall();
    dispatchDisconnected(CALL_STATUS_DISCONNECTED, remoteStreams);
    callLogs.update(callConnectionData.roomId, {
        "endTime": callLogs.initTime(),
        "sessionStatus": CALL_SESSION_STATUS_CLOSED
    });
    let timeOut = getFromLocalStorageAndDecrypt("isNewCallExist") === true ? 0 : DISCONNECTED_SCREEN_DURATION;
    setTimeout(() => {
        encryptAndStoreInLocalStorage('callingComponent', false)
        deleteItemFromLocalStorage('roomName')
        deleteItemFromLocalStorage('callType')
        deleteItemFromLocalStorage('call_connection_status');
        deleteItemFromLocalStorage('inviteStatus');
        encryptAndStoreInLocalStorage("hideCallScreen", false);
        resetCallData();
        Store.dispatch(showConfrence({
            showComponent: false,
            showCalleComponent: false,
            callStatusText: null,
            showStreamingComponent: false
        }))
    }, timeOut);
}

export function getCallDuration(timerTime) {
    if (!timerTime) return "";
    let seconds = ("0" + (Math.floor(timerTime / 1000) % 60)).slice(-2);
    let minutes = ("0" + (Math.floor(timerTime / 60000) % 60)).slice(-2);
    let hours = ("0" + Math.floor(timerTime / 3600000)).slice(-2);
    const minAndSecs = `${minutes}:${seconds}`;
    return hours > 0 ? `${hours}:${minAndSecs}` : minAndSecs;
}

/**
 * onetoone call, there is a feature called CALL SWITCH. So
 * Need update the callType after converted the audio call to video and
 * When both the user mute the call again conerted the video call to audio
 * 
 * @param {*} param0 
 * @param {*} localVideoMuted 
 */
export function updateCallTypeAfterCallSwitch(videoMuted) {
    const {
        getState
    } = Store;
    const showConfrenceData = getState().showConfrenceData;
    const {
        data
    } = showConfrenceData;
    let {
        remoteStream,
        localVideoMuted,
        remoteVideoMuted
    } = data || {};
    localVideoMuted = typeof videoMuted != "undefined" ? videoMuted : localVideoMuted;
    const callConnectionStatus = JSON.parse(getFromLocalStorageAndDecrypt('call_connection_status'));
    if (!callConnectionStatus) return;

    let callType = null;
    if (remoteStream && Array.isArray(remoteStream) && remoteStream.length === 2 && callConnectionStatus.callMode === 'onetoone') {
        let fromJid = getFromJidFromRemoteStream(remoteStream);

        if (localVideoMuted && fromJid && remoteVideoMuted[fromJid]) {
            callType = "audio";
        } else {
            callType = "video";
        }

        if (callType && callType !== callConnectionStatus.callType) {
            callConnectionStatus.callType = callType;
            encryptAndStoreInLocalStorage("call_connection_status", JSON.stringify(callConnectionStatus));
            callLogs.update(callConnectionStatus.roomId, {
                callType
            });
        }
    }
}

export const clearOldCallingTimer = () => {
    if (callingRemoteStreamRemovalTimer !== null) {
        clearTimeout(callingRemoteStreamRemovalTimer);
        callingRemoteStreamRemovalTimer = null;
    }
}

export const startCallingTimer = () => {
    clearOldCallingTimer();
    callingRemoteStreamRemovalTimer = setTimeout(() => {
        const {
            getState,
            dispatch
        } = Store;
        const showConfrenceData = getState().showConfrenceData;
        const {
            data
        } = showConfrenceData;
        if (data.remoteStream) {
            let remoteStreams = [...data.remoteStream];
            let remoteStreamsUpdated = [...data.remoteStream];
            if (remoteStreams) {
                remoteStreams.forEach((stream) => {
                    if (stream.status && (stream.status.toLowerCase() === CALL_STATUS_CALLING || stream.status.toLowerCase() === CALL_STATUS_RINGING)) {
                      removeRemoteStream(stream.fromJid);
                      remoteStreamsUpdated = remoteStreamsUpdated.map((ele) => {
                        if (ele.fromJid !== stream.fromJid) {
                          return ele;
                        } else {
                          return undefined;
                        }
                      }).filter(e => e !== undefined);
                    } else {
                      return undefined;
                    }
                  });                  
                if (remoteStreamsUpdated.length > 1) {
                    dispatch(showConfrence({
                        ...(data || {}),
                        remoteStream: remoteStreamsUpdated
                    }));
                } else {
                    disconnectCallConnection(remoteStreams);
                }
            }
        }

    }, CALL_RINGING_DURATION)
}

export const getMaxUsersInCall = () => REACT_APP_MAX_USERS_CALL ? REACT_APP_MAX_USERS_CALL : 8;

export const getCallDisplayDetailsForOnetoManyCall = (userList, type) => {
    let rosterData = {};
    let displayNames = [];
    let displayName = "";
    let vcardData = getLocalUserDetails();
    let participantsData = [];
    if (type !== "subscribe") {
        displayNames.push("You");
        participantsData.push({
            image: vcardData.image,
            thumbImage: vcardData.thumbImage,
            userId: vcardData.fromUser,
            name: vcardData.nickName,
            initialName: getInitialsFromName(vcardData.nickName)
        });
    }
    let currentUserPresentInCall = false;
    userList.map((us) => {
        const phoneNumber = us.includes("@") ? us.split("@")[0] : us;
        if (phoneNumber !== vcardData.fromUser) {
            const roster = {
                ...getUserDetails(phoneNumber)
            };
            if (roster) {
                displayNames.push(roster.displayName);
                participantsData.push({
                    image: roster.image,
                    thumbImage: roster.thumbImage,
                    userId: getUserIdFromJid(us),
                    name: roster.displayName,
                    initialName: roster.initialName
                });
            } else {
                displayNames.push(getFormatPhoneNumber(phoneNumber));
                participantsData.push({
                    image: "",
                    thumbImage: "",
                    userId: getUserIdFromJid(us),
                    name: "",
                    initialName: ""
                });
            }
        } else {
            currentUserPresentInCall = true;
        }
    });
    let anotherUserslength = userList.length;
    if (currentUserPresentInCall) {
        anotherUserslength = anotherUserslength - 1;
    }
    for (let i = 0; i < displayNames.length; i++) {
        let name = displayNames[i];
        if (displayName) {
            if (i <= 2) {
                if (i < anotherUserslength) {
                    displayName = `${displayName}, ${name}`;
                } else {
                    displayName = `${displayName} and ${name}`;
                }
            } else {
                displayName = `${displayName} and (+${displayNames.length - 3})`;
                break;
            }
        } else {
            displayName = name;
        }
    }
    rosterData.chatType = "groupchat";
    rosterData.displayName = displayName;
    rosterData.participantsData = participantsData;
    return rosterData;
}

export const startMissedCallNotificationTimer = (res) => {
    missedCallNotificationTimer = setTimeout(() => {
        let callConnectionData = JSON.parse(getFromLocalStorageAndDecrypt('call_connection_status'));
        if (callConnectionData) {
            const callDetailObj = callConnectionData ? {
                ...callConnectionData
            } : {};
            callDetailObj['status'] = "ended";
            browserNotify.sendCallNotification(callDetailObj);
        }
    }, CALL_RINGING_DURATION + DISCONNECTED_SCREEN_DURATION)
}

export const clearMissedCallNotificationTimer = () => {
    if (missedCallNotificationTimer !== null) {
        clearTimeout(missedCallNotificationTimer);
        missedCallNotificationTimer = null;
    }
}

export const handleCallParticipantToast = (userJid, type) => {
    const userDetails = getUserDetails(userJid);
    const {
        displayName = getUserIdFromJid(userJid), image = "", thumbImage = "", initialName = ""
    } = userDetails;
    const initial = initialNameHandle(userDetails, initialName);
    setTimeout(() =>{
        callLinkToast(type, displayName, image, thumbImage, initial, "callParticipantList");
    },100)
   
};

export const handleAudioClasses = (volumeVdo = 0) => {
    let volume = volumeVdo == 'NaN' ? 0 : volumeVdo;
    if (volume > 5.5) {
        return "audio_vhigh";
    } else if (volume > 4.5) {
        return "audio_high";
    } else if (volume > 3.5) {
        return "audio_medium";
    } else if (volume > 1.5) {
        return "audio_normal";
    } else if (volume > .5) {
        return "audio_low";
    } else if (volume > 0) {
        return "audio_slient";
    } else {
        return "audio_hidden";
    }
}
