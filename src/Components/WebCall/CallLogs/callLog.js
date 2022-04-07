import Store from '../../../Store';
import {
    insertCallLog,
    fetchingCallLog
} from '../../../Actions/CallLogAction';
import SDK from '../../SDK.js';

let totalPages = 0;

var callLogs = {
    getCallLogsFromServer: async function (pageNumber = 1) {
        if(pageNumber === 1  || pageNumber < totalPages){
            const logs = await SDK.getCallLogs(pageNumber);
            if(logs.statusCode === 200){
                totalPages = logs.data.totalPages;
                callLogs.setLocalData(logs.data.callLogs);
                Store.dispatch(fetchingCallLog(false));
            } else {
                Store.dispatch(fetchingCallLog(false));
            }
        } else {
            Store.dispatch(fetchingCallLog(false));
        }
    },
    setLocalData: function (callLogsData) {
        callLogsData.map((callLog) => Store.dispatch(insertCallLog(callLog)));
    },
    getCallLogByRoomId: function (roomId) {
        const state = Store.getState();
        const callLogsData  = state.callLogData.callLogs;
        return callLogsData[roomId] || null;
    },
    initTime: function () {
        return new Date().getTime() * 1000;
    },
    insert: function (callLog) {
        if (!callLog || !callLog.roomId) {
            return;
        }
        const userList = callLog.userList && Array.isArray(callLog.userList) ? callLog.userList.join(',') : callLog.userList;
        let postData = {
            "callLogs": [{
                "callMode": callLog.callMode || '',
                "callState": callLog.callState ? callLog.callState : '',
                "callType": callLog.callType || '',
                "callerDevice": "WEB",
                "callTime": callLog.callTime || 0,
                "startTime": callLog.startTime || 0,
                "endTime": callLog.endTime || 0,
                "fromUser": callLog.fromUser || '',
                "inviteUserList": callLog.inviteUserList || "",
                "roomId": callLog.roomId || '',
                "sessionStatus": callLog.sessionStatus || "",
                "toUser": userList || '',
                "userList": userList || '',
                "groupId": callLog.groupId || ''
            }]
        }
        callLogs.setLocalData(postData.callLogs);
    },
    update: async function (roomId, callLogToUpdate) {
        if (!roomId || !callLogToUpdate) {
            return;
        }
        let callLog = await callLogs.getCallLogByRoomId(roomId);
        if (!callLog) {
            return;
        }

        let userListToUpdate = callLog.userList;
        // Below we handled If new userList need to update, then compare with the existing users
        // & then update the new user which are not in existed users.
        if (callLogToUpdate.userList) {
            const existedUserList = callLog.userList;
            userListToUpdate = callLogToUpdate.userList;
            if (existedUserList) {
                const existedUserListArr = Array.isArray(existedUserList) ? existedUserList : existedUserList.split(',');
                const userListToUpdateArr = Array.isArray(userListToUpdate) ? userListToUpdate : userListToUpdate.split(',');
                userListToUpdateArr.map((newUser) => {
                    if (existedUserListArr.indexOf(newUser) === -1) {
                        existedUserListArr.push(newUser);
                    }
                    return true;
                });
                userListToUpdate = existedUserListArr.join(',');
            }
        }
        callLogToUpdate['toUser'] = userListToUpdate;
        callLogToUpdate['userList'] = userListToUpdate;

        callLogToUpdate = {
            ...callLog,
            ...callLogToUpdate
        };
        let postData = {
            "callLogs": [callLogToUpdate]
        }
        callLogs.setLocalData(postData.callLogs);
    }
}

export default callLogs;
