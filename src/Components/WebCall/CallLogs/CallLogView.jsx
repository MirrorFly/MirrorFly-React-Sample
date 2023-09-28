import React, { useCallback, useState } from 'react';
import { IconAudiocall, IconVideocall, IconVideoOutgoingCall, IconAudioOutgoingCall, IconVideoIncommingCall, IconAudioIncommingCall, IconAudioMissedCall, IconVideoMissedCall } from '../../../assets/images';
import { formatCallLogDate, formatCallLogTime, durationCallLog, getHighlightedText } from '../../../Helpers/Utility';
import ProfileImage from '../../../Components/WebChat/Common/ProfileImage'
import {getFromLocalStorageAndDecrypt} from '../../WebChat/WebChatEncryptDecrypt';
import SDK from '../../SDK';

const CallLogView = (props = {}) => {
    let { displayName, image, searchterm, callLog, emailId,initialName="", isAdminBlocked, isDeletedUser } = props;
    const [callBehaviour, setCallBehaviour] = useState("call")

    const onClick = useCallback(() => {
        if(isAdminBlocked || isDeletedUser) return;
        props.makeCall(callLog);
    })

    if (displayName && searchterm !== "" && !displayName.toLowerCase().includes(searchterm)) {
        return null;
    }

    const token = getFromLocalStorageAndDecrypt('token');
    let date = formatCallLogDate(callLog.callTime / 1000);
    let time = formatCallLogTime(callLog.callTime);
    let durationText = "";
    let showDuration = false;
    if (callLog.startTime && callLog.endTime) {
        durationText = durationCallLog(callLog.startTime, callLog.endTime);
        showDuration = true;
    }

    let callState = callLog.callState;
    let callStateView = "";
    if (callState === 0) {
        callStateView = props.callLog.callType === "video" ? <IconVideoMissedCall /> : <IconAudioMissedCall/>;
    } else if (callState === 1) {
        callStateView = props.callLog.callType === "video" ? <IconVideoOutgoingCall /> : <IconAudioOutgoingCall/> ;
    } else {
        callStateView = props.callLog.callType === "video" ? <IconVideoIncommingCall /> : <IconAudioIncommingCall/> ;
    }

    const handleCallLogHover = () =>{
        const behaviourResponse = SDK.getCallBehaviour();
        if(behaviourResponse.data == "meet"){
            setCallBehaviour("meet")
        }
    }

    return <li className={`chat-list-li ${(isAdminBlocked || isDeletedUser) ? "pointer-default-all" : ""}`} onClick={onClick}>
        <ProfileImage
            chatType={callLog.callMode === "onetoone" ? 'chat' : 'groupchat'}
            userToken={token}
            imageToken={isAdminBlocked ? "" : image}
            emailId={emailId}
            name={initialName}
        />
        <div className="recentchats">
            <div className="callInfo">
                <div className="recent-username-block">
                    <div className="recent-username">
                        <div className="username">
                            <h3 title={displayName}>
                                {searchterm ? getHighlightedText(displayName, searchterm) : displayName}
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="CallStatus">
                    <i>
                        {callStateView}
                    </i>
                    <div className="callOn">
                        <span className="callOn">{date},</span> <span className="callTime">
                            {time}
                        </span></div>
                </div>
            </div>
            <div className="callAction" onMouseEnter={handleCallLogHover}>
                {showDuration &&
                    <span className="callDuration" >{durationText}</span>}
                <i className="callType" style={{cursor:callBehaviour == 'meet' ? "not-allowed":"pointer" }}>
                    {props.callLog.callType === "video" ? <IconVideocall /> : <IconAudiocall />}
                </i>
            </div>
        </div>
    </li>
}

export default CallLogView;
