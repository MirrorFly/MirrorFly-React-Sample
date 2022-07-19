import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';
import { CallConnectionState, showConfrence } from '../../../Actions/CallAction';
import { ArrowBack, AudioCall, SampleGroupProfile, SampleChatProfile, VideoCall } from '../../../assets/images';
import Store from '../../../Store';
import { REACT_APP_XMPP_SOCKET_HOST } from '../../processENV';
import { hideModal, showModal } from '../../../Actions/PopUp'
import { getFromLocalStorageAndDecrypt, encryptAndStoreInLocalStorage, deleteItemFromLocalStorage} from '../WebChatEncryptDecrypt';
import callLogs from '../../WebCall/CallLogs/callLog';
import { toast } from 'react-toastify';
import SDK from '../../SDK';
import ProfileImage from '../Common/ProfileImage';
import TypingStatus from '../Common/TypingStatus';
import WebChatContactInfo from '../ContactInfo/WebChatContactInfo';
import { resetPinAndLargeVideoUser, startCallingTimer } from '../../../Helpers/Call/Call';
import { CONNECTED, NO_INTERNET } from '../../../Helpers/Constants';
import { formatUserIdToJid, getContactNameFromRoster, getIdFromJid, initialNameHandle } from '../../../Helpers/Chat/User';
import { muteLocalVideo } from "../../callbacks";
import { isGroupChat, isSingleChat } from '../../../Helpers/Chat/ChatHelper';

let groupId = "";
let groupName = "";

class ConversationHeader extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            viewContactStatus: false,
            blocked: false,
            image: null,
            displayName: null,
            userstatus: null,
            emailId: null,
            localRoster: {},
            isAdminBlocked: false,
            isDeletedUser: false
        }
        this.preventMultipleClick = false;
        this.premissionConst = "Permission denied";
    }

    filterProfileFromRoster = (messageFrom) => {
        const { rosterData: { rosterNames } } = this.props
        if (!rosterNames) return {};
        if (rosterNames.has(messageFrom)) {
            return rosterNames.get(messageFrom)
        }
        return {};
    }

    filterProfileFromGroup = (messageFrom) => {
        const { groupsData: { data: groupsDataArray = [] } = {} } = this.props;
        return groupsDataArray.find((group) => messageFrom.indexOf(group.groupId) > -1);
    }

    setUserDetails = () => {
        const { userData: { data: { roster } } } = this.props
        const { image, groupImage } = roster
        const displayName = getContactNameFromRoster(roster)
        const isAdminBlocked = roster.isAdminBlocked
        this.setState({
            displayName,
            image: image || groupImage,
            userstatus: roster.status,
            emailId: roster.emailId,
            localRoster: roster,
            isAdminBlocked:isAdminBlocked,
            isDeletedUser: roster.isDeletedUser
        })
    }

    componentDidMount() {
        this.setUserDetails();
    }

    async componentDidUpdate(prevProps) {
        const { activeChatId } = this.props
        const { activeChatData: { data: { chatType, chatId } = {} } } = this.props
        const { groupsData: { id: groupnewId } = {} } = this.props;
        const { rosterData: { data } } = this.props


        if (prevProps?.groupsData?.id !== groupnewId && isGroupChat(chatType)) {
            const updateGroupInfo = this.filterProfileFromGroup(chatId)

            if (updateGroupInfo) {
                const { groupImage } = updateGroupInfo
                this.setState({
                    displayName: getContactNameFromRoster(updateGroupInfo),
                    image: groupImage,
                    userstatus: null
                })
            }
            return true;
        }
        if (prevProps?.rosterData?.id !== this.props?.rosterData?.id && isSingleChat(chatType)) {
            const rosterInfo = this.filterProfileFromRoster(this.props.activeChatId)
            let adminStatus = data.find(element => element?.userId === activeChatId)?.isAdminBlocked

            if (rosterInfo) {
                const { image, isDeletedUser } = rosterInfo
                this.setState({
                    displayName: getContactNameFromRoster(rosterInfo),
                    image,
                    userstatus: rosterInfo.status,
                    emailId: rosterInfo.emailId,
                    localRoster: rosterInfo,
                    isAdminBlocked: adminStatus,
                    isDeletedUser: isDeletedUser
                })
            }
            return true;
        }

        if (prevProps.activeChatId !== activeChatId) {
            this.setUserDetails();
            return true;
        }
        return false;
    }

    deleteAndDispatchAction = () => {
        deleteItemFromLocalStorage('roomName')
        deleteItemFromLocalStorage('callType')
        deleteItemFromLocalStorage('call_connection_status')
        encryptAndStoreInLocalStorage("hideCallScreen", false);
        encryptAndStoreInLocalStorage('callingComponent', false)
        encryptAndStoreInLocalStorage("hideCallScreen", false);
        Store.dispatch(showConfrence({
            showComponent: false,
            showCalleComponent: false,
            stopSound: true,
            callStatusText: null
        }));
    }

    makeOne2OneCall = async (callType) => {
        if (this.isRoomExist() || this.preventMultipleClick) {
            return;
        }
        if (this.state.isAdminBlocked || this.state.isDeletedUser) return;
        
        this.preventMultipleClick = true;
        let connectionStatus = getFromLocalStorageAndDecrypt("connection_status")
        if (connectionStatus === CONNECTED) {
            let fromuser = this.props?.vCardData?.data?.fromUser;
            let { activeChatId, userData: { data: { roster } } } = this.props
            let roomId = "";
            activeChatId = activeChatId + "@" + REACT_APP_XMPP_SOCKET_HOST
            let call = null;
            resetPinAndLargeVideoUser();
            let callMode = "onetoone";
            fromuser = fromuser + "@" + REACT_APP_XMPP_SOCKET_HOST;
            const { image } = roster
            let callConnectionStatus = {
                callMode: callMode,
                callStatus: "CALLING",
                callType: callType,
                to: activeChatId,
                from: fromuser,
                userList: activeChatId,
                userAvatar: image
            }
            console.log("make call callConnectionStatus", callConnectionStatus);
            encryptAndStoreInLocalStorage('call_connection_status', JSON.stringify(callConnectionStatus));
            encryptAndStoreInLocalStorage('callType', callType)
            encryptAndStoreInLocalStorage('callingComponent', true)
            encryptAndStoreInLocalStorage('callFrom', getFromLocalStorageAndDecrypt('loggedInUserJidWithResource'));
            Store.dispatch(CallConnectionState(callConnectionStatus));
            const showConfrenceData = Store.getState().showConfrenceData;
            const {
                data
            } = showConfrenceData;
            Store.dispatch(showConfrence({
                localStream: data?.localStream,
                localVideoMuted: data?.localVideoMuted,
                localAudioMuted: data?.localAudioMuted,
                showComponent: true,
                callStatusText: 'Calling'
            }));
            this.preventMultipleClick = false;
            try {
                if (callType === "audio") {
                    muteLocalVideo(true);
                    call = await SDK.makeVoiceCall([activeChatId], null);
                } else if (callType === "video") {
                    muteLocalVideo(false);
                    call = await SDK.makeVideoCall([activeChatId], null);
                }
                if (call.statusCode !== 200 && call.message === this.premissionConst) {
                    this.deleteAndDispatchAction();
                } else {
                    roomId = call.roomId;
                    encryptAndStoreInLocalStorage('roomName', roomId)
                    callLogs.insert({
                        "callMode": callConnectionStatus.callMode,
                        "callState": 1,
                        "callTime": callLogs.initTime(),
                        "callType": callConnectionStatus.callType,
                        "fromUser": callConnectionStatus.from,
                        "roomId": roomId,
                        "userList": callConnectionStatus.userList
                    });
                    let callConnectionStatusNew = { ...callConnectionStatus, roomId: roomId };
                    encryptAndStoreInLocalStorage('call_connection_status', JSON.stringify(callConnectionStatusNew));
                    Store.dispatch(CallConnectionState(callConnectionStatusNew));
                }
            } catch (error) {
                console.log("Error in making call", error);
                if (error.message !== this.premissionConst) {
                    this.deleteAndDispatchAction();
                }
            }
        } else {
            toast.error(NO_INTERNET)
            this.preventMultipleClick = false;
        }
    }

    closePopup = () => {
        Store.dispatch(hideModal());
    }

    showCallParticipants = (callType) => {
        if (this.isRoomExist()) {
            return;
        }
        if (this.state.isAdminBlocked) return;
        let connectionStatus = getFromLocalStorageAndDecrypt("connection_status")
        if (connectionStatus === CONNECTED) {
            const { groupMemberDetails = [], activeChatId } = this.props
            let groupMembers = [];
            groupMemberDetails.map(participant => {
                const { userJid, username, GroupUser } = participant
                let user = userJid || username || GroupUser
                let currentUser = this.props?.vCardData?.data?.fromUser;
                if (user !== currentUser) {
                    groupMembers.push(user)
                }
            })

            if (groupMembers.length === 0) {
                toast.error("You are only one member in the group")
                return false
            } else if (groupMembers.length === 1) {
                this.makeGroupCall(callType, groupMembers);
            } else {
                groupId = activeChatId + "@mix." + REACT_APP_XMPP_SOCKET_HOST;
                this.props.callParticiapants({
                    open: true,
                    modelType: 'callparticipants',
                    groupName: groupName,
                    groupMembers: groupMembers,
                    groupuniqueId: this.state.groupuniqueId,
                    groupMemberDetails: groupMemberDetails,
                    makeGroupCall: this.makeGroupCall,
                    callType: callType,
                    currentCallUsersLength: 0,
                    selectDefault: true,
                    closePopup: this.closePopup
                });
            }
        } else {
            toast.error(NO_INTERNET)
        }
    }

    makeGroupCall = async (callType, groupCallMemberDetails) => {
        let connectionStatus = getFromLocalStorageAndDecrypt("connection_status")
        if (connectionStatus === "CONNECTED") {
            let fromuser = this.props?.vCardData?.data?.fromUser;
            const { activeChatId } = this.props
            let users = [];
            let callMode = "onetomany";
            fromuser = fromuser + "@" + REACT_APP_XMPP_SOCKET_HOST;
            if (groupCallMemberDetails.length > 0) {
                groupCallMemberDetails.forEach(function (member) {
                    if (member !== fromuser) {
                        if (!member.includes("@")) {
                            users.push(member + "@" + REACT_APP_XMPP_SOCKET_HOST);
                        } else {
                            users.push(member);
                        }
                    }
                });
            } else {
                users = [activeChatId];
            }
            let roomId = "";
            let call = null;
            resetPinAndLargeVideoUser();
            let callConnectionStatus = {
                callMode: callMode,
                callStatus: "CALLING",
                to: groupId,
                callType: callType,
                from: fromuser,
                userList: users.join(','),
                groupId
            }
            encryptAndStoreInLocalStorage('call_connection_status', JSON.stringify(callConnectionStatus))
            encryptAndStoreInLocalStorage('callType', callType)
            encryptAndStoreInLocalStorage('callingComponent', true)
            encryptAndStoreInLocalStorage('callFrom', getFromLocalStorageAndDecrypt('loggedInUserJidWithResource'));
            const showConfrenceData = Store.getState().showConfrenceData;
            const {
                data
            } = showConfrenceData;
            Store.dispatch(showConfrence({
                localStream: data?.localStream,
                localVideoMuted: data?.localVideoMuted,
                localAudioMuted: data?.localAudioMuted,
                showComponent: true,
                callStatusText: 'Calling'
            }))
            Store.dispatch(CallConnectionState(callConnectionStatus));
            try {
                if (callType === "audio") {
                    muteLocalVideo(true);
                    call = await SDK.makeVoiceCall(users, groupId);
                } else if (callType === "video") {
                    muteLocalVideo(false);
                    call = await SDK.makeVideoCall(users, groupId);
                }
                if (call.statusCode !== 200 && call.message !== this.premissionConst) {
                    this.deleteAndDispatchAction();
                } else {
                    roomId = call.roomId;
                    encryptAndStoreInLocalStorage('roomName', roomId)
                    callLogs.insert({
                        "callMode": callConnectionStatus.callMode,
                        "callState": 1,
                        "callTime": callLogs.initTime(),
                        "callType": callConnectionStatus.callType,
                        "fromUser": callConnectionStatus.from,
                        "roomId": roomId,
                        "userList": callConnectionStatus.userList,
                        "groupId": callConnectionStatus.groupId
                    });
                    let callConnectionStatusNew = {
                        ...callConnectionStatus,
                        roomId: roomId
                    }
                    Store.dispatch(CallConnectionState(callConnectionStatusNew));
                    encryptAndStoreInLocalStorage('call_connection_status', JSON.stringify(callConnectionStatusNew))
                    startCallingTimer();
                }
            } catch (error) {
                console.log("Error in making call", error);
                if (error.message === this.premissionConst) {
                    this.deleteAndDispatchAction();
                }
            }

        } else {
            toast.error(NO_INTERNET)
        }
    }

    backToRecentChat = () => {
        this.props.handlePopUpClassActive(false)
    }

    handlePopUp = (forceClose = false) => {
        const { popUpData: { modalProps: { open } } } = this.props
        if (open && !forceClose) {
            return;
        }
        this.setState({
            viewContactStatus: !this.state.viewContactStatus
        })
    }

    canSendMessage = () => {
        const chatType = this.props?.userData?.data?.recent?.chatType;
        const fromUser = this.props?.vCardData?.data?.fromUser
        const { groupsMemberListData: { data: { participants } = {} } = {} } = this.props;
        if (chatType === 'chat' || !participants) return true;
        return participants.find((profile) =>
            fromUser === profile.userId
        );
    }

    isRoomExist() {
        let room = getFromLocalStorageAndDecrypt('roomName');
        if (room !== null) {
            return true;
        }
        return false;
    }

    render() {
        const { groupMemberDetails, activeChatId, displayNames,
            userData: { data: { chatId = "",recent: { chatType = "", fromUserId = "" } } = {} } = {} } = this.props || {};
        const token = getFromLocalStorageAndDecrypt('token');
        const avatarIcon = chatType === 'chat' ? SampleChatProfile : SampleGroupProfile;
        let canSendMessage = this.canSendMessage();
        const { mobileNumber } = this.state.localRoster
        const { image, displayName, emailId } = this.state
        const iniTail = initialNameHandle(this.state.localRoster, displayName);
        groupName = displayName;
        let blockedContactArr = this.props.blockedContact.data;
        const isBlocked = blockedContactArr.indexOf(formatUserIdToJid(activeChatId)) > -1;

        if (isBlocked) {
            canSendMessage = false;
        }

        return (
            <Fragment>
                <div className="conversation-header">
                    <div className="user-profile-name">
                        <i className="arrow-icon" onClick={this.backToRecentChat} >
                            <ArrowBack />
                        </i>
                        <div className="user-profile-name" onClick={this.handlePopUp}>
                            <ProfileImage
                                chatType={chatType || 'chat'}
                                userToken={token}
                                imageToken={this.state.isAdminBlocked ? "" : image}
                                emailId={emailId}
                                userId={getIdFromJid(activeChatId)}
                                name={iniTail}
                            />
                                <div className="profile-name">
                                    <h4>{displayName || fromUserId}</h4>
                                {!this.state.isAdminBlocked && !this.state.isDeletedUser &&
                                        <TypingStatus
                                            fromUserId={chatId}
                                            jid={activeChatId}
                                            contactNames={displayNames}
                                            chatType={chatType}
                                            />
                                }
                                </div>                            
                          
                        </div>
                    </div>
                    <div className="profile-options">
                        {canSendMessage && (chatType === "chat" || chatType === 'groupchat') && <>
                            <i title={this.props.showonGoingcallDuration ? 'You are already in call' : "Audio call"}
                                onClick={chatType === "chat" ? () => this.makeOne2OneCall('audio') : () => this.showCallParticipants('audio')}
                                className={`audioCall ${(this.props.showonGoingcallDuration || this.state.isAdminBlocked || this.state.isDeletedUser) ? 'calldisabled' : ''}`}>
                                <span className="toggleAnimation"></span>
                                <AudioCall />
                            </i>
                            <i title={this.props.showonGoingcallDuration ? 'You are already in call' : "Video call"}
                                onClick={chatType === "chat" ? () => this.makeOne2OneCall('video') : () => this.showCallParticipants('video')}
                                className={`videoCall ${(this.props.showonGoingcallDuration || this.state.isAdminBlocked || this.state.isDeletedUser) ? 'calldisabled' : ''}`}>
                                <span className="toggleAnimation"></span><VideoCall />
                            </i>
                        </>}
                    </div>
                </div>
                {this.state.viewContactStatus &&
                    <WebChatContactInfo
                        rosterName={displayName}
                        rosterImage={image}
                        activeChatId={activeChatId}
                        chatType={chatType}
                        userstatus={this.state.userstatus}
                        onInfoClose={this.handlePopUp}
                        avatarIcon={avatarIcon}
                        participants={groupMemberDetails}
                        handlePopUpClassActive={this.props.handlePopUpClassActive}
                        mobileNumber={mobileNumber}
                        roster={this.state.localRoster}
                        isAdminBlocked={this.state.isAdminBlocked}
                    />
                }
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        popUpData: state.popUpData,
        messageData: state.messageData,
        blockedContact: state.blockedContact,
        vCardData: state.vCardData,
        groupsMemberListData: state.groupsMemberListData,
        rosterData: state.rosterData,
        groupsData: state.groupsData,
        contactsWhoBlockedMe: state.contactsWhoBlockedMe,
        activeChatData: state.activeChatData
    }
}

const mapDispatchToProps = {
    callParticiapants: showModal
}

export default connect(mapStateToProps, mapDispatchToProps)(ConversationHeader);
