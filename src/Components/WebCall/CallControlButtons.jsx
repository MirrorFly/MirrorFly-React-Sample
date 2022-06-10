import React, { Component } from 'react';
import { AudioOn, AudioOff, VideoOn, VideoOff, RejectCall } from '../../assets/images';
import Store from '../../Store';
import "./CallControlButtons.scss";
import { connect } from 'react-redux';

class CallControlButtons extends Component {
    handleAudioMute = (e) => {
        const { callLogData: { callAudioMute = false } = {} } = Store.getState();
        e.stopPropagation();
        this.props.handleAudioMute(!callAudioMute);
    }

    handleVideoMute = (e) => {
        e.stopPropagation();
        this.props.handleVideoMute(!this.props.videoMute);
    }

    handleEndCall = (e) => {
        e.stopPropagation();
        this.props.handleEndCall();
    }

    render() {
        let { audioControl, videoControl, cssClassName, videoPermissionDisabled } = this.props;

        return (
            <div className="caling-button-group button-group-center">
                {audioControl &&
                    <span className={`${cssClassName}  ${this.props.audioMute ? "mute" : ""}`} title="Mute / Unmute" onClick={this.handleAudioMute} >
                        <i className={this.props.audioMute ? "audioBtn mute" : "audioBtn "}>
                            {this.props.audioMute ? <AudioOff /> : <AudioOn />}
                        </i>
                    </span>
                }
                <span title="Hangup" className="btnHangup rejectCall" onClick={this.handleEndCall}><i><RejectCall /></i></span>
                {videoControl &&
                    <span className={`${cssClassName}  ${this.props.videoMute ? "mute" : ""} ${videoPermissionDisabled ? "not-allowed" : ""} `} title={videoPermissionDisabled ? "Camera Permission Disabled" : "Start / Stop Camera"} onClick={videoPermissionDisabled ? undefined : this.handleVideoMute}>
                        <i className={this.props.videoMute ? "videoBtn mute" : "videoBtn"}>
                            {this.props.videoMute ? <VideoOff /> : <VideoOn />}
                        </i>
                    </span>
                }
            </div>
        )
    }
}
const mapStateToProps = state => {
    return {
        activeChatData: state.activeChatData,
    }
}
export default connect(mapStateToProps, null)(CallControlButtons);
