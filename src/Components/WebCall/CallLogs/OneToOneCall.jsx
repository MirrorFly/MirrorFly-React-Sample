import React, { useCallback } from 'react';
import CallDurationCommon from './CallDurationCommon';
import ProfileImage from '../../../Components/WebChat/Common/ProfileImage'
import {IconIncoming,IconOutgoing,IconIncomingMissed } from '../../../assets/images';
import { formatCallLogDate, formatCallLogTime, durationCallLog, getHighlightedText } from '../../../Helpers/Utility';
import {getFromLocalStorageAndDecrypt} from '../../WebChat/WebChatEncryptDecrypt';

const OneToOneCall = (props) => {
    let { displayName, jid, image, searchterm, callLog: callLogData = {} } = props;

    const onClick = useCallback(() => {
        props.makeCall(jid, callLogData.callType)
    })

    const token = getFromLocalStorageAndDecrypt('token');
    let dateLog = formatCallLogDate(callLogData.callTime / 1000);
    let timeIng = formatCallLogTime(callLogData.callTime);
    let durationTime = "";
    let showDuration = false;
    if (callLogData.startTime != null && callLogData.startTime > 0 && callLogData.endTime != null && callLogData.endTime > 0) {
        durationTime = durationCallLog(callLogData.startTime, callLogData.endTime);
        showDuration = true;
    }

    let callState;
    if (callLogData.callState === 1 && callLogData.startTime === 0) {
        callState = 0;
    } else {
        callState = callLogData.callState
    }

    let callStateView = "";
    if (callState === 0) {
        callStateView = <IconIncomingMissed />;
    } else if (callState === 1) {
        callStateView = <IconIncoming />;
    } else {
        callStateView = <IconOutgoing />;
    }

    if (searchterm !== "") {
        if (displayName && displayName.toLowerCase().includes(searchterm)) {
            return <li className="chat-list-li">
                <div className="profile-image">
                    <div className="image">
                        <ProfileImage
                            chattype='chat'
                            userToken={token}
                            imageToken={image}
                        />
                    </div>
                </div>
                <CallDurationCommon
                    displayName={getHighlightedText(displayName, searchterm)}
                    callStateView={callStateView}
                    dateLog={dateLog}
                    timeIng={timeIng}
                    durationTime={durationTime}
                    showDuration={showDuration}
                    callType={props.callLog.callType}
                />
            </li>

        } else {
            return <></>
        }
    } else {
        return <>
            <li className="chat-list-li" onClick={onClick}>
                <div className="profile-image">
                    <div className="image">
                        <ProfileImage
                            chattype='chat'
                            userToken={token}
                            imageToken={image}
                        />
                    </div>
                </div>
                <CallDurationCommon
                    displayName={displayName}
                    callStateView={callStateView}
                    dateLog={dateLog}
                    timeIng={timeIng}
                    durationTime={durationTime}
                    showDuration={showDuration}
                    callType={props.callLog.callType}
                />
            </li>
        </>
    }
}

export default OneToOneCall;
