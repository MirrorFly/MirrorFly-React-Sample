import React from 'react';
import { ReactComponent as IconAudiocall } from '../../../assets/images/webcall/webcall-audio.svg';
import { ReactComponent as IconVideocall } from '../../../assets/images/webcall/webcall-video.svg';

const CallDurationCommon = (props = {}) => {
    const {
        dateLog = "",
        timeIng = "",
        callType = "",
        displayName = "",
        durationTime = "",
        callStateView = "",
        showDuration = false,
    } = props;
    return (
        <div className="recentchats">
            <div className="callInfo">
                <div className="recent-username-block">
                    <div className="recent-username">
                        <div className="username">
                            <h3 title={displayName}>{displayName}</h3>
                        </div>
                    </div>
                </div>
                <div className="CallStatus">
                    <i>
                        {callStateView}
                    </i>
                    <div className="callOn">
                        <span className="callOn">
                            {dateLog},
                                </span>
                        <span className="callTime">
                            {timeIng}
                        </span>
                    </div>
                </div>
            </div>
            <div className="callAction">
                {showDuration &&
                    <span className="callDuration" >{durationTime}</span>}
                <i className="callType" >
                    {callType === "video" ? <IconVideocall /> : <IconAudiocall />}
                </i>
            </div>
        </div>
    )
}

export default CallDurationCommon;
