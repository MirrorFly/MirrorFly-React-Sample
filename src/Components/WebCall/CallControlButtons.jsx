import React, { Component } from 'react';
import { AudioOn, AudioOff, VideoOn, VideoOff, RejectCall  } from '../../assets/images';
import Store from '../../Store';
import "./CallControlButtons.scss";

class CallControlButtons extends Component{

    handleAudioMute= (e) => {
        const { callLogData: { callAudioMute = false } = {} } = Store.getState();
        e.stopPropagation();
        this.props.handleAudioMute(!callAudioMute);
    }

    handleVideoMute = (e) => {
        e.stopPropagation();
        this.props.handleVideoMute(!this.props.videoMute);
    }

    handleEndCall = (e) => {
        console.log("call data ending call in the call control button start");
        e.stopPropagation();
        console.log("call data ending call in the call control button end");
        this.props.handleEndCall();
    }
    render(){
        let { audioControl, videoControl, cssClassName} = this.props;
        return(
            <div className="caling-button-group button-group-center">
                { audioControl &&
                    <span className={`${cssClassName}  ${this.props.audioMute ? "mute" : ""}`} title="Mute / Unmute" onClick={this.handleAudioMute} >
                        <i className={this.props.audioMute ? "audioBtn mute" : "audioBtn "}>
                             { this.props.audioMute ? <AudioOff/> : <AudioOn/> }
                        </i>
                    </span>
                }
                <span title="Hangup" className="btnHangup rejectCall" onClick={this.handleEndCall}><i><RejectCall/></i></span>
                { videoControl &&
                    <span className={`${cssClassName}  ${this.props.videoMute ? "mute" : ""}`} title="Start / Stop Camera" onClick={this.handleVideoMute}>
                        <i className={this.props.videoMute ? "videoBtn mute" : "videoBtn"}>
                        { this.props.videoMute ? <VideoOff/> : <VideoOn/> }
                        </i>
                    </span>
                }
            </div>
        )
    }
}

export default CallControlButtons;
