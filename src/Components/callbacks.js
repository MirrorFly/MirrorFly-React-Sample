import {
    updateContactWhoBlockedMeAction,
    updateBlockedContactAction
} from '../Actions/BlockAction';
import {
    CallConnectionState,
    showConfrence,
    callConversion,
    selectLargeVideoUser,
    callDurationTimestamp,
    isMuteAudioAction,
    resetData,
    callIntermediateScreen,
    resetCallIntermediateScreen,
    resetConferencePopup
} from '../Actions/CallAction';
import {
    WebChatConnectionState
} from '../Actions/ConnectionState';
import {
    GroupDataUpdateAction,
    GroupsDataAction,
    GroupsMemberListAction,
    currentCallGroupMembers
} from '../Actions/GroupsAction';
import {
    MessageAction,
    messageForwardReset,
    messageInfoAction,
    ReplyMessageAction
} from '../Actions/MessageActions';
import {
    PresenceDataAction
} from '../Actions/PresenceAction';
import {
    RecentChatAction,
    clearLastMessageinRecentChat,
    updateMsgByLastMsgId,
    deleteActiveChatAction,
    ActiveChatResetAction,
    updateMuteStatusRecentChat,
    updateArchiveStatusRecentChat
} from '../Actions/RecentChatActions';
import {
    RosterDataAction,
    RosterPermissionAction
} from '../Actions/RosterActions';
import {
    VCardContactDataAction,
    VCardDataAction
} from '../Actions/VCardActions';
import {
    getUserIdFromJid,
    logout,
    setLocalWebsettings
} from '../Helpers/Utility';
import callLogs from './WebCall/CallLogs/callLog';
import {
    REACT_APP_XMPP_SOCKET_HOST
} from './processENV';
import SDK from './SDK';
import {
    reconnect
} from './WebChat/Authentication/Reconnect'
import Store from '../Store';
import {
    deleteItemFromLocalStorage,
    encryptAndStoreInLocalStorage,
    encryptAndStoreInSessionStorage,
    getFromLocalStorageAndDecrypt,
    getFromSessionStorageAndDecrypt
} from './WebChat/WebChatEncryptDecrypt';
import {
    setConnectionStatus
} from './WebChat/Common/FileUploadValidation'
import {
    showModal,
    hideModal
} from '../Actions/PopUp';
import {
    resetPinAndLargeVideoUser,
    dispatchDisconnected,
    updateCallTypeAfterCallSwitch,
    startCallingTimer,
    startMissedCallNotificationTimer,
    clearMissedCallNotificationTimer,
    handleCallParticipantToast
} from '../Helpers/Call/Call';
import {
    CALL_CONVERSION_STATUS_CANCEL,
    CALL_CONVERSION_STATUS_REQ_WAITING,
    CALL_BUSY_STATUS_MESSAGE,
    CALL_ENGAGED_STATUS_MESSAGE,
    CALL_STATUS_CONNECTED,
    DISCONNECTED_SCREEN_DURATION,
    CALL_TYPE_AUDIO,
    CALL_TYPE_VIDEO,
    CALL_STATUS_RECONNECT,
    CALL_STATUS_HOLD,
    CALL_STATUS_ENDED
} from '../Helpers/Call/Constant';
import uuidv4 from 'uuid/v4';
import browserNotify from '../Helpers/Browser/BrowserNotify';
import {
    CHAT_TYPE_GROUP,
    GROUP_USER_REMOVED,
    GROUP_USER_ADDED,
    GROUP_USER_MADE_ADMIN,
    GROUP_USER_LEFT,
    GROUP_PROFILE_INFO_UPDATED,
    LOGOUT,
    MSG_CLEAR_CHAT,
    MSG_CLEAR_CHAT_CARBON,
    MSG_DELETE_CHAT,
    MSG_DELETE_CHAT_CARBON,
    CONNECTION_STATE_CONNECTING
} from '../Helpers/Chat/Constant';
import {
    setGroupParticipants,
    getGroupData,
    isUserExistInGroup,
    setGroupParticipantsByGroupId
} from '../Helpers/Chat/Group';
import {
    activeConversationChatType,
    getActiveConversationChatId,
    getActiveConversationGroupJid,
    getArchivedChats,
    handleTempArchivedChats,
    isActiveConversationUserOrGroup,
    isSameSession
} from '../Helpers/Chat/ChatHelper';
import {
    formatUserIdToJid,
    getDataFromRoster,
    getLocalUserDetails,
    getUserDetails,
    isLocalUser,
    isSingleChatJID
} from '../Helpers/Chat/User';
import {
    ClearChatHistoryAction,
    DeleteChatHistoryAction,
    UpdateFavouriteStatus
} from '../Actions/ChatHistory';
import {
    MediaUploadDataAction
} from '../Actions/Media';
import {
    RemoveStaredMessagesClearChat,
    RemoveStaredMessagesDeleteChat,
    UpdateStarredMessages
} from '../Actions/StarredAction';
import {
    toast
} from 'react-toastify';
import {
    webSettingLocalAction
} from '../Actions/BrowserAction';
import { adminBlockStatusUpdate } from '../Actions/AdminBlockAction';
import { disconnectCallConnection } from  '../Helpers/Call/Call'
export var strophe = false;
let localStream = null,
    localVideoMuted = false,
    localAudioMuted = false,
    onCall = false;
let remoteVideoMuted = [],
    remoteStream = [],
    remoteAudioMuted = [];

/**
 * To check the isLogin status
 */
export const isLoginLogin = () => {
    if (getFromLocalStorageAndDecrypt("token")) return true;
    return false;
}

export const resetCallData = () => {
    onCall = false;
    remoteStream = [];
    localStream = null;
    remoteVideoMuted = [];
    remoteAudioMuted = [];
    localVideoMuted = false;
    localAudioMuted = false;
    if (getFromLocalStorageAndDecrypt("isNewCallExist") === true) {
        deleteItemFromLocalStorage("isNewCallExist")
    } else {
        Store.dispatch(resetCallIntermediateScreen());
    }
    Store.dispatch(callDurationTimestamp());
    Store.dispatch(resetConferencePopup());
    resetData();
    setTimeout(() => {
        Store.dispatch(isMuteAudioAction(false));
    }, 1000)
};

export const muteLocalVideo = (isMuted) => {
    localVideoMuted = isMuted;
    let vcardData = getLocalUserDetails();
    let currentUser = vcardData && vcardData.fromUser;
    currentUser = currentUser + "@" + REACT_APP_XMPP_SOCKET_HOST
    remoteVideoMuted[currentUser] = isMuted;
};

export const muteLocalAudio = (isMuted) => {
    localAudioMuted = isMuted;
    let vcardData = getLocalUserDetails();
    let currentUser = vcardData && vcardData.fromUser;
    currentUser = currentUser + "@" + REACT_APP_XMPP_SOCKET_HOST
    remoteAudioMuted[currentUser] = isMuted;
};

const updatingUserStatusInRemoteStream = (usersStatus) => {
    usersStatus.map((user) => {
        const index = remoteStream.findIndex(item => item.fromJid === user.userJid);
        if (index > -1) {
            remoteStream[index] = {
                ...remoteStream[index],
                status: user.status
            };
            remoteVideoMuted[user.userJid] = user.videoMuted;
            remoteAudioMuted[user.userJid] = user.audioMuted;
        } else {
            let streamObject = {
                id: uuidv4(),
                fromJid: user.userJid,
                status: user.status || CONNECTION_STATE_CONNECTING
            }
            remoteStream.push(streamObject);
            remoteVideoMuted[user.userJid] = user.videoMuted;
            remoteAudioMuted[user.userJid] = user.audioMuted;
        }
    });
}

const initiateDisconnectedScreenTimer = (res) => {
    setTimeout(() => {
        Store.dispatch(showConfrence({
            showComponent: false,
            showStreamingComponent: true,
            showCallingComponent: false,
            localStream: localStream,
            remoteStream: remoteStream,
            fromJid: "",
            status: "REMOTESTREAM",
            localVideoMuted: localVideoMuted,
            localAudioMuted: localAudioMuted,
            remoteVideoMuted: remoteVideoMuted,
            remoteAudioMuted: remoteAudioMuted
        }))
        resetPinAndLargeVideoUser(res.userJid);
    }, DISCONNECTED_SCREEN_DURATION);
}

const removingRemoteStream = (res) => {
    remoteStream.map((item, key) => {
        if (item.fromJid === res.userJid) {
            remoteStream.splice(key, 1);
        }
    });
}

export const removeRemoteStream = (userJid) => {
    remoteStream.map((item, key) => {
        if (item.fromJid === userJid) {
            remoteStream.splice(key, 1);
        }
    });
}

export const getRemoteStream = () => remoteStream;

const updateStoreRemoteStream = () => {
    const {
        getState
    } = Store;
    const {
        data = {}
    } = getState().showConfrenceData;
    Store.dispatch(showConfrence({
        ...data,
        remoteStream
    }));
}

const ringing = (res) => {
    if (!onCall) {
        const callConnectionData = JSON.parse(getFromLocalStorageAndDecrypt("call_connection_status"));
        if (callConnectionData.callType === "audio") {
            localVideoMuted = true;
        }
        Store.dispatch(showConfrence({
            callStatusText: 'Ringing',
            showStreamingComponent: false,
            localStream,
            remoteStream,
            localVideoMuted,
            localAudioMuted,
            showComponent: true,
        }));
    } else {
        const {
            getState
        } = Store;
        const showConfrenceData = getState().showConfrenceData;
        const {
            data
        } = showConfrenceData;
        const index = remoteStream.findIndex(item => item.fromJid === res.userJid);
        if (index > -1) {
            remoteStream[index] = {
                ...remoteStream[index],
                status: res.status
            };
            Store.dispatch(showConfrence({
                ...(data || {}),
                remoteStream: remoteStream
            }));
        }
    }
}

const connecting = (res) => {
    updatingUserStatusInRemoteStream(res.usersStatus);
    let roomId = getFromLocalStorageAndDecrypt('roomName');
    encryptAndStoreInLocalStorage('callingComponent', false)
    const showConfrenceData = Store.getState().showConfrenceData;
    const {
        data
    } = showConfrenceData;
    // If 'data.showStreamingComponent' property value is TRUE means, already call is connected &
    // Streaming data has been shared between users. That's why we check condition here,
    // If 'data.showStreamingComponent' is FALSE, then set the 'CONNECTING' state to display.
    if (data && !data.showStreamingComponent && remoteStream.length === 0) {
        remoteStream = [];
        encryptAndStoreInLocalStorage("connecting", true);
        Store.dispatch(showConfrence({
            showComponent: true,
            showStreamingComponent: false,
            showCallingComponent: false
        }))
        callLogs.update(roomId, {
            "sessionStatus": res.sessionStatus,
            "startTime": callLogs.initTime()
        });
    }
}

const updateCallConnectionStatus = (usersStatus) => {
    const callConnectionData = JSON.parse(getFromLocalStorageAndDecrypt("call_connection_status"));
    let usersLen;
    if (usersStatus.length) {
        let currentUsers = usersStatus.filter(el => el.status.toLowerCase() !== CALL_STATUS_ENDED);
        usersLen = currentUsers.length;
    }
    let callDetailsObj = {
        ...callConnectionData,
        callMode: ((callConnectionData && callConnectionData.groupId && callConnectionData.groupId !== null && callConnectionData.groupId !== "") || usersLen > 2) ? "onetomany" : "onetoone"
    }
    encryptAndStoreInLocalStorage("call_connection_status", JSON.stringify(callDetailsObj));
}

const connected = (res) => {
    const userIndex = remoteStream.findIndex(item => item.fromJid === res.userJid);
    if (userIndex > -1) {
        let usersStatus = res.usersStatus;
        updatingUserStatusInRemoteStream(usersStatus);
        updateCallConnectionStatus(usersStatus);
        const {
            getState,
            dispatch
        } = Store;
        const showConfrenceData = getState().showConfrenceData;
        const {
            data
        } = showConfrenceData;
        let showComponent = !!data.showComponent;
        let showStreamingComponent = !!data.showStreamingComponent;
        if (!showStreamingComponent) {
            deleteItemFromLocalStorage('connecting');
            showComponent = false;
            showStreamingComponent = true;
        }
        dispatch(showConfrence({
            ...(data || {}),
            showComponent,
            showStreamingComponent,
            remoteStream,
            status: res.callStatus,
            callStatusText: CALL_STATUS_CONNECTED
        }));
    }
}

const disconnected = (res) => {
    let roomId = getFromLocalStorageAndDecrypt('roomName');
    let vcardData = getLocalUserDetails();
    let currentUser = vcardData && vcardData.fromUser;
    currentUser = currentUser + "@" + REACT_APP_XMPP_SOCKET_HOST;
    updatingUserStatusInRemoteStream(res.usersStatus);
    let disconnectedUser = res.userJid;
    disconnectedUser = disconnectedUser.includes("@") ? disconnectedUser.split('@')[0] : disconnectedUser;
    if (remoteStream.length < 1 || disconnectedUser === currentUser) {
        deleteItemFromLocalStorage('roomName');
        deleteItemFromLocalStorage('callType');
        deleteItemFromLocalStorage('call_connection_status');
        callLogs.update(roomId, {
            "endTime": callLogs.initTime(),
            "sessionStatus": res.sessionStatus
        });
        Store.dispatch(showConfrence({
            showComponent: false,
            showStreamingComponent: false,
            showCalleComponent: false
        }));
        resetPinAndLargeVideoUser();
        Store.dispatch(hideModal());
        resetCallData();
    } else {
        Store.dispatch(showConfrence({
            showComponent: false,
            showStreamingComponent: true,
            showCallingComponent: false,
            localStream: localStream,
            remoteStream: remoteStream,
            fromJid: "",
            status: "REMOTESTREAM",
            localVideoMuted: localVideoMuted,
            localAudioMuted: localAudioMuted,
            remoteVideoMuted: remoteVideoMuted,
            remoteAudioMuted: remoteAudioMuted
        }))
        resetPinAndLargeVideoUser(res.fromJid);
        removingRemoteStream(res);
    }
}

const localstoreCommon = () => {
    encryptAndStoreInLocalStorage('callingComponent', false)
    deleteItemFromLocalStorage('roomName');
    deleteItemFromLocalStorage('callType');
    deleteItemFromLocalStorage('call_connection_status');
    encryptAndStoreInLocalStorage("hideCallScreen", false);
};

const dispatchCommon = () => {
    Store.dispatch(showConfrence({
        callStatusText: null,
        showComponent: false,
        showStreamingComponent: false,
        stopSound: true,
        showCalleComponent: false
    }));
    Store.dispatch(callConversion());
    Store.dispatch(hideModal());
    resetCallData();
};

const handleEngagedOrBusyStatus = (res) => {
    let roomId = getFromLocalStorageAndDecrypt('roomName');
    updatingUserStatusInRemoteStream(res.usersStatus);
    if (res.sessionStatus === "closed") {
        callLogs.update(roomId, {
            "endTime": callLogs.initTime(),
            "sessionStatus": res.sessionStatus
        });
        const callStatusMsg = res.status === "engaged" ? CALL_ENGAGED_STATUS_MESSAGE : CALL_BUSY_STATUS_MESSAGE;
        dispatchDisconnected(callStatusMsg);
        setTimeout(() => {
            localstoreCommon();
            dispatchCommon();
        }, DISCONNECTED_SCREEN_DURATION);
    } else {
        if (remoteStream && Array.isArray(remoteStream) && remoteStream.length < 1) {
            return;
        }
        const {
            getState
        } = Store;
        const showConfrenceData = getState().showConfrenceData;
        const {
            data
        } = showConfrenceData;
        if (!onCall) {
            let callConnectionData = JSON.parse(getFromLocalStorageAndDecrypt('call_connection_status'))
            let userList = callConnectionData.userList.split(",");
            let updatedUserList = [];
            userList.forEach(user => {
                if (user !== res.userJid) {
                    updatedUserList.push(user);
                }
            });
            callConnectionData.userList = updatedUserList.join(",");
            if (callConnectionData.callMode === "onetomany" && !callConnectionData.groupId) {
                if (updatedUserList.length > 1) {
                    callConnectionData.callMode = "onetomany";
                } else {
                    callConnectionData.callMode = "onetoone";
                    callConnectionData.to = updatedUserList[0];
                }
            }
            encryptAndStoreInLocalStorage("call_connection_status", JSON.stringify(callConnectionData));
            Store.dispatch(CallConnectionState(callConnectionData));
        }
        let userDetails = getUserDetails(res.userJid);
        let toastMessage = res.status === "engaged" ? `${userDetails.displayName} is on another call` : `${userDetails.displayName} is busy`;
        toast.error(toastMessage);
        removingRemoteStream(res);
        if (data.showStreamingComponent) {
            resetPinAndLargeVideoUser(res.userJid);
        }
        Store.dispatch(showConfrence({
            ...(data || {}),
            remoteStream: remoteStream,
            remoteVideoMuted,
            remoteAudioMuted
        }));
    }
}

const ended = (res) => {
    let roomId = getFromLocalStorageAndDecrypt('roomName');
    if (res.sessionStatus === "closed") {
        let callConnectionData = null;
        if (remoteStream && !onCall && !res.carbonAttended) {
            // Call ended before attend
            callConnectionData = JSON.parse(getFromLocalStorageAndDecrypt('call_connection_status'));
        }
        callLogs.update(roomId, {
            "endTime": callLogs.initTime(),
            "sessionStatus": res.sessionStatus
        });
        dispatchDisconnected();
        if (callConnectionData) {
            clearMissedCallNotificationTimer();
        }
        setTimeout(() => {
            localstoreCommon();
            Store.dispatch(showConfrence({
                showComponent: false,
                showStreamingComponent: false,
                showCalleComponent: false,
                callStatusText: null
            }))
            Store.dispatch(callConversion());
            Store.dispatch(hideModal());
            Store.dispatch(CallConnectionState(res));
            if (callConnectionData) {
                const callDetailObj = callConnectionData ? {
                    ...callConnectionData
                } : {};
                callDetailObj['status'] = "ended";
                browserNotify.sendCallNotification(callDetailObj);
            }
            resetCallData();
        }, DISCONNECTED_SCREEN_DURATION);
    } else {
        if (!onCall || (remoteStream && Array.isArray(remoteStream) && remoteStream.length < 1)) {
            return;
        }
        removingRemoteStream(res);
        resetPinAndLargeVideoUser(res.userJid);
        updateCallConnectionStatus(res.usersStatus);
        const {
            getState
        } = Store;
        const showConfrenceData = getState().showConfrenceData;
        const {
            data
        } = showConfrenceData;
        Store.dispatch(showConfrence({
            ...(data || {}),
            remoteStream: remoteStream,
            remoteVideoMuted,
            remoteAudioMuted
        }));
    }
}

const reconnecting = (res) => {
    updatingUserStatusInRemoteStream(res.usersStatus);
    const {
        getState
    } = Store;
    const showConfrenceData = getState().showConfrenceData;
    const {
        data
    } = showConfrenceData;
    Store.dispatch(showConfrence({
        showCallingComponent: false,
        ...(data || {}),
        localStream: localStream,
        remoteStream: remoteStream,
        fromJid: res.userJid,
        status: "REMOTESTREAM",
        localVideoMuted: localVideoMuted,
        localAudioMuted: localAudioMuted,
        remoteVideoMuted: remoteVideoMuted,
        remoteAudioMuted: remoteAudioMuted,
        callStatusText: CALL_STATUS_RECONNECT,
    }))
}

const speaking = (res) => {
    if (!res.userJid) return;
    if (!res.localUser) {
        Store.dispatch(selectLargeVideoUser(res.userJid, res.volumeLevel));
    }
}

const userStatus = (res) => {
    updatingUserStatusInRemoteStream(res.usersStatus);
}

const hold = (res) => {
    updatingUserStatusInRemoteStream(res.usersStatus);
    const {
        getState
    } = Store;
    const showConfrenceData = getState().showConfrenceData;
    const {
        data
    } = showConfrenceData;
    Store.dispatch(showConfrence({
        showCallingComponent: false,
        ...(data || {}),
        localStream: localStream,
        remoteStream: remoteStream,
        fromJid: res.userJid,
        status: "REMOTESTREAM",
        localVideoMuted: localVideoMuted,
        localAudioMuted: localAudioMuted,
        remoteVideoMuted: remoteVideoMuted,
        remoteAudioMuted: remoteAudioMuted,
        callStatusText: CALL_STATUS_HOLD,
    }))
}

const subscribed = (res) => {
    // updatingUserStatusInRemoteStream(res.usersStatus);
    const {
        getState,
        dispatch
    } = Store;
    const showConfrenceData = getState().showConfrenceData;
    const {
        data
    } = showConfrenceData;
    dispatch(showConfrence({
        ...(data || {}),
        localVideoMuted: data.mediaError ? localVideoMuted : false,
        localStream: localStream,
        remoteStream,
        localAudioMuted: localAudioMuted,
        status: "SUBSCRIBED"
    }));
}

const callStatus = (res) => {
    if (res.status === "ringing") {
        ringing(res);
    } else if (res.status === "connecting") {
        connecting(res);
    } else if (res.status === "connected") {
        connected(res);
    } else if (res.status === "busy") {
        handleEngagedOrBusyStatus(res);
    } else if (res.status === "disconnected") {
        disconnected(res);
    } else if (res.status === "engaged") {
        handleEngagedOrBusyStatus(res);
    } else if (res.status === "ended") {
        ended(res);
    } else if (res.status === "reconnecting") {
        reconnecting(res);
    } else if (res.status === "userstatus") {
        userStatus(res);
    } else if (res.status === "hold") {
        hold(res);
    }
}

export var callbacks = {
    connectionListener: function (res) {
        const connStatus = res.status || "";
        console.log('connStatus :>> ', connStatus);
        if (connStatus === "CONNECTED") {
            strophe = true;
            encryptAndStoreInLocalStorage("connection_status", connStatus);
            setConnectionStatus(connStatus)
            Store.dispatch(WebChatConnectionState(connStatus));
        } else if (connStatus === "ERROROCCURED") {
            encryptAndStoreInLocalStorage("connection_status", connStatus);
        } else if (connStatus === "DISCONNECTED") {
            if (isSameSession() && getFromSessionStorageAndDecrypt("isLogout") === null) {
                reconnect()
            }
            encryptAndStoreInLocalStorage("connection_status", connStatus);
            setConnectionStatus(connStatus)
            Store.dispatch(WebChatConnectionState(connStatus));
        } else if (connStatus === "CONNECTIONFAILED") {
            encryptAndStoreInLocalStorage("connection_status", connStatus);
            setConnectionStatus(connStatus)
            Store.dispatch(WebChatConnectionState(connStatus));
        } else if (connStatus === "AUTHENTICATIONFAILED") {
            logout();
        }
    },
    incomingCallListener: (res) => {
        strophe = true;
        remoteStream = [];
        localStream = null;
        let callMode = "onetoone";
        if (res.toUsers.length === 1 && res.groupId === null) {
            res.from = res.toUsers[0];
            res.to = res.userJid;
            if (res.callType === "audio") {
                localVideoMuted = true;
            }
        } else {
            callMode = "onetomany";
            res.from = res.userJid;
            res.to = res.groupId ? res.groupId : res.userJid;
            res.userList = res.allUsers.join(",");
            if (res.callType === "audio") {
                localVideoMuted = true;
            }
        }
        res.callMode = callMode;
        encryptAndStoreInLocalStorage("call_connection_status", JSON.stringify(res));
        let roomId = getFromLocalStorageAndDecrypt('roomName');

        if (roomId === "" || roomId === null || roomId === undefined) {
            resetPinAndLargeVideoUser();
            encryptAndStoreInLocalStorage('roomName', res.roomId);
            encryptAndStoreInLocalStorage('callType', res.callType)
            encryptAndStoreInLocalStorage('callFrom', res.from);
            if (res.callType === "audio") {
                localVideoMuted = true;
            }
            Store.dispatch(CallConnectionState(res));
            Store.dispatch(showConfrence({
                showComponent: false,
                showStreamingComponent: false,
                showCalleComponent: true
            }));
            updatingUserStatusInRemoteStream(res.usersStatus);
            browserNotify.sendCallNotification(res);
            startMissedCallNotificationTimer();
        } else {
            SDK.callEngaged();
        }

        callLogs.insert({
            "callMode": res.callMode,
            "callState": 0,
            "callTime": callLogs.initTime(),
            "callType": res.callType,
            "fromUser": res.from,
            "roomId": res.roomId,
            "userList": res.userList,
            "groupId": res.callMode === "onetoone" ? '' : res.groupId
        });
        startCallingTimer();
    },
    callStatusListener: (res) => {
        callStatus(res);
    },
    userTrackListener: (res) => {
        if (res.localUser) {
            if (!res.trackType) {
                return;
            }
            localStream = localStream || {};
            let mediaStream = null;
            if (res.track) {
                mediaStream = new MediaStream();
                mediaStream.addTrack(res.track);
            }
            localStream[res.trackType] = mediaStream;
            const {
                getState,
                dispatch
            } = Store;
            const showConfrenceData = getState().showConfrenceData;
            const {
                data
            } = showConfrenceData;
            const usersStatus = res.usersStatus;
            usersStatus.map((user) => {
                const index = remoteStream.findIndex(item => item.fromJid === user.userJid);
                if (index > -1) {
                    remoteStream[index] = {
                        ...remoteStream[index],
                        status: user.status
                    };
                    remoteVideoMuted[user.userJid] = user.videoMuted;
                    remoteAudioMuted[user.userJid] = user.audioMuted;
                } else {
                    let streamObject = {
                        id: uuidv4(),
                        fromJid: user.userJid,
                        status: user.status,
                    }
                    remoteStream.push(streamObject);
                    remoteVideoMuted[user.userJid] = user.videoMuted;
                    remoteAudioMuted[user.userJid] = user.audioMuted;
                }
            });
            const roomName = getFromLocalStorageAndDecrypt('roomName');
            if (roomName === "" || roomName == null || roomName == undefined) { 
                const { roomId = "" } = SDK.getCallInfo();
                console.log('localStorage roomId :>> ', roomId);
                encryptAndStoreInLocalStorage('roomName', roomId);
            }

            dispatch(showConfrence({
                localVideoMuted: localVideoMuted,
                ...(data || {}),
                localStream: localStream,
                remoteStream,
                localAudioMuted: localAudioMuted,
                status: "LOCALSTREAM"
            }));

        } else {
            onCall = true;
            encryptAndStoreInLocalStorage('callingComponent', false);
            const streamType = res.trackType;
            let mediaStream = null;
            if (res.track) {
                mediaStream = new MediaStream();
                mediaStream.addTrack(res.track);
            }
            const streamUniqueId = `stream${streamType.charAt(0).toUpperCase() + streamType.slice(1)}Id`;
            updatingUserStatusInRemoteStream(res.usersStatus);
            const userIndex = remoteStream.findIndex(item => item.fromJid === res.userJid);
            if (userIndex > -1) {
                let {
                    stream
                } = remoteStream[userIndex];
                stream = stream || {};
                stream[streamType] = mediaStream;
                stream['id'] = uuidv4();
                stream[streamUniqueId] = uuidv4();
                remoteStream[userIndex]['stream'] = stream;
            } else {
                let streamObject = {
                    id: uuidv4(),
                    fromJid: res.userJid,
                    status: CALL_STATUS_CONNECTED,
                    stream: {
                        [streamUniqueId]: uuidv4(),
                        [streamType]: mediaStream
                    }
                }
                remoteStream.push(streamObject);
            }

            // When remoteStream user length is one, set that user as large video user
            if (remoteStream.length === 2) {
                Store.dispatch(selectLargeVideoUser(res.userJid));
            } else {
                remoteStream.map((item) => {
                    return Store.dispatch(selectLargeVideoUser(item.userJid));
                });
            }

            const {
                showConfrenceData,
                callConversionData
            } = Store.getState();
            const {
                data
            } = showConfrenceData;
            Store.dispatch(showConfrence({
                showCallingComponent: false,
                localVideoMuted: localVideoMuted,
                ...(data || {}),
                localStream: localStream,
                remoteStream: remoteStream,
                fromJid: res.userJid,
                status: "REMOTESTREAM",
                localAudioMuted: localAudioMuted,
                remoteVideoMuted: remoteVideoMuted,
                remoteAudioMuted: remoteAudioMuted,
                callStatusText: CALL_STATUS_CONNECTED
            }))

            // Need to hide the call converison request & response screen when more than one remote
            // users joined in call
            if (remoteStream.length >= 3) {
                const status = callConversionData && callConversionData.status === CALL_CONVERSION_STATUS_REQ_WAITING ? {
                    status: CALL_CONVERSION_STATUS_CANCEL
                } : undefined;
                Store.dispatch(callConversion(status));
                status && SDK.callConversion(CALL_CONVERSION_STATUS_CANCEL);
            }
        }
    },
    muteStatusListener: (res) => {
        if (!res) return;
        let localUser = false;
        let vcardData = getLocalUserDetails();
        const currentUser = vcardData && vcardData.fromUser;
        let mutedUser = res.userJid;
        mutedUser = mutedUser.includes("@") ? mutedUser.split('@')[0] : mutedUser;
        if (res.localUser || currentUser === mutedUser) {
            localUser = true;
        }
        if (localUser) {
            if (res.trackType === CALL_TYPE_AUDIO) {
                localAudioMuted = res.isMuted;
            }
            if (res.trackType === CALL_TYPE_VIDEO) {
                localVideoMuted = res.isMuted;
            }
        } else {
            if (res.trackType === CALL_TYPE_AUDIO) {
                remoteAudioMuted[res.userJid] = res.isMuted;
                if (res.isMuted) {
                    Store.dispatch(selectLargeVideoUser(res.userJid, -100));
                }
            }
            if (res.trackType === CALL_TYPE_VIDEO) {
                remoteVideoMuted[res.userJid] = res.isMuted;
            }
        }

        const showConfrenceData = Store.getState().showConfrenceData;
        const {
            data
        } = showConfrenceData;
        let showComponent = data.showComponent;
        let showStreamingComponent = data.showStreamingComponent;
        let showCallingComponent = data.showCallingComponent;
        let showCalleComponent = data.showCalleComponent;

        Store.dispatch(showConfrence({
            ...data,
            showComponent: showComponent,
            showStreamingComponent: showStreamingComponent,
            showCallingComponent: showCallingComponent,
            showCalleComponent: showCalleComponent,
            localStream: localStream,
            remoteStream: remoteStream,
            fromJid: res.userJid,
            status: "MUTESTATUS",
            localVideoMuted: localVideoMuted,
            localAudioMuted: localAudioMuted,
            remoteVideoMuted: remoteVideoMuted,
            remoteAudioMuted: remoteAudioMuted
        }))
        updateCallTypeAfterCallSwitch();

    },
    missedCallListener: (res) => {
        callLogs.insert({
            "callMode": res.callMode,
            "callState": 0,
            "callTime": callLogs.initTime(),
            "callType": res.callType,
            "fromUser": res.from,
            "roomId": res.roomId,
            "userList": res.allUsers,
            "groupId": res.groupId
        });
    },
    callSwitchListener: (res) => {
        Store.dispatch(callConversion({
            status: res.status,
            fromUser: res.userJid
        }));
    },
    callSpeakingListener: (res) => {
        speaking(res);
    },
    callUsersUpdateListener: (res) => {
        remoteStream.map((item) => {
            if (!res.usersList.includes(item.fromJid)) {
                removeRemoteStream(item.fromJid);
            }
        });
        Store.dispatch(callIntermediateScreen({
            usersList: res.usersList
        }));
        subscribed(res);
    },
    inviteUsersListener: (res) => {
        updatingUserStatusInRemoteStream(res.usersStatus);
        const showConfrenceData = Store.getState().showConfrenceData;
        const {
            data
        } = showConfrenceData;
        Store.dispatch(showConfrence({
            ...(data || {}),
            status: "REMOTESTREAM",
            remoteStream: remoteStream
        }));
        callLogs.update(res.roomId, {
            "userList": res.userList
        });
        startCallingTimer();
    },
    mediaErrorListener: (res) => {
        if (res.action === "subscribeCall" && res.statusCode === 100607) {
            muteLocalVideo(true);
            const {
                getState
            } = Store;
            const showConfrenceData = getState().showConfrenceData;
            const {
                data
            } = showConfrenceData;
            Store.dispatch(showConfrence({
                ...(data || {}),
                mediaError: true,
                localVideoMuted: true
            }));
        }
        Store.dispatch(showModal({
            open: true,
            modelType: res.callStatus === "MEDIA_PERMISSION_DENIED" ? 'mediaPermissionDenied' : 'mediaAccessError',
            ...res
        }));
    },
    messageListener: async function (res) {
        if (res.msgType === LOGOUT) {
            encryptAndStoreInSessionStorage("isLogout", true);
            setTimeout(() => {
                if (isSameSession()) {
                    deleteItemFromLocalStorage("auth_user");
                    window.location.reload();
                }
            }, 2000);
            return;
        }

        if (res.msgType === "receiveMessage" && res.chatType === CHAT_TYPE_GROUP && res.msgBody === "2") {
            const groupListRes = await SDK.getGroupsList();
            if (groupListRes && groupListRes.statusCode === 200) {
                Store.dispatch(GroupsDataAction(groupListRes.data));
            }
        }

        if (res.msgType === MSG_CLEAR_CHAT || res.msgType === MSG_CLEAR_CHAT_CARBON) {
            // Clear last message in recent chat list
            Store.dispatch(clearLastMessageinRecentChat(res.fromUserId));
            Store.dispatch(ClearChatHistoryAction(res));
            Store.dispatch(RemoveStaredMessagesClearChat(res));
        }

        if (res.msgType === MSG_DELETE_CHAT || res.msgType === MSG_DELETE_CHAT_CARBON) {
            const archivedChats = getArchivedChats();
            if (archivedChats.includes(res.fromUserId)) {
                SDK.updateArchiveChat(formatUserIdToJid(res.fromUserId, res.chatType), false);
            }
            // Delete the user from recent chat list
            Store.dispatch(deleteActiveChatAction(res));
            Store.dispatch(DeleteChatHistoryAction(res));
            const chatId = getActiveConversationChatId();
            if (res.fromUserId === chatId) Store.dispatch(ActiveChatResetAction());
            Store.dispatch(RemoveStaredMessagesDeleteChat(res));
        }

        if (res.msgType === "userBlockStatus" || res.msgType === "carbonUserBlockStatus") {
            Store.dispatch(updateContactWhoBlockedMeAction(res.blockedUserId, res.type));
            return;
        }

        Store.dispatch(MessageAction(res));
    },
    groupProfileListener: async function (res) {
        if (res && res.groupJid) {
            const groupData = getGroupData(res.groupJid);
            const groupPartRes = await SDK.getGroupParticipants(res.groupJid);
            if (groupPartRes && groupPartRes.statusCode === 200) {
                setGroupParticipantsByGroupId(res.groupJid, groupPartRes.data.participants);
            }
            handleTempArchivedChats(res.groupJid, CHAT_TYPE_GROUP);
            if (groupData && isActiveConversationUserOrGroup(res.groupJid)) {
                // Fetch the group participants details
                if (
                    [
                        GROUP_USER_ADDED,
                        GROUP_USER_REMOVED,
                        GROUP_USER_MADE_ADMIN,
                        GROUP_PROFILE_INFO_UPDATED,
                        GROUP_USER_LEFT
                    ].indexOf(res.msgType) > -1
                ) {
                    if (groupPartRes && groupPartRes.statusCode === 200) {
                        setGroupParticipants(groupPartRes.data);
                    }
                }
            } else {
                if (res.msgType === GROUP_USER_ADDED) {
                    const groupListRes = await SDK.getGroupsList();
                    if (groupListRes && groupListRes.statusCode === 200) {
                        Store.dispatch(GroupsDataAction(groupListRes.data));
                    }
                    const recentChatsRes = await SDK.getRecentChats();
                    if (recentChatsRes && recentChatsRes.statusCode === 200) {
                        Store.dispatch(RecentChatAction(recentChatsRes.data));
                    }
                }
            }
            Store.dispatch(GroupDataUpdateAction(res));
        }
    },
    groupMemberListListener: function (res, communicationType) {
        // We are maintaing the separate group members list reducer for chat & call
        // Because If currently user in group chat screen, at the same time if user gets the group call
        // & attended the group call, then try to invite the new user from group, then need to show the
        // Group member list in invite user popup. So in this situation, Current chat screen & call group is
        // different, to avoid the group override maintain the separate groups for call & chat.
        console.log(res, communicationType);
        if (communicationType !== 'call') {
            Store.dispatch(GroupsMemberListAction(res));
        }
        Store.dispatch(currentCallGroupMembers(res));
    },
    presenceListener: function (res) {
        Store.dispatch(PresenceDataAction(res))
    },
    replyMessageListener: function (res) {
        Store.dispatch(ReplyMessageAction(res));
    },
    setUserToken: function (token) {
        if (!token) {
            deleteItemFromLocalStorage('token');
            return;
        }
        encryptAndStoreInLocalStorage("token", token);
    },
    // New Callback Listeners from New SDK
    friendsListListener: function (res) {
        Store.dispatch(RosterPermissionAction(res.permission));
        Store.dispatch(RosterDataAction(res.users));
    },
    userProfileListener: async function (res) {
        let authUser = getFromLocalStorageAndDecrypt('auth_user');
        if (authUser.username === res.userId) {
            Store.dispatch(VCardDataAction(res));
        } else {
            Store.dispatch(VCardContactDataAction(res));
        }
        // Whenever user change the profile details, need to update those details in group user list
        // if the user exist in group
        const isGroupChatScreenActive = activeConversationChatType(CHAT_TYPE_GROUP);
        if (isGroupChatScreenActive && isUserExistInGroup(res.userId)) {
            const groupJid = getActiveConversationGroupJid();
            if (!groupJid) return;
            const groupPartRes = await SDK.getGroupParticipants(groupJid);
            const activeChatScreenGroupJid = getActiveConversationGroupJid();
            if (groupPartRes && groupPartRes.statusCode === 200 && activeChatScreenGroupJid === groupJid) {
                setGroupParticipants(groupPartRes.data);
            }
        }
    },
    favouriteMessageListener: function (res) {
        Store.dispatch(UpdateFavouriteStatus(res));
        Store.dispatch(UpdateStarredMessages(res));
    },
    groupMsgInfoListener: function (res) {
        Store.dispatch(messageInfoAction(res));
    },
    mediaUploadListener: function (res) {
        Store.dispatch(MediaUploadDataAction(res));
    },
    /**
     * This listener will be called, when a same user logged in another device
     * and block any user from that device, then this listener will receive the
     * list blocked user details res as same as 'SDK.getUsersIBlocked()'
     */
    blockUserListener: function (res) {
        Store.dispatch(updateBlockedContactAction(res.blockedUserId, res.type));
    },
    singleMessageDataListener: function (res) {
        Store.dispatch(updateMsgByLastMsgId(res));
    },
    muteChatListener: function (res) {
        if (res?.type === "carbon") {
            Store.dispatch(updateMuteStatusRecentChat(res));
        }
    },
    archiveChatListener: function (res) {
        if (res?.type === "carbon") {
            Store.dispatch(updateArchiveStatusRecentChat(res));
        }
    },
    userSettingsListener: function (res) {
        setLocalWebsettings("archive", res.archive === 0 ? false : true);
        Store.dispatch(webSettingLocalAction({
            "isEnableArchived": res.archive === 0 ? false : true
        }));
    },
    helper: {
        getDisplayName: () => {
            let vcardData = getLocalUserDetails();
            if (vcardData && vcardData.nickName) {
                return vcardData.nickName;
            }
            return "Anonymous user " + Math.floor(Math.random() * 10);
        },
        getImageUrl: () => {
            let vcardData = getLocalUserDetails();
            if (vcardData) {
                return vcardData.image;
            }
            return "";
        }
    },
    callUserJoinedListener: function (res) {
        if (res.userJid && !res.localUser) {
            updateStoreRemoteStream();
            handleCallParticipantToast(res.userJid, "join");
        }
    },
    callUserLeftListener: function (res) {
        if (res.userJid && !res.localUser) {
            updateStoreRemoteStream();
            handleCallParticipantToast(res.userJid, "left");
        }
    },
    adminBlockListener: function (res) {
        console.log('res :>>', res);
        const callConnectionGroupJid = Store.getState()?.callConnectionDate?.data?.groupId
        if (isLocalUser(res.toUserId)) {
            if (res.blockStatus === "1") {
                Store.dispatch(adminBlockStatusUpdate(res));
                SDK.endCall();
                resetCallData();
                logout("block");
            }
        } else if (isSingleChatJID(res.toUserJid)) {
            Store.dispatch(VCardContactDataAction({
                userId: res.toUserId,
                isAdminBlocked: res.blockStatus === "1"
            }));
        } else {
            if (isActiveConversationUserOrGroup(res.toUserId)) {
                if(res.blockStatus === "1"){
                    Store.dispatch(messageForwardReset());
                    Store.dispatch(ActiveChatResetAction());
                    toast.info("This group is no longer available")
                    Store.dispatch(hideModal())
                    if(callConnectionGroupJid === res.toUserJid){
                        disconnectCallConnection()
                    }
                }
            }
            else if(callConnectionGroupJid === res.toUserJid && res.blockStatus === "1"){
                        disconnectCallConnection()
            }
            Store.dispatch(GroupDataUpdateAction({
                groupJid: res.toUserJid,
                isAdminBlocked: res.blockStatus === "1"
            }));
        }
    },
    userDeletedListener: async(userJid) => {
        let data = await getDataFromRoster(getUserIdFromJid(userJid));
        Store.dispatch(VCardContactDataAction({
            ...data,
            isDeletedUser: true,
            email: "",
            image: "",
            isFriend: false,
            mobileNumber: "",
            name: "Deleted User",
            nickName: "Deleted User",
            displayName: "Deleted User",
            status: ""
        }));
    }
}