import React from 'react';
import "./webRtcCallStyle.scss";
import "./audio-detection.scss";
import { connect } from 'react-redux';
import Logo from '../../assets/images/new-images/logoNew.png';
import Timer from './Timer';
import { getFormatPhoneNumber, getGridDimensions } from '../../Helpers/Utility';
import Store from '../../Store';
import { callConversion, callIntermediateScreen, isMuteAudioAction, showConfrence } from '../../Actions/CallAction';
import SDK from '../SDK';
import CallControlButtons from './CallControlButtons';
import BigVideo from './BigVideo';
import SmallVideo from './SmallVideo';
import AudioComponent from './Audio';
import InviteParticipants from './InviteParticipants';
import { CALL_STATUS_RECONNECT, CALL_STATUS_DISCONNECTED, CALL_STATUS_CONNECTED, CALL_STATUS_HOLD, CALL_STATUS_ENDED } from '../../Helpers/Call/Constant';
import { disconnectCallConnection, getCallDisplayDetailsForOnetoManyCall, updateCallTypeAfterCallSwitch } from '../../Helpers/Call/Call';
import { REACT_APP_CONTACT_SYNC, REACT_APP_XMPP_SOCKET_HOST } from '../../Components/processENV';
import { muteLocalAudio, muteLocalVideo } from '../../Components/callbacks';
import { formatUserIdToJid, getLocalUserDetails, getUserDetails } from '../../Helpers/Chat/User';
import { getGroupData } from '../../Helpers/Chat/Group';
import { hideModal } from '../../Actions/PopUp';
import _get from "lodash/get"
import { BackToChat, ClosePopup, IconInvite, IconParticiants, TileView,TileViewRemove } from '../../assets/images';
import CallParticipantList from './CallParticipantList/index';
import OutsideClickHandler from 'react-outside-click-handler';
import {deleteItemFromLocalStorage, encryptAndStoreInLocalStorage, getFromLocalStorageAndDecrypt} from '../WebChat/WebChatEncryptDecrypt';
import userList from '../WebChat/RecentChat/userList';

let remoteStreamDatas = [];

class WebRtcCall extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            invite: false,
            callState: true,
            tileView: false,
            tileViewStyle: {},
            visible: true,
            localVideoMuted: this.props.localVideoMuted,
            isAllUserReconnecting: false,
            ParticipantListPopup:false,
            fullView:false
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

    handleGridDimensions = () => {
        
        const parentElement = document.querySelectorAll('[data-overlap-id="call-thumbnail-view"]');
        let height = parentElement.length > 0 && window.getComputedStyle(parentElement[0], null).getPropertyValue("height");
        height = height && height.replace("px", "");
        const { width, height: newHeight } = getGridDimensions(height, this.props?.remoteStream?.length)
        
        this.setState({
            tileViewStyle: {
                margin: "5px",
                width: `calc(${width}% - 10px)`,
                height: `calc(${newHeight}px - 0px)`
            }
        });
    }

    updateWindowDimensions = (event) => {
        if (this.state.tileView) this.handleGridDimensions();
    }

    componentDidMount() {
        this.startTimer();
        window.addEventListener("resize", this.updateWindowDimensions);
    }

    componentDidUpdate(prevProps, preState) {
        
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

        if ((preState.tileView !== this.state.tileView) || (prevProps.showConfrenceDataId !== this.props.showConfrenceDataId)) {
            if (this.state.tileView && remoteStreamDatas.length > 1) {
                setTimeout(() => {
                    this.handleGridDimensions();
                }, 100);
            } else {
                this.setState({
                    tileViewStyle: {},
                    tileView: false
                });
            }
        }
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
        const isInviteStatus = encryptAndStoreInLocalStorage('inviteStatus', true);
        const callStatus = this.getCallStatus();
        if (!REACT_APP_CONTACT_SYNC && isInviteStatus) {
            const callConnectionData = JSON.parse(getFromLocalStorageAndDecrypt('call_connection_status'));
            const {callMode, groupId} = callConnectionData;
            if((!callConnectionData.hasOwnProperty('groupId') || groupId === null || "") && (callMode === "onetoone" || callMode === "onetomany")){
                userList.getUsersListFromSDK(1);
            }
        }
        if(callStatus && (callStatus.toLowerCase() === CALL_STATUS_CONNECTED || callStatus.toLowerCase() === CALL_STATUS_HOLD)){
            this.setState({ invite: !this.state.invite });
        }
    }
    handleParticipantListPopup = (e) => {
        e.preventDefault();
        this.setState({
            ParticipantListPopup: !this.state.ParticipantListPopup
        });
    }
    handleListPopupClose = () => {
        this.setState({ParticipantListPopup: false});
    }
    handleCloseInvitePeople = () => {
        this.setState({ invite: false })
        Store.dispatch(hideModal());
        deleteItemFromLocalStorage('inviteStatus');
    }
    handleHangUp = async (e) => {
        await this.endCall()
        // this.setState({callState:false})
    }
    handleTileView = () => {
     if(remoteStreamDatas.length > 1){
        this.setState(prevState => ({
            tileView: !prevState.tileView
        }));
      }
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

    handleCallBehaviour = () =>{
        const behaviourResponse = SDK.getCallBehaviour();
        if (behaviourResponse.statusCode === 200) {
          return behaviourResponse.data;
        } else return "call";
    }

    renderStream = (rosterData) => {
        if (this.props.localStream) {
            remoteStreamDatas = [...this.props.remoteStream];
            const remoteStreamLength = remoteStreamDatas.length;
            const largeVideoUserJid = this.props.largeVideoUserJid;
            deleteItemFromLocalStorage('connecting');
            let keyFound = 0;
            let callMode = remoteStreamDatas.length > 2 ? 'onetomany' : 'onetoone';
            if (largeVideoUserJid) {
                if (remoteStreamDatas.length > 2) {
                    remoteStreamDatas.forEach((item, key) => {
                        if (largeVideoUserJid === item.fromJid) {
                          keyFound = key;
                        }
                      });
                }
            }
            return this.renderVideoCallUI(callMode, rosterData, keyFound, remoteStreamLength);
        } else {
            return <></>;
        }
    }

    renderVideoCallUI = (callMode, rosterData, keyFound, remoteStreamLength) => {
        let remoteAudioMuted = this.props.remoteAudioMuted;
        let remoteVideoMuted = this.props.remoteVideoMuted;
        let volumeLevel = this.props.volumeLevel;
        let volumeVideo = this.props.volumeLevelVideo;
        let showVoiceDetect = this.props.showVoiceDetect;
        let vcardData = {...this.props.vCardData.data};
        const isThumbnailViewOverlap = this.isThumbnailViewOverlap();
        let behaviour = this.handleCallBehaviour();
        
        let videoWrapperClass = (behaviour == "meet" && remoteStreamLength == 1) || (behaviour === "call" && remoteStreamLength == 1) ? "" : "RemoteVideo-wrapper";
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
            remoteStreamDatas.forEach((rs) => {
                let id = rs.fromJid;
                id = id.includes("@") ? id.split("@")[0] : id;
                if((behaviour === "meet" && remoteStreamLength == 1 )||(behaviour === "call" && remoteStream == null && remoteStreamLength == 1)){
                    remoteStream = rs; 
                    rosterData = getUserDetails(remoteStream.fromJid);
                }
                else{
                    if(id !== vcardData.fromUser){
                        remoteStream = rs;
                    }
                } 
            });
           
            callStatus = this.getCallStatus(remoteStream.fromJid);
            stream =  (behaviour === "meet" && remoteStreamLength == 1) ? this.props.localStream : remoteStream.stream;
            fromJid = remoteStream.fromJid;
        } else {
            fromJid = remoteStreamDatas[keyFound].fromJid;
            let anotherUser = fromJid.includes("@") ? fromJid.split('@')[0] : fromJid;
            let largeVideoUserJid = this.props.largeVideoUserJid || "";
            largeVideoUserJid = largeVideoUserJid.includes("@") ? largeVideoUserJid.split('@')[0] : largeVideoUserJid
            if(largeVideoUserJid === vcardData.fromUser){
                rosterData = getUserDetails(largeVideoUserJid);
                stream = this.props.localStream;
                inverse = true;
                remoteVideoMuted[fromJid] = this.state.localVideoMuted;
            } else {
                rosterData = getUserDetails(anotherUser);
                stream = remoteStreamDatas[keyFound].stream;
            }
            callStatus = this.getCallStatus(fromJid);
        }
        
        return (
            <>
                {!this.state.tileView && <BigVideo
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
                    volumeVideo={volumeVideo}
                    showVoiceDetect={showVoiceDetect}
                    inverse={inverse}
                    handleVideoFullView={this.handleVideoFullView}
                    pinUserJid={this.props.pinUserJid}
                    setPinUser={pinUser}
                    vcardData={vcardData}
                />}
                {(callMode === "onetoone") && remoteStream && remoteStream.stream && remoteStream.stream.audio && <AudioComponent stream={remoteStream.stream.audio} id={remoteStream.stream.audio.id} muted={false}/>}
                <div className={videoWrapperClass}>
                    <div data-overlap-id="call-thumbnail-view" className="RemoteVideo-list">
                        {(callMode === "onetomany" || this.state.tileView) && this.renderVideoStreamMulti(pinUser)}
                        {this.renderLocalVideoStream(pinUser, behaviour, remoteStreamLength)}
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
        const renderUIStreams = this.renderUIStreams(remoteStreams)
        
        if (_get(renderUIStreams,"length",0) > 0 ) {
            return renderUIStreams.map((remoteStream, index) => {
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

                    let videoMuted = remoteVideoMuted[remoteStream.fromJid] ? remoteVideoMuted[remoteStream.fromJid] : false, 
                        audioMuted = remoteAudioMuted[remoteStream.fromJid] ? remoteAudioMuted[remoteStream.fromJid] : false;
                    if (id === vcardData.fromUser && this.state.tileView) {
                        const { callLogData: { callAudioMute = false } = {} } = this.props;
                        stream = this.props.localStream;
                        videoMuted = this.state.localVideoMuted;
                        audioMuted = callAudioMute;
                    }
                    
                    let videoTrackId = stream?.video?.getVideoTracks().length > 0 ? stream?.video?.getVideoTracks()[0].id : "";
                    let audioTrackId = stream?.audio?.getAudioTracks().length > 0 ? stream?.audio?.getAudioTracks()[0].id : "";

                    return (
                        <SmallVideo
                            key={fromJid}
                            elKey={`remote-user-video-${fromJid}`}
                            videoMuted={videoMuted}
                            audioMuted={audioMuted}
                            stream={stream}
                            rosterData={rosterData}
                            jid={fromJid}
                            showConfrenceDataId={this.props.showConfrenceDataId}
                            pinUserJid={this.props.pinUserJid}
                            setPinUser={pinuser}
                            callStatus={callStatus}
                            userStatus={remoteStream.status}
                            inverse={false}
                            usersCount={renderUIStreams.length}
                            tileView={this.state.tileView}
                            tileViewStyle={this.state.tileViewStyle}
                            videoTrackId={videoTrackId}
                            audioTrackId={audioTrackId}
                        />
                    )
                } else {
                    return <></>;
                }
            });
        }
        return <></>;
    }

    renderLocalVideoStream = (pinUser, behaviour, remoteStreamLength) => {
        const { callLogData: { callAudioMute = false } = {} } = this.props;
        let stream = this.props.localStream;
        let vcardData = {...this.props.vCardData.data};
        vcardData.nickname = "You";
        let fromUser = vcardData.fromUser;
        fromUser = fromUser.includes(REACT_APP_XMPP_SOCKET_HOST) ? fromUser : fromUser + "@" + REACT_APP_XMPP_SOCKET_HOST;
        const callStatus = this.getCallStatus();
        let videoTrackId = stream?.video?.getVideoTracks().length > 0 ? stream?.video?.getVideoTracks()[0].id : "";
        let audioTrackId = stream?.audio?.getAudioTracks().length > 0 ? stream?.audio?.getAudioTracks()[0].id : "";
        if(behaviour === "meet" && remoteStreamLength == 1 || behaviour === "call" && remoteStreamLength == 1 ) return <></>
        return (
            <SmallVideo
                elKey={`local-user-video-${vcardData.fromUser}`}
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
                usersCount={remoteStreamDatas.length}
                tileView={this.state.tileView}
                tileViewStyle={this.state.tileViewStyle}
                videoTrackId={videoTrackId}
                audioTrackId={audioTrackId}
            />
        )
    }

    handleHideCallScreen = e => {
        e.stopPropagation();
        Store.dispatch(callIntermediateScreen({ show: false }));
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

    handleAudioMute = async (audioMute) => {
        const callStatus = this.getCallStatus();
        if(callStatus && (callStatus.toLowerCase() === CALL_STATUS_CONNECTED || callStatus.toLowerCase() === CALL_STATUS_HOLD)){
            const audioMuteResult = await SDK.muteAudio(audioMute);
            if (audioMuteResult?.statusCode === 200) {
                muteLocalAudio(audioMute);
                Store.dispatch(isMuteAudioAction(audioMute));
                Store.dispatch(showConfrence({
                    ...this.props.showConfrenceData?.data,
                    localAudioMuted: !audioMute
                }));
            }
        }
    }

    handleVideoMute = async (videoMute) => {
        const callStatus = this.getCallStatus();
        if(callStatus && (callStatus.toLowerCase() === CALL_STATUS_CONNECTED || callStatus.toLowerCase() === CALL_STATUS_HOLD)){
            const callConnectionData = JSON.parse(getFromLocalStorageAndDecrypt('call_connection_status'));
            const callMode = (callConnectionData && callConnectionData.callMode) || '';
            const allUsersVideoMuted = await SDK.isAllUsersVideoMuted();
            const behaviour = this.handleCallBehaviour();
            if (allUsersVideoMuted && callMode === "onetoone" && behaviour != "meet") {
                this.setState({ localVideoMuted: this.props.showConfrenceData?.data?.localVideoMuted })
                Store.dispatch(callConversion({ status: 'request_init' }));
                return;
            }

            const videoMuteResult = await SDK.muteVideo(videoMute);
            console.log('Call videoMuteResult :>> ', videoMuteResult?.statusCode, this.props.showConfrenceData?.data?.localVideoMuted, videoMute);
            if (videoMuteResult?.statusCode === 200) {
                muteLocalVideo(videoMute);
                this.setState({ localVideoMuted: videoMute })
                if (videoMute) updateCallTypeAfterCallSwitch(videoMute);
            } else if (videoMuteResult?.statusCode === 500) {
                const { data = {} } = this.props.showConfrenceData || {};
                Store.dispatch(showConfrence({ ...data, videoPermissionDisabled: true }));
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

    getGroupDetails(groupId) {
        let rosterData = {};
        let group = getGroupData(groupId);
        rosterData.displayName = group.groupName;
        rosterData.image = group.groupImage;
        rosterData.thumbImage = group.thumbImage;
        rosterData.jid = group.groupId;
        rosterData.chatType = "groupchat";
        return rosterData;
    }

    getLargeVideoUserJid = () => {
        const remoteStream = this.props.remoteStream;
        const behaviour = this.handleCallBehaviour();
        if (remoteStream && remoteStream.length === 2 || behaviour == "meet") {
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

    renderUIStreams = (remoteStreamDatas) =>{
        let vcardData = getLocalUserDetails();
        const localUserJid = formatUserIdToJid(vcardData.userId)
        const filteredLocalStream = remoteStreamDatas.filter(item => item.fromJid === localUserJid);
        const filteredOtherUsersStream = remoteStreamDatas.filter(item => item.hasOwnProperty('stream') && (item.status != CALL_STATUS_DISCONNECTED) && (item.status != CALL_STATUS_ENDED));
        const filteredRemoteUserStream = [...filteredLocalStream, ...filteredOtherUsersStream];
        return filteredRemoteUserStream
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

    renderPartipantsPopup = () => {
        const { callLogData: { callAudioMute = false } = {} } = this.props;
        let vcardData = {...this.props.vCardData.data};
        let remoteAudioMuted = this.props.remoteAudioMuted;
        let remoteVideoMuted = this.props.remoteVideoMuted;
        const renderUIStreams = this.renderUIStreams(remoteStreamDatas)
        const currentUserData = renderUIStreams.filter((e) => {
            let id = e.fromJid;
            id = id.includes("@") ? id.split("@")[0] : id;
            if(id === vcardData.fromUser){
                return e;
            }
        });
        const otherUsersData = renderUIStreams.map((e) => {
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
                key={id}
                userStatus={this.getCallStatus(rs.fromJid)}
                name={rosterData.displayName}
                initialName={rosterData.initialName}
                imageUrl={(rosterData.thumbImage && rosterData.thumbImage !== "") ? rosterData.thumbImage : rosterData.image}
                roster={rosterData}
                audioMuted={audioMuted}
                videoMuted={videoMuted}
            />
        });
    }


    renderOptionButtonGroup(callStatus, tileView) {
        const participantDatas = [...this.props.remoteStream]
        const updatedParticipants = this.renderUIStreams(participantDatas)
        return (
            <div className="optionBtnGroup">
            <span
                className={`${callStatus && callStatus.toLowerCase() === CALL_STATUS_RECONNECT ? "disabled-btn" : ""}${
                    !tileView ? " tileViewRemove " : " tileView "
                } `}
                title="Toggle tile view"
                >
                <i className="tileView" onClick={this.handleTileView}>
                    <span className="toggleAnimation"></span>
                    {!tileView ? <TileView /> : <TileViewRemove />}
                </i>
            </span>

            {callStatus && callStatus.toLowerCase() !== CALL_STATUS_DISCONNECTED && updatedParticipants.length > 2 && 
                <OutsideClickHandler
                    onOutsideClick={() => {
                        this.setState({ ParticipantListPopup: false });
                    }}>
                <span className="participant-list" title="">
                <i className="invite" onClick={(e) => this.handleParticipantListPopup(e)}>
                    <span className="count-badge">{updatedParticipants.length}</span>
                    <IconParticiants/>
                </i>
                {
                    this.state.ParticipantListPopup && 
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
            {callStatus && callStatus.toLowerCase() !== CALL_STATUS_DISCONNECTED &&
            <span className={callStatus && callStatus.toLowerCase() === CALL_STATUS_RECONNECT ?
                 "invitePeople disabled-btn" : "invitePeople"} title="">
                <i className="invite" onClick={this.handleInvitePeople}>
                    <span className="toggleAnimation"></span>
                    <IconInvite /></i>
            </span>                                    
            }   
        </div>
        );
      }

    render() {
        const { tileView } = this.state;
        const { callLogData: { callAudioMute = false } = {}, showConfrenceData: { data: { videoPermissionDisabled = false } = {}} = {} } = this.props;

        let { invite, callState} = this.state;
        const callConnectionData = JSON.parse(getFromLocalStorageAndDecrypt('call_connection_status'))
        let rosterData = {};
        let vcardData = getLocalUserDetails();
        let audioControl = true;
        let videoControl = true;
        const behaviour = this.handleCallBehaviour();
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
                    rosterData = getUserDetails(largeVideoUserJid);
                } else {
                    if (this.props.remoteStream?.length) {
                        let usersList = this.props.remoteStream.map((item, key) =>  item.fromJid);
                        rosterData = getCallDisplayDetailsForOnetoManyCall(usersList);
                    } else {
                        rosterData = getUserDetails(largeVideoUserJid);
                    }
                }
            }
            const callStatus = this.getCallStatus(largeVideoUserJid);

            return (
                <>
                    {callState &&
                        <div 
                            className={`CallingScreenWrapper fit-layout ${tileView ? "tileView" : "group-video-call"} `} 
                            onMouseMove={this.handleMouseMove} 
                            onClick={this.hanldeOnClick}
                            id="webrtc-call-screen"
                            >
                            <div className={this.state.visible ? "subject visible" : "subject"}>
                                <div style={{visibility:"hidden"}} className="logosm"><img src={Logo} alt="Logo" /></div>
                                {this.props.remoteStream.length > 1 &&
                                    (groupDetails ? (
                                    <span className="meeting-type-text">
                                        {groupDetails.displayName
                                        ? groupDetails.displayName
                                        : getFormatPhoneNumber(callConnectionData.from)}
                                    </span>
                                    ) : (
                                    <span className="meeting-type-text">
                                        {rosterData.displayName
                                        ? rosterData.displayName
                                        : getFormatPhoneNumber(callConnectionData.from)}
                                    </span>
                                ))}
                                <span className="subject-conference-timer">
                                   {(callStatus && callStatus.toLowerCase() == CALL_STATUS_RECONNECT) || behaviour != "meet" ? <Timer callStatus={callStatus} /> : null} 
                                </span>
                            </div>
                            <div className={this.state.visible ? "optionButton visible" : "optionButton"}>
                                <div>
                                    <span title="Back to chat" className="BackToChat" onClick={this.handleHideCallScreen}>
                                        <i className="backIcon"><span className="toggleAnimation"></span><BackToChat /></i>
                                    </span>
                                </div>
                                {this.renderOptionButtonGroup(callStatus, tileView)}
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
                                    videoPermissionDisabled={videoPermissionDisabled}
                                />
                            </div>
                            <InviteParticipants remoteStream={this.props.remoteStream} invite={invite} closePopup={this.handleCloseInvitePeople} callBehaviour={behaviour} />
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
    const volumeLevelVideo = largeVideoUserData && largeVideoUserData.volumeLevelsBasedOnUserJid && largeVideoUserData.volumeLevelVideo;
    const showVoiceDetect = largeVideoUserData.showVoiceDetect ? largeVideoUserData.showVoiceDetect : false;
    return {
        callConnectionDate: state.callConnectionDate,
        showConfrenceData: state.showConfrenceData,
        largeVideoUserJid,
        pinUserJid,
        volumeLevel,
        showVoiceDetect,
        volumeLevelVideo,
        popUpData: state.popUpData,
        vCardData: state.vCardData,
        callLogData: state.callLogData,
        rosterData: state.rosterData
    }
}

export default connect(mapStateToProps, null)(WebRtcCall);
