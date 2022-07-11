import React, { useCallback } from 'react';
import { IconIncoming, IconOutgoing,IconIncomingMissed,IconAudiocall,IconVideocall} from '../../../assets/images';
import ProfileImage from '../../../Components/WebChat/Common/ProfileImage'
import { formatCallLogDate, formatCallLogTime, durationCallLog, getHighlightedText } from '../../../Helpers/Utility';
import {getFromLocalStorageAndDecrypt} from '../../WebChat/WebChatEncryptDecrypt';

const GroupCall = (props) => {
    let { displayName, jid, image, searchterm, callLog } = props;

    const onClick = useCallback(() => {
        props.makeCall(jid, callLog.callType)
    })

    const iconCommon = (callStateIcon) => {
        return callStateIcon === 1 ? <IconIncoming /> : <IconOutgoing />
    }

    const token = getFromLocalStorageAndDecrypt('token');
    let date = formatCallLogDate(callLog.callTime / 1000);
    let time = formatCallLogTime(callLog.callTime);
    let durationText = "";
    let showDuration = false;
    if (callLog.startTime != null && callLog.startTime > 0 && callLog.endTime != null && callLog.endTime > 0) {
        durationText = durationCallLog(callLog.startTime, callLog.endTime);
        showDuration = true;
    }
    let callState;
    if (callLog.callState === 1 && callLog.startTime === 0) {
        callState = 0;
    } else {
        callState = callLog.callState
    }
    if (searchterm !== "") {
        if (displayName && displayName.toLowerCase().includes(searchterm)) {
            return <>
                <li className="chat-list-li">
                    <div className="profile-image">
                        <div className="image">
                            {/* <div>
                            <ul className="three">
                                <li title="shiva"><a><img src={SelectedFile2} alt=""/></a></li>
                                <li title="Kumar"><a><img src={SelectedFile2} alt=""/></a></li>
                                <li title="jerome"><a><img src={SelectedFile2} alt=""/></a></li>
                                {additonalMembers > 0 && <li title=""><a><span>+{additonalMembers}</span></a></li>}
                            </ul>
                        </div> */}
                            <ProfileImage
                                chattype='groupchat'
                                userToken={token}
                                imageToken={image}
                            />
                        </div>
                    </div>
                    <div className="recentchats">
                        <div className="callInfo">
                            <div className="recent-username-block">
                                <div className="recent-username">
                                    <span className="username">
                                        <h3 title={displayName}>{getHighlightedText(displayName, searchterm)}</h3>
                                    </span>
                                </div>
                            </div>
                            <div className="CallStatus">
                                <i>
                                    {callState === 0 ? <IconIncomingMissed /> : iconCommon(callState)}
                                </i>
                                <div className="callOn"><span className="callOn">{date},</span> <span className="callTime">{time}</span></div>
                            </div>
                        </div>
                        <div className="callAction">
                            {showDuration && <span className="callDuration" >{durationText}</span>}
                            <i className="callType">
                                {props.callLog.callType === "video" ? <IconVideocall /> : <IconAudiocall />}
                            </i>
                        </div>
                    </div>
                </li>
            </>
        } else {
            return <></>
        }
    } else {
        return <>
            <li className="chat-list-li" onClick={onClick}>
                <div className="profile-image">
                    <div className="image">
                        {/* <div>
                        <ul className="three">
                            <li title="shiva"><a><img src={SelectedFile2} alt=""/></a></li>
                            <li title="Kumar"><a><img src={SelectedFile2} alt=""/></a></li>
                            <li title="jerome"><a><img src={SelectedFile2} alt=""/></a></li>
                            {additonalMembers > 0 && <li title=""><a><span>+{additonalMembers}</span></a></li>}
                        </ul>
                    </div> */}
                        <ProfileImage
                            chattype='groupchat'
                            userToken={token}
                            imageToken={image}
                        />
                    </div>
                </div>
                <div className="recentchats">
                    <div className="callInfo">
                        <div className="recent-username-block">
                            <div className="recent-username">
                                <span className="username">
                                    <h3 title={displayName}>{displayName}</h3>
                                </span>
                            </div>
                        </div>
                        <div className="CallStatus">
                            <i>{callState === 0 ? <IconIncomingMissed /> : iconCommon(callState)}</i>
                            <div className="callOn"><span className="callOn">{date},</span> <span className="callTime">{time}</span></div>
                        </div>
                    </div>
                    <div className="callAction">
                        {showDuration &&
                            <span className="callDuration" >{durationText}</span>}
                        <i className="callType" >
                            {props.callLog.callType === "video" ? <IconVideocall /> : <IconAudiocall />}
                        </i>
                    </div>
                </div>
            </li>
        </>
    }
}

export default GroupCall;
