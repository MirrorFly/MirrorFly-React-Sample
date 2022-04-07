import React, { useCallback } from 'react';
import { IconIncoming, IconOutgoing, IconIncomingMissed, IconAudiocall, IconVideocall } from '../../../assets/images';
import { formatCallLogDate, formatCallLogTime, durationCallLog, getHighlightedText } from '../../../Helpers/Utility';
import ProfileImage from '../../../Components/WebChat/Common/ProfileImage'

const CallLogView = (props = {}) => {
    let { displayName, image, searchterm, callLog, emailId,initialName="" } = props;

    const onClick = useCallback(() => {
        props.makeCall(callLog)
    })

    if (displayName && searchterm !== "" && !displayName.toLowerCase().includes(searchterm)) {
        return null;
    }

    const token = localStorage.getItem('token');
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
        callStateView = <IconIncomingMissed />;
    } else if (callState === 1) {
        callStateView = <IconOutgoing />
    } else {
        callStateView = <IconIncoming />
    }

    return <li className="chat-list-li" onClick={onClick}>
        <ProfileImage
            chatType={callLog.callMode === "onetoone" ? 'chat' : 'groupchat'}
            userToken={token}
            imageToken={image}
            emailId={emailId}
            name={initialName}
        />
        <div className="recentchats">
            <div className="callInfo">
                <div className="recent-username-block">
                    <div className="recent-username">
                        <span className="username">
                            <h3 title={displayName}>
                                {searchterm ? getHighlightedText(displayName, searchterm) : displayName}
                            </h3>
                        </span>
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
            <div className="callAction">
                {showDuration &&
                    <span className="callDuration" >{durationText}</span>}
                <i className="callType">
                    {props.callLog.callType === "video" ? <IconVideocall /> : <IconAudiocall />}
                </i>
            </div>
        </div>
    </li>
}

export default CallLogView;
