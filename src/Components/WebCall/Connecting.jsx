import React, { Component } from 'react';
import SDK from '../SDK';
import { connect } from 'react-redux';
import callLogs from './CallLogs/callLog';
import NetworkError from './NetworkError/NetworkError'
import { ReactComponent as BackToChat } from '../../assets/images/webcall/backToChat.svg';
import CallControlButtons from './CallControlButtons';
import { CALL_SESSION_STATUS_CLOSED } from '../../Helpers/Call/Constant';
import  Logo from '../../assets/images/new-images/logoNew.png';
import  { dispatchCommon, localstoreCommon, resetCallData } from '../../Components/callbacks';
import { getGroupData } from '../../Helpers/Chat/Group';
import { getUserDetails,initialNameHandle } from '../../Helpers/Chat/User';
import ProfileImage from '../WebChat/Common/ProfileImage';
import { getFromLocalStorageAndDecrypt} from '../WebChat/WebChatEncryptDecrypt';

let timer;

class Connecting extends Component{
    constructor(props){
        super(props)
        this.state = {
            loading:true,
            callstate:'',
            vCardData:'',
            callType:false,
            connectingIssue: false
        }
    }

    componentDidMount(){
        this.startTimer();
    }

    startTimer(){
        timer = setTimeout(() => {
            this.setState({connectingIssue: true, loading: false});
        }, 30000);
    }

    componentWillUnmount() {
        clearTimeout(timer);
    }

    endCall = async () => {
        const callConnectionData = this.props?.callConnectionDate?.data;
        SDK.endCall();
        resetCallData();
        callLogs.update(callConnectionData.roomId, {
            "endTime": callLogs.initTime(),
            "sessionStatus": CALL_SESSION_STATUS_CLOSED
        });
        localstoreCommon();
        dispatchCommon();
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
    render(){
        const  callConnectionData = JSON.parse(getFromLocalStorageAndDecrypt('call_connection_status'))
        const containerStyle = {
            width: '100%',
            height: '100%',
        };

        let rosterData = {};
        
        if(callConnectionData){
            let user = "";
            if(callConnectionData.callMode === "onetoone"){
                user = callConnectionData.to;
                rosterData = getUserDetails(user);
            } else if(callConnectionData.callMode === "onetomany"){
                if(callConnectionData.groupId !== "" && callConnectionData.groupId !== null && callConnectionData.groupId !== undefined){
                    user = callConnectionData.groupId.includes("@") ? callConnectionData.groupId.split('@')[0] : callConnectionData.groupId                
                    rosterData = this.getGroupDetails(user);
                } else {
                    user = callConnectionData.from;
                    rosterData = getUserDetails(user);
                }
            }            
        }
        let chatType = rosterData.chatType;        
        let toUser = "";
        if(callConnectionData.from && callConnectionData.to){
            if(callConnectionData.to){
                toUser = callConnectionData.to.includes('@') ? callConnectionData.to.split('@')[0] : callConnectionData.to
            } else {
                toUser = callConnectionData.from.includes('@') ? callConnectionData.from.split('@')[0] : callConnectionData.from
            }
        }
        let initialName = initialNameHandle(rosterData, rosterData.initialName);
        
        return (
                <div  className="calling-Popup webcall-calling" style={containerStyle}>
                   <div className="optionButton visible">
                        <span title="Back to chat" className="BackToChat" onClick={this.handleHideCallScreen}>
                            <i className="backIcon"><span className="toggleAnimation"></span><BackToChat/></i>
                        </span>
                    </div>
                
                    <div className="callDetails">
                        <div className="logosm" style={{ display: "none" }}><img src={Logo} alt="Logo"/></div>
                        <span className="callingStatus Connecting"><span>{"Connecting "}
                            <div className="callingAnimation connect"><span className="dot"></span><span className="dot"></span><span className="dot"></span></div></span>
                        </span>
                            <span className="callerName">{rosterData.displayName ? rosterData.displayName: toUser }</span>
                    </div>
                    <div className="avatar" id="dominantSpeakerAvatar">
                        <ProfileImage
                            name = {initialName}
                            chatType={chatType}
                            temporary={false}
                            imageToken={(rosterData.thumbImage && rosterData.thumbImage !== "") ? rosterData.thumbImage : rosterData.image}
                        />
                    </div>      
                        <CallControlButtons 
                            handleEndCall={this.endCall} 
                            handleAudioMute={this.handleAudioMute}
                            handleVideoMute={this.handleVideoMute}
                            videoMute={false} 
                            audioMute={false}
                            audioControl={false}
                            videoControl={false}
                        />
                    {this.state.connectingIssue  && getFromLocalStorageAndDecrypt("connecting") === 'true'  && 
                        <NetworkError />
                    }                
                </div>
                );
        }
}

const mapStateToProps = state => {
    return {
        callConnectionDate: state.callConnectionDate,
        showConfrenceData: state.showConfrenceData,
    }
}

export default connect(mapStateToProps, null)(Connecting);


