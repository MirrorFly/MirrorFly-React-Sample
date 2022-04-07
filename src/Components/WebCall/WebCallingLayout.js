import React, { Component } from 'react';
import SDK from '../SDK';
import { connect } from 'react-redux';
import { showConfrence } from '../../Actions/CallAction';
import Store from '../../Store';
import WebChatProfileImg from '../WebChat/Profile/WebChatProfileImg';
import { getFormatPhoneNumber, capitalizeFirstLetter } from '../../Helpers/Utility';
import callLogs from '../WebCall/CallLogs/callLog'
import { ReactComponent as BackToChat } from '../../assets/images/webcall/backToChat.svg';
import CallControlButtons from './CallControlButtons';
import { CALL_ENGAGED_STATUS_MESSAGE, CALL_SESSION_STATUS_CLOSED, DISCONNECTED_SCREEN_DURATION } from '../../Helpers/Call/Constant';
import { dispatchDisconnected, getCallDisplayDetailsForOnetoManyCall } from '../../Helpers/Call/Call';
import { getUserDetails, initialNameHandle } from '../../Helpers/Chat/User';
import Logo from '../../assets/images/new-images/logoNew.png';
import { resetCallData } from '../../Components/callbacks';
import { getGroupData } from '../../Helpers/Chat/Group';
import SmallVideo from './SmallVideo';
import CallerProfileList from "./CallerProfileList";

class WebCallingLayout extends Component {
    audio = new Audio('sounds/outgoingRinging.wav');
    audioConnecting = new Audio('sounds/outgoingRinging.wav');
    constructor(props) {
        super(props)
        this.state = {
            callConnectionDate: "",
            showMemberNames: false,
            callingUiStatus: "Trying to connect"
        }
        this.timer = null;
        this.uiChangetimer = null;
    }

    componentDidMount() {
        if (this.props.callConnectionDate && this.props.callConnectionDate.data) {
            this.setState({ callConnectionDate: this.props.callConnectionDate.data })
        }
        document.querySelectorAll('audio').forEach(element => {
            element.pause();
        });
        this.uiChangetimer = setTimeout(() => {
            this.setState({
                callingUiStatus: "User seems to be offline, Trying to connect"
            });
        }, 10000);
        this.timer = setTimeout(() => {
            this.endCall()
        }, 30000);
    }

    endCall = async () => {
        this.stopAudio();
        const { callConnectionDate } = this.props;
        SDK.endCall();
        dispatchDisconnected();
        resetCallData();
        callLogs.update(callConnectionDate.data.roomId, {
            "endTime": callLogs.initTime(),
            "sessionStatus": CALL_SESSION_STATUS_CLOSED
        });
        setTimeout(() => {
            localStorage.removeItem('roomName')
            localStorage.removeItem('callType')
            localStorage.removeItem('call_connection_status')
            localStorage.setItem("hideCallScreen", false);
            localStorage.setItem('callingComponent', false)
            localStorage.setItem("hideCallScreen", false);
            Store.dispatch(showConfrence({
                showComponent: false,
                showCalleComponent: false,
                stopSound: true,
                callStatusText: null
            }))
            this.setState({ sendEnd: true })
        }, DISCONNECTED_SCREEN_DURATION);
    }

    playAudio(roomId) {
        let audioPromise = null;
        if (roomId) {
            this.stopConnectingAudio();
            audioPromise = this.audio.play();
            this.audio.loop = true;
        } else {
            audioPromise = this.audioConnecting.play();
            this.audioConnecting.loop = true;
        }

        if (audioPromise !== undefined) {
            audioPromise
                .then(_ => {
                    // autoplay started
                })
                .catch(err => {
                    // catch dom exception
                    console.info(err)
                })
        }
    }
    stopAudio() {
        this.audio.loop = false;
        this.audio.pause();
        this.audio.currentTime = 0;
        this.stopConnectingAudio()
    }

    stopConnectingAudio() {
        this.audioConnecting.loop = false;
        this.audioConnecting.pause();
        this.audioConnecting.currentTime = 0;
    }

    componentWillUnmount() {
        this.stopAudio();
        clearTimeout(this.timer)
        clearTimeout(this.uiChangetimer)
    }

    displayGroupMemberNames = () => {
        const { callConnectionDate } = this.props;
        if (callConnectionDate && callConnectionDate.data && callConnectionDate.data.callMode === "onetomany") {
            let userList = callConnectionDate.data.userList.split(",");
            let callUserDetails = [];
            if (userList.length > 0) {
                userList.map(member => {
                    let rosterData = getUserDetails(member);
                    callUserDetails.push(rosterData);
                });
                return callUserDetails.map(user => {
                    const { displayName, name, username, jid, GroupUser } = user
                    let DisplayName = displayName || name || jid || username || getFormatPhoneNumber(GroupUser)
                    return (<li>{DisplayName}</li>)
                });
            }
            return [];
        }
        return [];
    }

    toggleMemberNames = () => {
        this.setState({ showMemberNames: !this.state.showMemberNames });
    }

    handleAudioMute = (audioMute) => {
        return;
    }

    handleVideoMute = (videoMute) => {
        return;
    }

    handleHideCallScreen = e => {
        e.stopPropagation();
        this.props.hideCallScreen();
    }

    getGroupDetails(groupId) {
        let rosterData = {};
        let group = getGroupData(groupId);
        rosterData.displayName = group.groupName;
        rosterData.image = group.groupImage;
        rosterData.jid = group.groupId;
        rosterData.chatType = "groupchat";
        rosterData.initialName = "";
        return rosterData;
    }

    getRosterDataForCall = () => {
        let user = "";
        let rosterData = {};
        let { callConnectionDate } = this.props;
        let callConnectionData = callConnectionDate.data;
        if (callConnectionData.callMode === "onetoone") {
            user = callConnectionData.to;
            rosterData = getUserDetails(user);
        } else if (callConnectionData.callMode === "onetomany") {
            if (callConnectionData.groupId !== "" && callConnectionData.groupId !== null && callConnectionData.groupId !== undefined) {
                user = callConnectionData.groupId.includes("@") ? callConnectionData.groupId.split('@')[0] : callConnectionData.groupId
                rosterData = this.getGroupDetails(user);
            } else {
                let userList = callConnectionData.userList.split(",");
                rosterData = getCallDisplayDetailsForOnetoManyCall(userList);
            }
        }
        return rosterData;
    }

    isOneToManyCall = () => {
        const { callConnectionDate } = this.props;
        let callConnectionData = callConnectionDate.data;
        return callConnectionData.callMode === "onetomany" && !callConnectionData.groupId;
    }
    
    render() {
        
        let { callConnectionDate, callStatus } = this.props;
        if (!callConnectionDate || !callConnectionDate.data) {
            return null;
        }
        let rosterData = this.getRosterDataForCall();
        const iniTail = initialNameHandle(rosterData, rosterData.initialName);
        let callConnectionData = callConnectionDate.data;
        let vcardData = { ...this.props.vCardData.data };
        let chatType = rosterData.chatType;
        this.audio.load();
        this.props.stopSound ? this.stopAudio() : this.playAudio(callConnectionData.roomId);
        let callType = (callConnectionDate.data.callType === "audio" || callConnectionDate.data.callType === "Audio") ? "Audio " : "Video ";
        let toUser = "";
        if (callConnectionDate.data.from && callConnectionDate.data.to) {
            if (callConnectionDate.data.to) {
                toUser = callConnectionDate.data.to.includes('@') ? callConnectionDate.data.to.split('@')[0] : callConnectionDate.data.to
            } else {
                toUser = callConnectionDate.data.from.includes('@') ? callConnectionDate.data.from.split('@')[0] : callConnectionDate.data.from
            }
        }
        let audioControl = true;
        let videoControl = true;
        if (callType === "Audio") {
            videoControl = false;
        }
        let callingUiStatus = this.state.callingUiStatus;
        vcardData.nickname = "You";
        let localVideoMuted = this.props.showConfrenceData.data.localVideoMuted;
        let localAudioMuted = this.props.showConfrenceData.data.localAudioMuted;
        let localStream = this.props.showConfrenceData.data.localStream;

        return (
            <div className="calling-Popup webcall-calling">
                <div className="optionButton visible">
                    <div>
                        <span title="Back to chat" className="BackToChat" onClick={this.handleHideCallScreen}>
                            <i className="backIcon"><span className="toggleAnimation"></span><BackToChat /></i>
                        </span>
                    </div>
                </div>
                {this.isOneToManyCall() &&
                <div className="callDetails">
                    <div style={{ visibility: "hidden" }} className="logosm">
                        <img src={Logo} alt="Logo" />
                    </div>
                <CallerProfileList rosterData={rosterData} />
                <div className="calleeDetails">
                    <div className="calle-info">
                        <span className="callerName" title={rosterData.displayName}>{rosterData.displayName ? rosterData.displayName : toUser}</span>
                        {callConnectionDate.data.callMode === "onetomany" && callConnectionDate.data.groupId &&
                            <span className="memmber-details" onClick={this.toggleMemberNames} >
                                ({callConnectionData.userList && callConnectionData.userList.split(",").length > 0 ? callConnectionData.userList.split(",").length : 0} {callConnectionData.userList.split(",").length > 1 ? "members" : "member"})
                                {this.state.showMemberNames &&
                                    <div className="popup-group-member">
                                        <ul className="group-member-list">
                                            {this.displayGroupMemberNames()}
                                        </ul>
                                    </div>
                                }
                            </span>
                        }
                        </div>
                        <span className="callingStatus">
                            <span>
                                {callStatus === "Calling" ? callingUiStatus : capitalizeFirstLetter(callStatus)} {(callStatus === 'Calling' || callStatus === 'Ringing') &&
                                    <div className="callingAnimation call">
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                    </div>
                                }
                            </span>
                        </span>
                    </div>
                    </div>
                    }

                    {!this.isOneToManyCall() && <div className="avatar-wrapper">
                        <div className="avatar" id="dominantSpeakerAvatar">
                            <div className="calling-animation-wrapper">
                                <WebChatProfileImg
                                name = {iniTail}
                                chatType={chatType}
                                rostersnap={rosterData.image}
                                jid={(rosterData.username) ? rosterData.username : rosterData.jid} />
                                        <div className="ripple-1"></div>
                                        <div className="ripple-2"></div>
                                        <div className="ripple-3"></div>
                            </div>
                            <div className="calleeDetails">
                                <div className="calle-info">
                                    <span className="callerName">{rosterData.displayName ? rosterData.displayName : toUser}</span>
                                
                                    {callConnectionDate.data.callMode === "onetomany" && callConnectionDate.data.groupId &&
                                        <span className="memmber-details" >
                                            ({callConnectionData.userList && callConnectionData.userList.split(",").length > 0 ? callConnectionData.userList.split(",").length : 0} {callConnectionData.userList.split(",").length > 1 ? "members" : "member"})
                                            {this.state.showMemberNames &&
                                                <div className="popup-group-member">
                                                    <ul className="group-member-list">
                                                        {this.displayGroupMemberNames()}
                                                    </ul>
                                                </div>
                                            }
                                        </span>
                                }
                                </div>
                                <span className="callingStatus">
                                    <span className={`${callStatus === CALL_ENGAGED_STATUS_MESSAGE ? "call-state-busy": ""} call-status`}>
                                        {callStatus === "Calling" ? callingUiStatus : capitalizeFirstLetter(callStatus)} {(callStatus === 'Calling' || callStatus === 'Ringing') &&
                                            <div className="callingAnimation call">
                                                <span className="dot"></span>
                                                <span className="dot"></span>
                                                <span className="dot"></span>
                                            </div>
                                        }
                                    </span>
                                </span>
                                
                            </div>
                        </div>
                                </div>
                    }
                <div>
                    {localStream &&
                        <div className="content-body">
                            <div className="RemoteVideo-wrapper">
                                <div data-overlap-id="call-thumbnail-view-local" className="RemoteVideo-list">
                                    <SmallVideo
                                        elKey={`local-user-video-${vcardData.fromUser}`}
                                        videoMuted={localVideoMuted}
                                        audioMuted={localAudioMuted}
                                        stream={localStream}
                                        rosterData={vcardData}
                                        jid={vcardData.fromUser}
                                        showConfrenceDataId={this.props.showConfrenceData.id}
                                        pinUserJid={null}
                                        setPinUser={false}
                                        callStatus={callStatus}
                                        inverse={true}
                                    />
                                </div>
                            </div>
                        </div>
                    }
                    <CallControlButtons
                        cssClassName="disabled-btn"
                        handleEndCall={this.endCall}
                        handleAudioMute={this.handleAudioMute}
                        handleVideoMute={this.handleVideoMute}
                        videoMute={!!localVideoMuted}
                        audioMute={true}
                        audioControl={audioControl}
                        videoControl={videoControl}
                    />
                </div>
            </div>
        )
    }
}
const mapStateToProps = state => {
    return {
        callConnectionDate: state.callConnectionDate,
        vCardData: state.vCardData,
        activeChatData: state.activeChatData,
        showConfrenceData: state.showConfrenceData
    }
}
export default connect(mapStateToProps, null)(WebCallingLayout);
