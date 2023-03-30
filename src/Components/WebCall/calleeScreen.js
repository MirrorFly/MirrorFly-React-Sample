import React, { Component } from 'react';
import SDK from '../SDK';
import { connect } from 'react-redux';
import {showConfrence} from '../../Actions/CallAction';
import Store from '../../Store';
import { RejectCall, AttenCall, BackToChat} from '../../assets/images';
import WebChatProfileImg from '../WebChat/Profile/WebChatProfileImg';
import callLogs from './CallLogs/callLog';
import { showModal } from '../../Actions/PopUp'
import { capitalizeFirstLetter } from '../../Helpers/Utility';
import { CALL_SESSION_STATUS_CLOSED, DISCONNECTED_SCREEN_DURATION, CALL_STATUS_DISCONNECTED, COMMON_ERROR_MESSAGE, PERMISSION_DENIED } from '../../Helpers/Call/Constant';
import { clearMissedCallNotificationTimer, dispatchDisconnected, getCallDisplayDetailsForOnetoManyCall } from '../../Helpers/Call/Call';
import  Logo  from '../../assets/images/new-images/logoNew.png';
import { getGroupData } from '../../Helpers/Chat/Group';
import  { resetCallData } from '../callbacks';
import { getUserDetails, initialNameHandle } from '../../Helpers/Chat/User';
import { toast } from 'react-toastify';
import CallerProfileList from "./CallerProfileList";
import { deleteItemFromLocalStorage, encryptAndStoreInLocalStorage} from '../WebChat/WebChatEncryptDecrypt';

let callingTimer;

class CalleScreen extends Component {
    audio = new Audio('sounds/ringtone.wav');
    constructor(props) {
        super(props);
        this.preventMultipleClick = false;
        this.audio.autoplay = true;
        this.audio.muted = true;
    }
    componentDidMount = () => {

        this.props.callParticiapants({
            open:false,
            modelType:'callparticipants'
        });

        document.querySelectorAll('audio').forEach(element => {
            element.pause();
        });
        this.handleIncomingCallAudio();

        this.callingTimer = setTimeout(() => {
            this.endCall();
        }, 30000);
    }

    componentDidUpdate(prevProps){
        if (this.props.adminBlockData?.data && Object.keys(this.props.adminBlockData.data).length) {
            this.stopAudio();
        }
        this.checkMediaPermission(prevProps);
    }

    checkMediaPermission = (prevProps) => {
        const { popUpData:{ modalProps:{ statusCode } } } = this.props;
        const { popUpData:{ modalProps:{ statusCode: prevStatusCode } } } = prevProps;

        if(statusCode && statusCode !== prevStatusCode){
            this.declineCall();
        }
    }

    endCall = async () => {
        clearTimeout(this.callingTimer);
        const {callConnectionDate} = this.props;
        SDK.endCall();
        dispatchDisconnected();
        resetCallData();
        callLogs.update(callConnectionDate.data.roomId, {
            "endTime": callLogs.initTime(),
            "sessionStatus": CALL_SESSION_STATUS_CLOSED
        });
        setTimeout(() => {
            encryptAndStoreInLocalStorage('callingComponent',false)
            deleteItemFromLocalStorage('roomName')
            deleteItemFromLocalStorage('callType')
            deleteItemFromLocalStorage('call_connection_status')
            encryptAndStoreInLocalStorage("hideCallScreen", false);
            Store.dispatch(showConfrence({
                showComponent: false,
                showCalleComponent:false,
                stopSound: true,
                callStatusText: null
            }))
        }, DISCONNECTED_SCREEN_DURATION);
    }

    attendCall = async ()=>{
        if(this.preventMultipleClick){
            return;
        }
        this.preventMultipleClick = true;
        this.stopAudio();
        clearTimeout(this.callingTimer)
        clearMissedCallNotificationTimer();
        if(this.props.callConnectionDate && this.props.callConnectionDate.data){
            const {callConnectionDate} = this.props
            let call = {};
                call = await SDK.answerCall()
                console.log("attend call", call);
                if(call.statusCode !== 200) {
                    if(call.message !== PERMISSION_DENIED){
                        toast.error(COMMON_ERROR_MESSAGE);
                    }
                    deleteItemFromLocalStorage('roomName')
                    deleteItemFromLocalStorage('callType')
                    deleteItemFromLocalStorage('call_connection_status')
                    encryptAndStoreInLocalStorage("hideCallScreen", false);
                    encryptAndStoreInLocalStorage('callingComponent',false)
                    encryptAndStoreInLocalStorage("hideCallScreen", false);
                    Store.dispatch(showConfrence({
                        showComponent: false,
                        showCalleComponent: false,
                        stopSound: true,
                        callStatusText: null
                    }))
                } else {
                    encryptAndStoreInLocalStorage('connecting',true)
                    Store.dispatch(showConfrence({
                        showComponent: true,
                        showCalleComponent:false
                    }))
                    callLogs.update(callConnectionDate.data.roomId, {
                        "startTime": callLogs.initTime(),
                        "callState": 2
                    });
                }
        }
    }
    declineCall = async ()=>{
        clearTimeout(this.callingTimer)
        clearMissedCallNotificationTimer();
        this.stopAudio();
        if(this.props.callConnectionDate && this.props.callConnectionDate.data){
            const {callConnectionDate} = this.props
            let call = await SDK.declineCall();
            if(call.statusCode === 200){
                callLogs.update(callConnectionDate.data.roomId, {
                    "endTime": callLogs.initTime(),
                    "sessionStatus": CALL_SESSION_STATUS_CLOSED
                });
                dispatchDisconnected();
                setTimeout(() => {
                    deleteItemFromLocalStorage('roomName')
                    deleteItemFromLocalStorage('callType')
                    deleteItemFromLocalStorage('call_connection_status')
                    encryptAndStoreInLocalStorage("hideCallScreen", false);
                    Store.dispatch(showConfrence({
                        showComponent: false,
                        showCalleComponent:false,
                        callStatusText: null
                    }))
                    resetCallData();
                }, DISCONNECTED_SCREEN_DURATION);
            } else {
                console.log("Error occured ", call.errorMessage)
            }
        }
    }

    playAudio() {
        this.audio.muted = false;
        const audioPromise = this.audio.play()
        this.audio.loop = true;
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
    }
    componentWillUnmount() {
        this.stopAudio();
        clearTimeout(this.callingTimer);
    }

    handleHideCallScreen = e => {
        e.stopPropagation();
        this.props.hideCallScreen();
    }

    getGroupDetails(groupId){
        let rosterData = {};
        let group = getGroupData(groupId);
        rosterData.displayName = group.groupName;
        rosterData.image = group.groupImage;
        rosterData.thumbImage = group.thumbImage;
        rosterData.jid = group.groupId;
        rosterData.chatType = "groupchat";
        return rosterData;
    }

    handleIncomingCallAudio = () => {
        setTimeout(() => {
            // Delay added for playing the sound.
            // While the browser tab is in idle,
            // first we need to do any action in the webage to become as active
            // Then only we can play audio
            this.audio.load()
            this.props.stopSound ? this.stopAudio() : this.playAudio();
        }, 500);
    }

    handleTernayAvoid = (isGroupCall = false, callType = "") => {
        if (this.props.callStatus === CALL_STATUS_DISCONNECTED.toLowerCase()) {
            return capitalizeFirstLetter(this.props.callStatus);
        }
        return `Incoming ${isGroupCall ? 'Group' : ''} ${callType} Call...`;
    };

    checkOneToManyCall = () => {
        const { callConnectionDate: callData } = this.props;
        let callConnectionInfo = callData.data;
        return callConnectionInfo.callMode === "onetomany" && callConnectionInfo.groupId === null;
    }

    render(){
        const {callConnectionDate} = this.props;
        
        let rosterData = {}
        let isGroupCall = false;
        let callConnectionData = "";
        if(callConnectionDate && callConnectionDate.data){
            let user = "";
            callConnectionData = callConnectionDate.data;
            if(callConnectionData.callMode === "onetoone"){
                user = callConnectionData.to;
                rosterData = getUserDetails(user);
            } else if(callConnectionData.callMode === "onetomany"){
                isGroupCall = true;
                if(callConnectionData.groupId !== "" &&  callConnectionData.groupId !== null && callConnectionData.groupId !== undefined){
                    user = callConnectionData.groupId.includes("@") ? callConnectionData.groupId.split('@')[0] : callConnectionData.groupId
                    rosterData = {...this.getGroupDetails(user)};
                    rosterData.chatType = "groupchat";
                } else {
                    let userList = callConnectionData.userList.split(",");
                    rosterData = getCallDisplayDetailsForOnetoManyCall(userList);
                }
            }
        }

        let chatType = rosterData.chatType;
        let callType = "";
        if(callConnectionDate && callConnectionDate.data){
            if(callConnectionDate.data.callType === "audio" || callConnectionDate.data.callType === "Audio"){
                callType = "Audio";
            } else if(callConnectionDate.data.callType === "video" || callConnectionDate.data.callType === "Video"){
                callType = "Video";
            }
        }
        const callStatus = this.handleTernayAvoid(isGroupCall,callType);
        const iniTail = initialNameHandle(rosterData, rosterData.initialName);

        return(
            <div className="calling-Popup webcall-calling">
            <div  className="optionButton visible">
                        <div>
                            <span title="Back to chat" className="BackToChat" onClick={this.handleHideCallScreen}>
                                <i className="backIcon">
                                    <span className="toggleAnimation"></span>
                                    <BackToChat/></i>
                            </span>
                        </div>
                    </div>
                 {this.checkOneToManyCall() &&
                 <div className="callDetails">
                    <div style={{visibility:"hidden"}} className="logosm">
                        <img src={Logo} alt="Logo"/>
                    </div>
                    <CallerProfileList rosterData={rosterData} />
                    <div className="calleeDetails">
                        <span className="callerName">
                            {rosterData.displayName}
                        </span>
                        <span className="callingStatus">
                            <span>
                            <span> {callStatus} </span>
                            {this.props.callStatus && this.props.callStatus.toLowerCase() !== CALL_STATUS_DISCONNECTED &&
                            <div className="callingAnimation incoming">
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
                {!this.checkOneToManyCall() && <div className="avatar" id="dominantSpeakerAvatar">
                    <div className="calling-animation-wrapper">
                        <WebChatProfileImg
                        name={iniTail}
                        chatType={chatType}
                        rostersnap={rosterData.thumbImage !== "" ? rosterData.thumbImage : rosterData.image}
                        />
                        <div className="ripple-1"></div>
                        <div className="ripple-2"></div>
                        <div className="ripple-3"></div>
                    </div>
                        <div className="calleeDetails">
                            <div className="calle-info">
                            <span className="callerName">
                                    {rosterData.displayName}
                                </span>
                                {callConnectionDate.data.callMode === "onetomany" && callConnectionDate.data.groupId &&
                                    <span className="memmber-details" onClick={this.toggleMemberNames} >
                                        ({callConnectionData && callConnectionData.userList && callConnectionData.userList.split(",").length > 0 ? callConnectionData.userList.split(",").length - 1 : 0} {callConnectionData.userList.split(",").length - 1 > 1 ? "members" : "member"})
                                    </span>
                                }
                            </div>
                            <span className="callingStatus">
                                <span>
                                    <span> {callStatus} </span>
                                    {this.props.callStatus && this.props.callStatus.toLowerCase() !== CALL_STATUS_DISCONNECTED &&
                                        <div className="callingAnimation incoming">
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
                <div className="button-group-center">
                    <span className="attenCall" onClick={this.attendCall}><i ><AttenCall/></i></span>
                    <span className="rejectCall" onClick={this.declineCall}><i ><RejectCall/></i></span>
                </div>
            </div>
        )
    }
}
const mapStateToProps = state => {
    return {
        callConnectionDate: state.callConnectionDate,
        popUpData: state.popUpData,
        rosterData: state.rosterData,
        adminBlockData: state.adminBlockData
    }
}

const mapDispatchToProps = {
    callParticiapants: showModal
}

export default connect(mapStateToProps, mapDispatchToProps)(CalleScreen);
