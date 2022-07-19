import React, { Fragment } from 'react';
import InfiniteScroll from "react-infinite-scroll-component";
import SDK from '../../SDK';
import { connect } from 'react-redux';
import { getFromLocalStorageAndDecrypt, encryptAndStoreInLocalStorage, deleteItemFromLocalStorage} from '../../WebChat/WebChatEncryptDecrypt';
import Search from './Search';
import "../../../assets/scss/minEmoji.scss";
import loaderSVG from '../../../assets/images/loader.svg';
import { PERMISSION_DENIED, REACT_APP_XMPP_SOCKET_HOST } from '../../processENV';
import { displayNameFromRencentChat, handleParticipantList } from '../../../Helpers/Chat/ChatHelper'
import { getFormatPhoneNumber, getPhoneNumberFromJid, getUserIdFromJid } from '../../../Helpers/Utility';
import { toast } from 'react-toastify';
import Store from '../../../Store';
import { hideModal, showModal } from '../../../Actions/PopUp'
import callLogs from './callLog';
import { CallConnectionState, showConfrence } from '../../../Actions/CallAction';
import CallLogView from './CallLogView';
import { NO_INTERNET } from '../../../Helpers/Constants';
import { formatUserIdToJid, getDataFromRoster, getLocalUserDetails, getUserDetails, initialNameHandle } from '../../../Helpers/Chat/User';
import { getGroupData } from '../../../Helpers/Chat/Group';
import { muteLocalVideo } from "../../callbacks";
import { COMMON_ERROR_MESSAGE } from '../../../Helpers/Call/Constant';
import FloatingCallOption from './FloatingCallOption/FloatingCallOption';
import { FloatingCallActionSm, ArrowBack, EmptyCallLog } from '../../../assets/images';
import NewParticipants from '../../WebChat/NewGroup/NewParticipants';
import { CHAT_TYPE_GROUP, NEW_CALL_CONTACT_PERMISSION_DENIED } from '../../../Helpers/Chat/Constant';
import { startCallingTimer } from '../../../Helpers/Call/Call';

class WebChatCallLogs extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loaderStatus: !!props.callLogData.isFetchingCallLog,
            searchterm: "",
            callLogs: [],
            newCall: false,
            newCallType: "video",
            currentGroupID: "",
        }
        this.handleOnBack = this.handleOnBack.bind(this);
        this.preventMultipleClick = false;
    }

    getCallLogs = (props) => {
        props = props || this.props;

        const { callLogs: callLogsObj, isFetchingCallLog } = props.callLogData;
        if (isFetchingCallLog) {
            return [];
        }
        return Object.values(callLogsObj);
    }

    setCallLogs = (preProps) => {
        const { callLogData: prevPropsCallLogData } = preProps;
        const { callLogData } = this.props;
        if (callLogData.callLogUpdated !== prevPropsCallLogData.callLogUpdated || callLogData.isFetchingCallLog !== prevPropsCallLogData.isFetchingCallLog) {
            this.setCallLogElement();
        }
    }

    setCallLogElement = () => {
        const { callLogData } = this.props;
        if (callLogData.isFetchingCallLog) {
            this.setState({ loaderStatus: callLogData.isFetchingCallLog });
            return;
        }
        let callLogsArr = this.getCallLogs();
        callLogsArr = callLogsArr.sort(function (a, b) {
            return a.callTime - b.callTime
        })
        callLogsArr.reverse();
        this.setState({ callLogs: callLogsArr, loaderStatus: false });
    }

    // /**
    //  * componentDidMount() is one of the react lifecycle method. <br />
    //  * In this method, get the call logs data from localstorage and set the data into state.
    //  */
    componentDidMount() {
        this.setCallLogElement();
    }

    componentDidUpdate(prevProps) {
        this.setCallLogs(prevProps);
        if (prevProps.groupsData.id !== this.props.groupsData.id) {
            const { data } = this.props.groupsData
            let currentGroupData = data.find(item => item?.groupId === this.state.currentGroupID)
                if(currentGroupData?.isAdminBlocked){
                    this.closePopup()
                }
        }
    }


    /**
     * handleOnBack() method to manage the back to recent chat icon click status.
     */
    handleOnBack() {
        this.props.handleBackStatus(true);
    }

    /**
     * handleCallLogs() method is perform to render the call logs ui.
     */
    handleCallLogs = (callLogsNew) => {
        let callLogsArray = callLogsNew || this.state.callLogs;
        let dataArr = [];
        if (callLogsArray.length > 0) {
            let searchterm = this.state.searchterm;
            let vcardData = getLocalUserDetails();
            let currentUser = vcardData && vcardData.fromUser;
            const roomId = getFromLocalStorageAndDecrypt('roomName');
            callLogsArray.map((callLog, index) => {
                let displayName = "";
                let isAdminBlocked = "0";
                let initialName = "";
                let deletedUser = [];
                let image = "",
                    emailId = "";
                // Prevent the current call calllog display.
                if (roomId === callLog.roomId) return;
                if (callLog) {
                    let userListArr = (callLog.userList && callLog.userList.split(',')) || [];
                    const userListLength = userListArr.length;
                    userListArr = this.getUserListWithFromUser(callLog);
                    userListArr.map((user) => {
                        const phoneNumber = getUserIdFromJid(user);
                        let roster = getUserDetails(phoneNumber);
                        if (phoneNumber !== currentUser && currentUser) {
                            if (roster) {
                                let name = displayNameFromRencentChat(roster) || getFormatPhoneNumber(phoneNumber);
                                displayName = displayName ? `${displayName}, ${name}` : name;
                                initialName = initialNameHandle(roster, displayName);
                                isAdminBlocked = roster.isAdminBlocked;
                                deletedUser.push(roster.isDeletedUser ? true : false);
                                image = userListLength > 1 ? null : roster.image;
                                emailId = roster.emailId
                            } else {
                                displayName = getFormatPhoneNumber(getUserIdFromJid(user));
                                image = "";
                            }
                        } else {
                            deletedUser.push(true);
                        }
                    });
                }
                let isDeletedUser = !deletedUser.includes(false);
                if (callLog && callLog.callMode === "onetomany" && callLog.groupId) {
                    const groupId = callLog.groupId.split('@mix')[0];
                    const group = getGroupData(groupId);
                    if (group) {
                        displayName = group.groupName;
                        image = group.groupImage;
                        isAdminBlocked = group.isAdminBlocked
                    }
                }

                if (displayName !== "") {
                    if (displayName.toLowerCase().includes(searchterm)) {
                        dataArr.push(
                            <CallLogView
                                key={`${callLog.roomId}-${index}`}
                                displayName={displayName}
                                image={image}
                                searchterm={searchterm}
                                callLog={callLog}
                                makeCall={this.prepareForCall}
                                emailId={emailId}
                                initialName={initialName}
                                isAdminBlocked={isAdminBlocked}
                                isDeletedUser={isDeletedUser}
                            />
                        )
                    }
                }
            });
        }
        return dataArr;
    }

    /**
     * handleFilterCallLogsList() method is to handle the searched call log from list
     *
     * @param {string} searchterm
     */
    handleFilterCallLogsList = (searchterm) => {
        this.setState({ searchterm: searchterm.trim().toLowerCase() }, () => {
            this.setCallLogElement();
        });
    }

    closePopup = () => {
        Store.dispatch(hideModal());
    }

    makeCall = async (callMode, callType, groupCallMemberDetails, groupId = null) => {
        let connectionStatus = getFromLocalStorageAndDecrypt("connection_status")
        if (connectionStatus === "CONNECTED") {
            let users = [], roomId = "", call = null, image = "";
            const vcardData = getLocalUserDetails();
            let fromuser = formatUserIdToJid(vcardData.fromUser);

            if (callMode === "onetoone") {
                users = groupCallMemberDetails;
            } else if (callMode === "onetomany") {
                if (groupCallMemberDetails.length > 0) {
                    groupCallMemberDetails.forEach(function (member) {
                        if (member !== fromuser) {
                            if (typeof member === "object")
                                users.push(member.userJid);
                            else
                                users.push(member);
                        }
                    });
                } else {
                    users = [""];
                }
            }


            let callConnectionStatus = {
                callMode: callMode,
                callStatus: "CALLING",
                callType: callType,
                from: fromuser,
                userList: users.join(","),
            }
            if (callMode === "onetoone") {
                callConnectionStatus.to = users.join(",");
                callConnectionStatus.userAvatar = image;
            } else if (callMode === "onetomany") {
                callConnectionStatus.to = groupId;
                callConnectionStatus.groupId = groupId;
            }

            encryptAndStoreInLocalStorage('call_connection_status', JSON.stringify(callConnectionStatus))
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
            }))
            try {
                if (callType === "audio") {
                    muteLocalVideo(true);
                    call = await SDK.makeVoiceCall(users, groupId);
                } else if (callType === "video") {
                    muteLocalVideo(false);
                    call = await SDK.makeVideoCall(users, groupId);
                }
                if (call.statusCode !== 200 && call.message === PERMISSION_DENIED) {
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
                    }))
                } else {
                    roomId = call.roomId;
                    callLogs.insert({
                        "callMode": callConnectionStatus.callMode,
                        "callState": 1,
                        "callTime": callLogs.initTime(),
                        "callType": callConnectionStatus.callType,
                        "fromUser": callConnectionStatus.from,
                        "roomId": roomId,
                        "userList": callConnectionStatus.userList,
                        ...(callMode === "onetomany" && {
                            "groupId": groupId
                        })
                    });
                    encryptAndStoreInLocalStorage('roomName', roomId)
                    let callConnectionStatusNew = {
                        ...callConnectionStatus,
                        roomId: roomId
                    }
                    encryptAndStoreInLocalStorage('call_connection_status', JSON.stringify(callConnectionStatusNew))
                    Store.dispatch(CallConnectionState(callConnectionStatusNew));
                    startCallingTimer();
                }
            } catch (error) {
                console.log("Error in making call", error);
                if (error.message === PERMISSION_DENIED) {
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
                    }))
                }
            }
            this.preventMultipleClick = false;
        } else {
            toast.error(NO_INTERNET)
            this.preventMultipleClick = false;
        }
    }

    prepareForCall = async (callLog) => {
        const roomName = getFromLocalStorageAndDecrypt('roomName');
        if (roomName) {
            toast.info("Can't place a new call while you're already in a call.");
            return;
        }
        
        if (this.preventMultipleClick) {
            return;
        }
        this.setState({
            currentGroupID : callLog?.groupId.split("@")[0]
        })
        this.preventMultipleClick = true;
        let connectionStatus = getFromLocalStorageAndDecrypt("connection_status")
        if (connectionStatus === "CONNECTED") {
            const callType = callLog.callType;
            const callMode = callLog.callMode;
            const callUserListArr = this.getUserListWithFromUser(callLog);
            const callUserNumberArr = callUserListArr.map((user) => user.split('@')[0]);
            const groupMembers = [];
            let groupMemberDetails = [];
            let displayName = null;
            let vcardData = getLocalUserDetails();
            let currentUser = vcardData.fromUser;
            let groupId = '';

            if (callMode === 'onetoone' || callLog.groupId === "" || callLog.groupId === null) {
                callUserNumberArr.map((user) => {
                    const phoneNumber = user.split('@')[0];
                    const userDetails = getUserDetails(phoneNumber);
                    if (phoneNumber !== currentUser && userDetails && !userDetails.isDeletedUser) {
                        groupMembers.push(phoneNumber + "@" + REACT_APP_XMPP_SOCKET_HOST);
                        groupMemberDetails.push({ ...userDetails });
                    }
                })
            }
            else {
                groupId = callLog.groupId;
                const { groupsMemberParticipantsListData: { groupParticipants = {} } = {} } = this.props || {}
                let participants = groupParticipants[groupId];
                groupMemberDetails = this.getGroupMembers(participants)
                groupMemberDetails = this.sortUsersDisplayName(groupMemberDetails);
                const group = getGroupData(groupId);
                displayName = (group && group.groupName) || displayName;

                groupMemberDetails.map(participant => {
                    const { userJid, username, GroupUser } = participant
                    let user = userJid || username || GroupUser;
                    user = user.split('@')[0];
                    let userDetails = getDataFromRoster(user);
                    if (user !== currentUser && callUserNumberArr.indexOf(user) > -1 && !userDetails.isDeletedUser) {
                        groupMembers.push(user + "@" + REACT_APP_XMPP_SOCKET_HOST);
                    }
                });
            }

            if (groupMembers.length === 0) {
                toast.error(COMMON_ERROR_MESSAGE);
                this.preventMultipleClick = false;
                return false
            } else if (callMode === 'onetoone') {
                this.makeCall(callMode, callType, groupMembers, groupId);
            }else {
                    this.props.callParticiapants({
                        open: true,
                        modelType: 'calllogparticipants',
                        groupName: displayName,
                        groupMembers: groupMembers,
                        groupuniqueId: groupId,
                        groupMemberDetails: groupMemberDetails,
                        makeGroupCall: callMode === 'onetoone' ? this.makeOne2OneCall : this.makeGroupCall,
                        callType: callType,
                        closePopup: this.closePopup
                    });
            }
            this.preventMultipleClick = false;
        } else {
            toast.error(NO_INTERNET)
            this.preventMultipleClick = false;
        }
        return true;
    }

    makeOne2OneCall = async (callType, users) => {
        this.makeCall("onetoone", callType, users);
    }

    showCallParticipants = async (groupId, callType) => {
        const groupid = groupId + '@mix.' + REACT_APP_XMPP_SOCKET_HOST;
        let connectionStatus = getFromLocalStorageAndDecrypt("connection_status")
        if (connectionStatus === "CONNECTED") {
            const { groupsMemberParticipantsListData: { groupParticipants = {} } = {} } = this.props || {}
            let participants = groupParticipants[groupid];
            let groupMemberDetails = this.getGroupMembers(participants)
            groupMemberDetails = this.sortUsersDisplayName(groupMemberDetails);
            let groupMembers = [];
            let group = getGroupData(groupId);
            let rosterData = {
                displayName: group.groupName,
                image: group.groupImage,
                jid: groupId,
            }
            groupMemberDetails.map(participant => {
                const { userJid, username, GroupUser } = participant
                let user = userJid || username || GroupUser
                let currentUser = this.props?.vCardData?.data?.fromuser;
                if (user !== currentUser) {
                    groupMembers.push(user)
                }
            });

            if (groupMembers.length === 0) {
                toast.error("You are only one member in the group")
                this.preventMultipleClick = false;
                return false
            } else if (groupMembers.length === 1) {
                this.makeGroupCall(callType, groupMembers);
            } 
            else {
                this.props.callParticiapants({
                    open: true,
                    modelType: 'callparticipants',
                    groupName: rosterData.displayName,
                    groupMembers: groupMembers,
                    groupuniqueId: formatUserIdToJid(groupId, CHAT_TYPE_GROUP),
                    groupMemberDetails: groupMemberDetails,
                    makeGroupCall: this.makeGroupCall,
                    callType: callType
                });
            }
            this.preventMultipleClick = false;
        } else {
            toast.error(NO_INTERNET)
            this.preventMultipleClick = false;
        }
    }

    sortUsersDisplayName = (groupMemberDetails) => {
        return groupMemberDetails.map(member => {
            const { displayName, name, username, jid, GroupUser } = member
            const nameToDisplay = displayName || name || jid || username || getFormatPhoneNumber(GroupUser)
            member.displayName = nameToDisplay
            return member
        }).sort((b, c) => isNaN(parseInt(c.displayName)) - isNaN(parseInt(b.displayName)) || String(b.displayName).localeCompare(String(c.displayName)))
    }

    makeGroupCall = async (callType, groupCallMemberDetails, groupId) => {
        this.makeCall("onetomany", callType, groupCallMemberDetails, groupId);
    }

    getGroupMembers = (participants) => {
        const { rosterData: { data: totalContactList = [] } = {} } = this.props
        return participants && handleParticipantList(participants, totalContactList) || []
    }

    getUserListWithFromUser = (callLog) => {
        let userListArr = (callLog.userList && callLog.userList.split(',')) || [];
        userListArr.unshift(callLog.fromUser);
        const filteredUserArr = [];
        // Filter the duplicate phone number
        userListArr.map((userJid) => {
            if (!userJid) return;
            const phoneNumber = getPhoneNumberFromJid(userJid);
            const isUserExist = filteredUserArr.find((uJid) => getPhoneNumberFromJid(uJid) === phoneNumber);
            if (!isUserExist) filteredUserArr.push(userJid);
        });
        return filteredUserArr;
    }
    handleAudioCall = () => {
        if (this.props.contactPermission === 0) {
            this.props.handleContactPermissionPopup(true, NEW_CALL_CONTACT_PERMISSION_DENIED);
            return;
        }
        this.setState({
            newCall: true,
            newCallType: "audio"
        });
    }

    handleVideoCall = () => {
        if (this.props.contactPermission === 0) {
            this.props.handleContactPermissionPopup(true, NEW_CALL_CONTACT_PERMISSION_DENIED);
            return;
        }
        this.setState({
            newCall: true,
            newCallType: "video"
        });
    }
    
    handleBackCallLog = () => {
        this.setState({
            newCall: false
        })
    }

    makeNewcall = (callType, userList) => {
        let callMode = "onetoone";
        let users = [];
        if (userList.length > 1) {
            callMode = "onetomany";
            users = userList;
        } else {
            userList.map(participant => {
                const { userJid, username, GroupUser } = participant
                let user = userJid || username || GroupUser;
                user = user.split('@')[0];
                let userDetails = getDataFromRoster(user);
                if (!userDetails.isDeletedUser) {
                    users.push(user + "@" + REACT_APP_XMPP_SOCKET_HOST);
                }
            });
        }
        if (users.length > 0) {
            this.makeCall(callMode, callType, users, "");
        }
    }

    fetchMoreData = () => {
        let callLogsArr = this.state.callLogs;
        callLogs.getCallLogsFromServer(Math.ceil((callLogsArr.length / 20) + 1));
    }

    render() {
        const loaderStyle = {
            width: 80, height: 80
        }
        const { searchterm, newCall } = this.state;
        const callLogArr = this.handleCallLogs();
        return (
            <Fragment>
                {!newCall ?
                    <Fragment>
                        <div className="contactlist call-logs">
                            <div className="recent-chatlist-header">
                                <div className="profile-img-name">
                                    <i className="newchat-icon" onClick={this.handleOnBack} title="Back">
                                        <ArrowBack />
                                    </i>
                                    <span>{"Call Logs"}</span>
                                </div>
                            </div>
                            {((callLogArr.length > 0 && !searchterm) ||
                                searchterm) &&
                                <Search searchIn={this.state.searchIn} handleSearchFilterList={this.handleFilterCallLogsList} />
                            }
                            {this.state.loaderStatus && <div className="loader-container">
                                <img src={loaderSVG} alt="loader" style={loaderStyle} />
                            </div>}

                            {callLogArr.length > 0 &&
                                <ul className="chat-list-ul" id="scrollableUl-callLog">
                                    <InfiniteScroll
                                        dataLength={callLogArr.length}
                                        next={this.fetchMoreData}
                                        hasMore={true}
                                        scrollableTarget="scrollableUl-callLog"
                                    >
                                        {this.handleCallLogs()}
                                    </InfiniteScroll>
                                </ul>
                            }

                            {callLogArr.length === 0 && searchterm === "" ?
                                <div className="norecent-chat">
                                    <i className="norecent-chat-img">
                                        <EmptyCallLog />
                                    </i>
                                    <h4>{"Oh snap It seems like they’re no call history!"}</h4>

                                    <h3>Click on <i className="callAction"><FloatingCallActionSm /></i> or Search to start a Call!</h3>
                                </div>
                                :
                                <>
                                    {callLogArr.length === 0 &&
                                        <div className="norecent-chat">
                                            <i className="norecent-chat-img">
                                                <EmptyCallLog />
                                            </i>
                                            <h4>{"No call log history found"}</h4>
                                            <h3>{"Any new calls will appear here"}</h3>
                                        </div>
                                    }
                                </>
                            }

                        </div>
                        <FloatingCallOption
                            handleAudioCall={this.handleAudioCall}
                            handleVideoCall={this.handleVideoCall}
                        />
                    </Fragment>
                    :
                    <NewParticipants
                        newCallType={this.state.newCallType}
                        newCall={true}
                        handleBackToCallLog={this.handleBackCallLog}
                        handleMakeNewCall={this.makeNewcall}

                    />
                }
            </Fragment>
        );
    }
}

const mapStateToProps = (state, props) => {

    return ({
        callLogData: state.callLogData,
        vCardData: state.vCardData.data,
        VCardContactData: state.VCardContactData,
        messageData: state.messageData,
        rosterData: state.rosterData,
        showConfrenceData: state.showConfrenceData, // Line - added to update the call log UI to display the last ended call when user on call log page. 
        groupsMemberParticipantsListData: state.groupsMemberParticipantsListData,
        contactPermission: state?.contactPermission?.data,
        groupsData: state.groupsData
    });
};

const mapDispatchToProps = {
    callParticiapants: showModal
}

export default connect(mapStateToProps, mapDispatchToProps)(WebChatCallLogs);
