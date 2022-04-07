import React from 'react';
import "./webRtcCallStyle.scss";
import { connect } from 'react-redux';
import Logo from '../../assets/images/new-images/logoNew.png';
import Timer from './Timer';
import { getFormatPhoneNumber } from '../../Helpers/Utility';
import Store from '../../Store';
import { callConversion, isMuteAudioAction } from '../../Actions/CallAction';
import SDK from '../SDK';
import CallControlButtons from './CallControlButtons';
import BigVideo from './BigVideo';
import SmallVideo from './SmallVideo';
import AudioComponent from './Audio';
import InviteParticipants from './InviteParticipants';
import { CALL_STATUS_RECONNECT, CALL_STATUS_DISCONNECTED, CALL_STATUS_CONNECTED, CALL_STATUS_HOLD } from '../../Helpers/Call/Constant';
import { disconnectCallConnection, getMaxUsersInCall, updateCallTypeAfterCallSwitch } from '../../Helpers/Call/Call';
import { REACT_APP_XMPP_SOCKET_HOST } from '../../Components/processENV';
import { muteLocalAudio, muteLocalVideo } from '../../Components/callbacks';
import { getLocalUserDetails, getUserDetails } from '../../Helpers/Chat/User';
import { getGroupData } from '../../Helpers/Chat/Group';
import { hideModal } from '../../Actions/PopUp';
import _get from "lodash/get"
import { BackToChat, ClosePopup, IconInvite, IconParticiants } from '../../assets/images';
import CallParticipantList from './CallParticipantList/index';
import OutsideClickHandler from 'react-outside-click-handler';

var remoteStreamDatas = [];

class WebRtcCall extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            invite: false,
            callState: true,
            tileView: false,
            visible: true,
            localVideoMuted: this.props.localVideoMuted,
            isAllUserReconnecting: false,
            ParticipantListPopup:false,
            fullView:false,
        }
        this.visibleStateTimer = 0;
        this.audio = new Audio('sounds/busySignal.mp3');
    }

    playAudio() {
        this.audio.play();
        this.audio.loop = true;
    }

    stopAudio() {
        this.audio.loop = false;
        this.audio.pause();
        this.audio.currentTime = 0;
    }

    componentDidMount() {
        this.startTimer();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.localVideoMuted !== this.props.localVideoMuted) {
            this.setState({ localVideoMuted: this.props.localVideoMuted });
        }

        let callStatus = this.getCallStatus();
        if(callStatus && callStatus.toLowerCase() === CALL_STATUS_CONNECTED){
            this.stopAudio();
        }
        if(callStatus && callStatus.toLowerCase() === CALL_STATUS_RECONNECT){
            this.playReconnectingSound();
        }

        this.setLocalVideoStatus(prevProps);
    }

    componentWillUnmount() {
        this.stopAudio();
        clearTimeout(this.visibleStateTimer);
    }

    playReconnectingSound = () => {
        // If current user in reconnecting state, then play the reconnect sound
        this.playAudio();
    }

    startTimer = () => {
        clearTimeout(this.visibleStateTimer);
        this.visibleStateTimer = setTimeout(() => {
            this.setState({ visible: false });
        }, 5000)
    }

    handleInvitePeople = () => {
        const callStatus = this.getCallStatus();
        if(callStatus && (callStatus.toLowerCase() === CALL_STATUS_CONNECTED || callStatus.toLowerCase() === CALL_STATUS_HOLD)){
            this.setState({ invite: !this.state.invite });
        }
    }
    handleParticipantListPopup = (e) => {
        e.preventDefault();
        this.setState({
            participantListPopup: !this.state.participantListPopup
        });
    }
    handleListPopupClose = () => {
        this.setState({participantListPopup: false});
    }
    handleCloseInvitePeople = () => {
        this.setState({ invite: false })
        Store.dispatch(hideModal());
    }
    handleHangUp = async (e) => {
        await this.endCall()
        // this.setState({callState:false})
    }
    handleTileView = () => {
        this.setState(prevState => ({
            tileView: !prevState.tileView
        }));
    }
    handleVideoFullView = () =>{
        this.setState(prevState => ({
            fullView: !prevState.fullView
        }));
    };

    endCall = async () => {
        this.stopAudio();
        disconnectCallConnection();//hangUp calls
    }

    renderStream = (rosterData) => {
        if (this.props.localStream && this.props.remoteStream.length > 1) {
            remoteStreamDatas = [...this.props.remoteStream];
            const largeVideoUserJid = this.props.largeVideoUserJid;
            localStorage.removeItem('connecting');
            let keyFound = 0;
            let callMode = remoteStreamDatas.length > 2 ? 'onetomany' : 'onetoone';
            if (largeVideoUserJid) {
                if (remoteStreamDatas.length > 2) {
                    remoteStreamDatas.map((item, key) => {
                        if (largeVideoUserJid === item.fromJid) {
                            keyFound = key;
                        }
                    });
                }
            }
            return this.renderVideoCallUI(callMode, rosterData, keyFound);
        } else {
            return <></>;
        }
    }

    renderVideoCallUI = (callMode, rosterData, keyFound) => {
        let remoteAudioMuted = this.props.remoteAudioMuted;
        let remoteVideoMuted = this.props.remoteVideoMuted;
        let volumeLevel = this.props.volumeLevel;
        let showVoiceDetect = this.props.showVoiceDetect;
        let vcardData = {...this.props.vCardData.data};
        const isThumbnailViewOverlap = this.isThumbnailViewOverlap();
        let videoWrapperClass = "RemoteVideo-wrapper";
        if (this.state.visible) {
            videoWrapperClass = `${videoWrapperClass} visible`;
            videoWrapperClass = isThumbnailViewOverlap ? `${videoWrapperClass} top` : videoWrapperClass;
        }
        let stream = null;
        let fromJid = null;
        let callStatus = null;
        let inverse = false;
        let remoteStream = null;
        let pinUser = remoteStreamDatas.length > 2 ? true : false;
        if(callMode === "onetoone"){
            remoteStreamDatas.map((rs) => {
                let id = rs.fromJid;
                id = id.includes("@") ? id.split("@")[0] : id;
                if(id !== vcardData.fromUser){
                    remoteStream = rs;
                }
            });
            callStatus = this.getCallStatus(remoteStream.fromJid);
            stream = remoteStream.stream;
            fromJid = remoteStream.fromJid;
        } else {
            fromJid = remoteStreamDatas[keyFound].fromJid;
            let anotherUser = fromJid.includes("@") ? fromJid.split('@')[0] : fromJid;
            let largeVideoUserJid = this.props.largeVideoUserJid;
            largeVideoUserJid = largeVideoUserJid.includes("@") ? largeVideoUserJid.split('@')[0] : largeVideoUserJid
            if(largeVideoUserJid === vcardData.fromUser){
                rosterData.displayName = "You";
                rosterData.image = vcardData.image;
                rosterData.jid = vcardData.fromUser;
                rosterData.chatType = "chat";
                stream = this.props.localStream;
                inverse = true;
            } else {
                rosterData = getUserDetails(anotherUser);
                stream = remoteStreamDatas[keyFound].stream;
            }
            callStatus = this.getCallStatus(fromJid);
        }
        
        return (
            <>
                <BigVideo
                    key={fromJid}
                    videoMuted={remoteVideoMuted[fromJid] ? remoteVideoMuted[fromJid] : false}
                    audioMuted={remoteAudioMuted[fromJid] ? remoteAudioMuted[fromJid] : false}
                    stream={stream}
                    rosterData={rosterData}
                    jid={fromJid}
                    showConfrenceDataId={this.props.showConfrenceDataId}
                    remoteStreamLength={remoteStreamDatas.length}
                    callStatus={callStatus}
                    volumeLevel={volumeLevel}
                    showVoiceDetect={showVoiceDetect}
                    inverse={inverse}
                    handleVideoFullView={this.handleVideoFullView}
                    pinUserJid={this.props.pinUserJid}
                    setPinUser={pinUser}
                />
                {(callMode === "onetoone") && remoteStream && remoteStream.stream && remoteStream.stream.audio && <AudioComponent stream={remoteStream.stream.audio} id={remoteStream.stream.audio.id} muted={false}/>}
                <div className={videoWrapperClass}>
                    <div data-overlap-id="call-thumbnail-view" className="RemoteVideo-list">
                        {(callMode === "onetomany") && this.renderVideoStreamMulti(pinUser)}
                        {this.renderLocalVideoStream(pinUser)}
                    </div>
                </div>
            </>
        );
    }
    renderVideoStreamMulti = (pinUser) => {
        let pinuser = false;
        let remoteStreams = [...remoteStreamDatas];
        let remoteAudioMuted = this.props.remoteAudioMuted;
        let remoteVideoMuted = this.props.remoteVideoMuted;
        let vcardData = {...this.props.vCardData.data};
        console.log("remoteStreams => ", remoteStreams);
        if (_get(remoteStreams,"length",0) > 0) {
            return remoteStreams.map((remoteStream, index) => {
                let id = remoteStream.fromJid;
                id = id.includes("@") ? id.split("@")[0] : id;
                if(id !== vcardData.fromUser){
                    let stream = remoteStream.stream;
                    if(!stream) {
                        stream = {
                            id: null,
                            audio: null,
                            video: null
                        };
                    }
                    let fromJid = remoteStream.fromJid;
                    let anotherUser = fromJid.includes("@") ? fromJid.split('@')[0] : fromJid;
                    let rosterData = getUserDetails(anotherUser);
                    let callStatus = "";

                    const showConfrenceData = this.props.showConfrenceData;
                    const data = (showConfrenceData && showConfrenceData.data) || {};
                    if (data.callStatusText === CALL_STATUS_DISCONNECTED || data.callStatusText === CALL_STATUS_RECONNECT) {
                        callStatus = data.callStatusText;
                    } else {
                        callStatus = remoteStream.status;
                    }

                    if(pinUser && callStatus){
                        callStatus = callStatus.toLowerCase();
                        if(callStatus === CALL_STATUS_CONNECTED || callStatus === CALL_STATUS_RECONNECT || callStatus === CALL_STATUS_HOLD || callStatus === CALL_STATUS_DISCONNECTED){
                            pinuser = true;
                        } else {
                            pinuser = false;
                        }
                    }
                    
                    return (
                        <SmallVideo
                            key={`remote-user-video-${rosterData.jid}-${index}`}
                            videoMuted={remoteVideoMuted[remoteStream.fromJid] ? remoteVideoMuted[remoteStream.fromJid] : false}
                            audioMuted={remoteAudioMuted[remoteStream.fromJid] ? remoteAudioMuted[remoteStream.fromJid] : false}
                            stream={stream}
                            rosterData={rosterData}
                            jid={remoteStream.fromJid}
                            showConfrenceDataId={this.props.showConfrenceDataId}
                            pinUserJid={this.props.pinUserJid}
                            setPinUser={pinuser}
                            callStatus={callStatus}
                            userStatus={remoteStream.status}
                            inverse={false}
                        />
                    )
                } else {
                    return <></>;
                }
            });
        }
        return <></>;
    }

    renderLocalVideoStream = (pinUser) => {
        const { callLogData: { callAudioMute = false } = {} } = this.props;
        let stream = this.props.localStream;
        let vcardData = {...this.props.vCardData.data};
        vcardData.nickname = "You";
        let fromUser = vcardData.fromUser;
        fromUser = fromUser.includes(REACT_APP_XMPP_SOCKET_HOST) ? fromUser : fromUser + "@" + REACT_APP_XMPP_SOCKET_HOST;
        const callStatus = this.getCallStatus();
        return (
            <SmallVideo
                key={`local-user-video-${vcardData.fromuser}`}
                videoMuted={this.state.localVideoMuted}
                audioMuted={callAudioMute}
                stream={stream}
                rosterData={vcardData}
                jid={fromUser}
                showConfrenceDataId={this.props.showConfrenceDataId}
                pinUserJid={this.props.pinUserJid}
                setPinUser={pinUser}
                callStatus={callStatus}
                inverse={true}
            />
        )
    }

    handleHideCallScreen = e => {
        e.stopPropagation();
        this.props.hideCallScreen();
    }

    handleMouseMove = () => {
        let { visible } = this.state;
        if (!visible) {
            this.setState({ visible: true });
            this.startTimer();
        }
    }

    hanldeOnClick = () => {
        let { visible } = this.state;
        if (!visible) {
            this.startTimer();
        }
        this.setState({ visible: !visible })
    }

    handleAudioMute = (audioMute) => {
        const callStatus = this.getCallStatus();
        if(callStatus && (callStatus.toLowerCase() === CALL_STATUS_CONNECTED || callStatus.toLowerCase() === CALL_STATUS_HOLD)){
            if (audioMute) {
                SDK.muteAudio(true);
                muteLocalAudio(true);
                Store.dispatch(isMuteAudioAction(true));
            } else {
                SDK.muteAudio(false);
                muteLocalAudio(false);
                Store.dispatch(isMuteAudioAction(false));
            }
        }
    }

    handleVideoMute = async (videoMute) => {
        const callStatus = this.getCallStatus();
        if(callStatus && (callStatus.toLowerCase() === CALL_STATUS_CONNECTED || callStatus.toLowerCase() === CALL_STATUS_HOLD)){
            const callConnectionData = JSON.parse(localStorage.getItem('call_connection_status'));
            const callMode = (callConnectionData && callConnectionData.callMode) || '';
            const allUsersVideoMuted = await SDK.isAllUsersVideoMuted();
            if (allUsersVideoMuted && callMode === "onetoone") {
                Store.dispatch(callConversion({ status: 'request_init' }));
                return;
            }

            if (videoMute) {
                SDK.muteVideo(true);
                muteLocalVideo(true);
                this.setState({ localVideoMuted: true })
                updateCallTypeAfterCallSwitch(true);
            } else {
                SDK.muteVideo(false);
                muteLocalVideo(false);
                this.setState({ localVideoMuted: false })
            }
        }

    }

    // Mute the video when permission denied error thrown
    setLocalVideoStatus = (prevProps) => {
        const { popUpData: { modalProps: { callProcess, modelType } } } = this.props;
        const { popUpData: { modalProps: { callProcess: prevPropsCallProcess, modelType: prevPropsModelTypes } } } = prevProps;
        if (modelType && callProcess &&
            prevPropsCallProcess !== callProcess &&
            prevPropsModelTypes !== modelType &&
            ["mediaAccessError", "mediaPermissionDenied"].indexOf(modelType) > -1 &&
            callProcess === "videoUnMute"
        ) {
            this.setState({ localVideoMuted: true });
        }
    }

    swapElement(array, indexA, indexB) {
        var tmp = array[indexA];
        array[indexA] = array[indexB];
        array[indexB] = tmp;
        return array;
    }

    getGroupDetails(groupId) {
        let rosterData = {};
        let group = getGroupData(groupId);
        rosterData.displayName = group.groupName;
        rosterData.image = group.groupImage;
        rosterData.jid = group.groupId;
        rosterData.chatType = "groupchat";
        return rosterData;
    }

    getLargeVideoUserJid = () => {
        const remoteStream = this.props.remoteStream;
        if (remoteStream && remoteStream.length === 2) {
            let vcardData = getLocalUserDetails();
            let jid = "";
            remoteStream.map((rs) => {
                let id = rs.fromJid;
                id = id.includes("@") ? id.split("@")[0] : id;
                if(id !== vcardData.fromUser){
                    jid = rs.fromJid;
                }
            });
            return jid;
        }
        return this.props.largeVideoUserJid;
    }

    getCallStatus = (userid) => {
        const showConfrenceData = this.props.showConfrenceData;
        const data = (showConfrenceData && showConfrenceData.data) || {};
        if (data.callStatusText === CALL_STATUS_DISCONNECTED || data.callStatusText === CALL_STATUS_RECONNECT) return data.callStatusText;
        let vcardData = getLocalUserDetails();
        let currentUser = vcardData.fromUser;
        const remoteStream = this.props.remoteStream;
        if(!userid){
            userid = currentUser + "@" + REACT_APP_XMPP_SOCKET_HOST;
        }
        const user = remoteStream.find(item => item.fromJid === userid);
        return user && user.status;
    }

    /**
     * Calculate the thumbnail view overlap with control buttons
     */
    isThumbnailViewOverlap = () => {
        const controllButton = document.querySelectorAll('[data-overlap-id="call-controll-buttons"]');
        const thumbView = document.querySelectorAll('[data-overlap-id="call-thumbnail-view"]');
        const thumbViewLocalUser = document.querySelectorAll('[data-overlap-id="call-thumbnail-view-local"]');
        if (!controllButton ||
            (!controllButton[0]) ||
            ((!thumbView || (!thumbView[0])) && (!thumbViewLocalUser || (!thumbViewLocalUser[0])))
        ) return true;

        const controllButtonPos = (isNaN(controllButton[0].offsetLeft) ? 0 : controllButton[0].offsetLeft) + 100;
        let thumbViewPos = 0;
        let thumbViewLocalUserPos = 0;
        if (thumbView && thumbView[0]) {
            thumbViewPos = isNaN(thumbView[0].offsetLeft) ? thumbViewPos : thumbView[0].offsetLeft;
        }
        if (thumbViewLocalUser && thumbViewLocalUser[0]) {
            thumbViewLocalUserPos = isNaN(thumbViewLocalUser[0].offsetLeft) ? thumbViewLocalUserPos : thumbViewLocalUser[0].offsetLeft;
        }
        return controllButtonPos > 0 && ((thumbViewPos > 0 && thumbViewPos <= controllButtonPos) || (thumbViewLocalUserPos > 0 && thumbViewLocalUserPos <= controllButtonPos));
    }

    handleScreenShare = () => {
        SDK.startScreenShare();
    }

    renderPartipantsPopup = () => {
        const { callLogData: { callAudioMute = false } = {} } = this.props;
        let vcardData = {...this.props.vCardData.data};
        let remoteAudioMuted = this.props.remoteAudioMuted;
        let remoteVideoMuted = this.props.remoteVideoMuted;
        console.log(remoteStreamDatas , "remoteStreamDatas")
        const currentUserData = remoteStreamDatas.filter((e) => {
            let id = e.fromJid;
            id = id.includes("@") ? id.split("@")[0] : id;
            if(id === vcardData.fromUser){
                return e;
            }
        });
        const otherUsersData = remoteStreamDatas.map((e) => {
            let id = e.fromJid;
            id = id.includes("@") ? id.split("@")[0] : id;
            if(id !== vcardData.fromUser){
                return e;
            }
            return undefined;
        }).filter((undefinedRemove) => undefinedRemove !== undefined);
        const totalUsersData = [...otherUsersData, ...currentUserData];
        return totalUsersData.map((rs) => {
            let id = rs.fromJid;
            id = id.includes("@") ? id.split("@")[0] : id;
            let rosterData = getUserDetails(id);
            let audioMuted = false;
            let videoMuted = false;
            if(id === vcardData.fromUser){
                rosterData.displayName = "You";
                audioMuted = callAudioMute;
                videoMuted = this.state.localVideoMuted;
            } else {
                audioMuted = remoteAudioMuted[rs.fromJid];
                videoMuted = remoteVideoMuted[rs.fromJid];
            }
            return <CallParticipantList
                userStatus={this.getCallStatus(rs.fromJid)}
                name={rosterData.displayName}
                initialName={rosterData.initialName}
                imageUrl={rosterData.image}
                roster={rosterData}
                audioMuted={audioMuted}
                videoMuted={videoMuted}
            />
        });
    }

    render() {
        const { callLogData: { callAudioMute = false } = {} } = this.props;

        let { invite, callState} = this.state;
        const callConnectionData = JSON.parse(localStorage.getItem('call_connection_status'))
        let rosterData = {};
        let vcardData = getLocalUserDetails();
        let audioControl = true;
        let videoControl = true;
        if (callConnectionData) {
            let anotherUser = "";
            const largeVideoUserJid = this.getLargeVideoUserJid();
            let groupDetails = null;
            anotherUser = callConnectionData.from;
            if (callConnectionData.from && callConnectionData.from.includes("@") ? callConnectionData.from.split('@')[0] : callConnectionData.from === vcardData.fromUser) {
                anotherUser = callConnectionData.to;
            }
            if (callConnectionData.callMode === "onetoone") {
                anotherUser = largeVideoUserJid || anotherUser;
                rosterData = getUserDetails(anotherUser);
            }
            if (callConnectionData.callMode === "onetomany") {
                let user = callConnectionData.groupId !== undefined && callConnectionData.groupId !== null ? callConnectionData.groupId : callConnectionData.from;
                if (callConnectionData.groupId) {
                    groupDetails = this.getGroupDetails(user);
                }
                rosterData = getUserDetails(largeVideoUserJid);
            }
            const callStatus = this.getCallStatus(largeVideoUserJid);
            return (
                <>
                    {callState &&
                        <div className={`CallingScreenWrapper fit-layout group-video-call `} onMouseMove={this.handleMouseMove} onClick={this.hanldeOnClick}>
                            <div className={this.state.visible ? "subject visible" : "subject"}>
                                <div style={{visibility:"hidden"}} className="logosm"><img src={Logo} alt="Logo" /></div>
                                {groupDetails && <span style={{display:"none"}} className="meeting-type-text">
                                    {groupDetails.displayName ? groupDetails.displayName : getFormatPhoneNumber(callConnectionData.from)}
                                </span>}
                                <span className="meeting-type-text">{rosterData.displayName ? rosterData.displayName : getFormatPhoneNumber(callConnectionData.from)}</span>
                                <span className="subject-conference-timer"><Timer callStatus={callStatus} /></span>
                            </div>
                            <div className={this.state.visible ? "optionButton visible" : "optionButton"}>
                                <div>
                                    <span title="Back to chat" className="BackToChat" onClick={this.handleHideCallScreen}>
                                        <i className="backIcon"><span className="toggleAnimation"></span><BackToChat /></i>
                                    </span>
                                </div>
                                <div className="optionBtnGroup">
                                    {callStatus && callStatus.toLowerCase() !== CALL_STATUS_DISCONNECTED && remoteStreamDatas.length > 2 && 
                                        <OutsideClickHandler
                                            onOutsideClick={() => {
                                                this.setState({ participantListPopup: false });
                                            }}>
                                        <span className="participant-list" title="">
                                        <i className="invite" onClick={(e) => this.handleParticipantListPopup(e)}>
                                            <span className="count-badge">{remoteStreamDatas.length}</span>
                                            <IconParticiants/>
                                        </i>
                                        {
                                            this.state.participantListPopup && 
                                            <div className="CallParticipantList">
                                                <div className="participant-popup">
                                                    <div className="header">
                                                        <i onClick={()=> this.handleListPopupClose}>
                                                        <ClosePopup />
                                                        </i>
                                                        <h5>Participants</h5>
                                                    </div>
                                                    <div className="body">
                                                        <ul>
                                                        {this.renderPartipantsPopup()}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>                                           
                                        } 
                                    </span>
                                    </OutsideClickHandler>
                                    }
                                    {callStatus && callStatus.toLowerCase() !== CALL_STATUS_DISCONNECTED  && remoteStreamDatas.length < getMaxUsersInCall() &&
                                    <span className={callStatus && callStatus.toLowerCase() === CALL_STATUS_RECONNECT ?
                                         "invitePeople disabled-btn" : "invitePeople"} title="">
                                        <i className="invite" onClick={this.handleInvitePeople}>
                                            <span className="toggleAnimation"></span>
                                            <IconInvite /></i>
                                    </span>                                    
                                    }
                                </div>
                            </div>

                            <div className={`${this.state.fullView ? "fullView" : ""} content-body`}>
                                {this.renderStream(rosterData)}
                            </div>

                            <div data-overlap-id="call-controll-buttons" className={this.state.visible ? "button-group visible" : "button-group"}>
                                <CallControlButtons
                                    cssClassName={callStatus && callStatus.toLowerCase() === CALL_STATUS_RECONNECT ? "disabled-btn" : ""}
                                    videoMute={this.state.localVideoMuted}
                                    audioMute={callAudioMute}
                                    handleEndCall={this.handleHangUp}
                                    handleAudioMute={this.handleAudioMute}
                                    handleVideoMute={this.handleVideoMute}
                                    audioControl={audioControl}
                                    videoControl={videoControl}
                                />
                            </div>
                            <InviteParticipants remoteStream={this.props.remoteStream} invite={invite} closePopup={this.handleCloseInvitePeople}/>
                        </div>
                    }
                </>
            )
        }
        return null;
    }
}

const mapStateToProps = state => {
    const largeVideoUserData = state.largeVideoUserData;
    const pinUserData = state.pinUserData;
    const pinUserJid = pinUserData && pinUserData.userJid;
    const largeVideoUserJid = pinUserJid || (largeVideoUserData && largeVideoUserData.userJid);
    const volumeLevel = largeVideoUserData && largeVideoUserData.volumeLevelsBasedOnUserJid && largeVideoUserData.volumeLevelsBasedOnUserJid[largeVideoUserJid];
    const showVoiceDetect = largeVideoUserData.showVoiceDetect ? largeVideoUserData.showVoiceDetect : false;
    return {
        callConnectionDate: state.callConnectionDate,
        showConfrenceData: state.showConfrenceData,
        largeVideoUserJid,
        pinUserJid,
        volumeLevel,
        showVoiceDetect,
        popUpData: state.popUpData,
        vCardData: state.vCardData,
        callLogData: state.callLogData
    }
}

export default connect(mapStateToProps, null)(WebRtcCall);
