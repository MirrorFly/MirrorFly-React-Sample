import React, { Fragment } from 'react';
import InfiniteScroll from "react-infinite-scroll-component";
import SDK from '../../SDK';
import { connect } from 'react-redux';
import { getFromLocalStorageAndDecrypt, encryptAndStoreInLocalStorage, deleteItemFromLocalStorage} from '../../WebChat/WebChatEncryptDecrypt';
import Search from './Search';
import "../../../assets/scss/minEmoji.scss";
import loaderSVG from '../../../assets/images/loader.svg';
import { REACT_APP_CONTACT_SYNC, REACT_APP_XMPP_SOCKET_HOST } from '../../processENV';
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
import { muteLocalVideo, resetCallData, resetLocalCallDataClearAndDiscardUiTimer } from "../../callbacks";
import { COMMON_ERROR_MESSAGE, FEATURE_RESTRICTION_ERROR_MESSAGE } from '../../../Helpers/Call/Constant';
import FloatingCallOption from './FloatingCallOption/FloatingCallOption';
import { FloatingCallActionSm, ArrowBack, EmptyCallLog } from '../../../assets/images';
import NewParticipants from '../../WebChat/NewGroup/NewParticipants';
import { NEW_CALL_CONTACT_PERMISSION_DENIED } from '../../../Helpers/Chat/Constant';
import { startCallingTimer } from '../../../Helpers/Call/Call';
import userList from '../../WebChat/RecentChat/userList';
import CreateNewmeeting from '../../Layouts/CreateNewmeeting';

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
            isShow: true,
            meetLinkPopUp: false
        }
        this.handleOnBack = this.handleOnBack.bind(this);
        this.preventMultipleClick = false;
        this.premissionConst = "permission denied";
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

        // hide the search component if callLogs is empty
        if (Object.keys(prevProps.callLogData.callLogs).length !== Object.keys(this.props.callLogData.callLogs).length){
            if(Object.keys(this.props.callLogData.callLogs).length < 1){
                this.setState({isShow: false, searchterm: ""});
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
          const searchterm = this.state.searchterm;
          const currentUser = getLocalUserDetails()?.fromUser;
          const roomId = getFromLocalStorageAndDecrypt('roomName');
      
          callLogsArray.forEach((callLog, index) => {
            if (roomId === callLog.roomId) return;
            const {
              displayName,
              isAdminBlocked,
              initialName,
              image,
              emailId,
              isDeletedUser
            } = this.getCallLogDetails(callLog, currentUser);
      
            if (displayName !== "" && displayName.toLowerCase().includes(searchterm)) {
              dataArr.push(
                <CallLogView
                  key={`${callLog.roomId}-${displayName}-${searchterm}`}
                  displayName={displayName}
                  image={isAdminBlocked ? "" : image}
                  searchterm={searchterm}
                  callLog={callLog}
                  makeCall={this.prepareForCall}
                  emailId={emailId}
                  initialName={isAdminBlocked ? "" : initialName}
                  isAdminBlocked={isAdminBlocked}
                  isDeletedUser={isDeletedUser}
                />
              );
            }
          });
        }
      
        return dataArr;
    }
      
    getCallLogDetails = (callLog, currentUser) => {
        let displayName = "";
        let isAdminBlocked = "0";
        let initialName = "";
        let image = "";
        let emailId = "";
        let deletedUser = [];

        if (callLog) { 
            const userListArr = (callLog.userList && callLog.userList.split(',')) || [];
            const userListLength = userListArr.length;
            const userList = this.getUserListWithFromUser(callLog);
            userList.forEach((user) => {
                const phoneNumber = getUserIdFromJid(user);
                let roster = getUserDetails(phoneNumber);
                if (phoneNumber !== currentUser && currentUser) {
                    if (roster) {
                        let name = displayNameFromRencentChat(roster) || getFormatPhoneNumber(phoneNumber);
                        displayName = displayName ? `${displayName}, ${name}` : name;
                        initialName = initialNameHandle(roster, displayName);
                        let blockedContactArr = this.props.contactsWhoBlockedMe.data;
                        isAdminBlocked = blockedContactArr.indexOf(formatUserIdToJid(roster.userId)) > -1;
                        emailId = roster.emailId;
                        if (userListLength > 1) {
                            image = null;
                        } else {
                            image = (roster.thumbImage && roster.thumbImage !== "") ? roster.thumbImage : roster.image;
                        }
                        if (roster.isDeletedUser) deletedUser.push(true);
                        else deletedUser.push(false);
                    } else {
                        displayName = getFormatPhoneNumber(getUserIdFromJid(user));
                        image = "";
                        deletedUser.push(false);
                    }
                } 
            });
        }
        let isDeletedUser = !deletedUser.includes(false);
        if (callLog && callLog.callMode === "onetomany" && callLog.groupId) {
          const groupId = callLog.groupId.split('@mix')[0];
          const group = getGroupData(groupId);
          if (group) {
            displayName = group.groupName;
            image = (group.thumbImage && group.thumbImage !== "") ? group.thumbImage : group.groupImage;
            isAdminBlocked = group.isAdminBlocked;
          }
        }
      
        return {
          displayName,
          isAdminBlocked,
          initialName,
          image,
          emailId,
          isDeletedUser
        };
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

    handleMakeCallSuccessError = (callConnectionStatus, success, err) => {
        if (err) {
            if (!err.message.includes(this.premissionConst)) {
                toast.error(err.message);
            }
            setTimeout(() => {
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
                resetCallData();
            }, 1000);
        }
        if (success) {
            let roomId = success.roomId;
            callLogs.insert({
                "callMode": callConnectionStatus.callMode,
                "callState": 1,
                "callTime": callLogs.initTime(),
                "callType": callConnectionStatus.callType,
                "fromUser": callConnectionStatus.from,
                "roomId": roomId,
                "userList": callConnectionStatus.userList,
                ...(callConnectionStatus.callMode === "onetomany" && {
                    "groupId": callConnectionStatus.groupId
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
    }

    makeCall = async (callMode, callType, groupCallMemberDetails, groupId = null) => {
        let connectionStatus = getFromLocalStorageAndDecrypt("connection_status")
        if (connectionStatus === "CONNECTED") {
            let users = [], image = "";
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
            if (callType === "audio") {
                muteLocalVideo(true);
                resetLocalCallDataClearAndDiscardUiTimer();
                SDK.makeVoiceCall(users, groupId, (success, err) => {
                    this.handleMakeCallSuccessError(callConnectionStatus, success, err);
                });
            } else if (callType === "video") {
                muteLocalVideo(false);
                resetLocalCallDataClearAndDiscardUiTimer();
                SDK.makeVideoCall(users, groupId, (success, err) => {
                    this.handleMakeCallSuccessError(callConnectionStatus, success, err);
                });
            }
            this.preventMultipleClick = false;
        } else {
            toast.error(NO_INTERNET)
            this.preventMultipleClick = false;
        }
    }

    prepareForCall = async (callLog) => {
        const roomName = getFromLocalStorageAndDecrypt('roomName');
        const behaviourResponse = SDK.getCallBehaviour();
        if (roomName) {
            toast.info("Can't place a new call while you're already in a call.");
            return;
        }
        if(behaviourResponse.data == "meet"){
            return;
        }
        if(this.state.meetLinkPopUp){
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
                callUserNumberArr.forEach((user) => {
                    const phoneNumber = user.split('@')[0];
                    const userDetails = getUserDetails(phoneNumber);
                    if (phoneNumber !== currentUser && userDetails && !userDetails.isDeletedUser) {
                      groupMembers.push(phoneNumber + "@" + REACT_APP_XMPP_SOCKET_HOST);
                      groupMemberDetails.push({ ...userDetails });
                    }
                });
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

            const { featureStateData: {isOneToOneCallEnabled = false, isGroupCallEnabled = false } = {} } =this.props;

            if (groupMembers.length === 0) {
                toast.error(COMMON_ERROR_MESSAGE);
                this.preventMultipleClick = false;
                return false
            } else if (callMode === 'onetoone' && isOneToOneCallEnabled) {
                this.makeCall(callMode, callType, groupMembers, groupId);
            }else if( callMode === 'onetomany' && isGroupCallEnabled) {
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
            }else {
                if(toast.error.length > 1) {
                    toast.dismiss();
                    toast.error(FEATURE_RESTRICTION_ERROR_MESSAGE);
                } 
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
        if (!REACT_APP_CONTACT_SYNC) {
            this.setState({
                userList: userList.getUsersListFromSDK()
            });
        }
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
        if (!REACT_APP_CONTACT_SYNC) {
            this.setState({
                userList: userList.getUsersListFromSDK()
            });
        }
    }
    
    handleBackCallLog = () => {
        this.setState({
            newCall: false
        })
    }

    makeNewcall = (callType, usersList) => {
        const { featureStateData: {isOneToOneCallEnabled = false, isGroupCallEnabled = false } = {} } =this.props;
        let callMode = "onetoone";
        let users = [];
        if (usersList.length > 1) {
            callMode = "onetomany";
            users = usersList;
        } else {
            usersList.map(participant => {
                const { userJid, username, GroupUser } = participant
                let user = userJid || username || GroupUser;
                user = user.split('@')[0];
                let userDetails = getDataFromRoster(user);
                if (!userDetails.isDeletedUser) {
                    users.push(user + "@" + REACT_APP_XMPP_SOCKET_HOST);
                }
            });
        }
        if (users.length === 1 && isOneToOneCallEnabled) {
            this.makeCall(callMode, callType, users, "");
        }else if(users.length > 1 && isGroupCallEnabled) {
            this.makeCall(callMode, callType, users, "");
        }else{
            if(toast.error.length > 1) {
                toast.dismiss();
                toast.error(FEATURE_RESTRICTION_ERROR_MESSAGE);
            } 
        }
    }

    fetchMoreData = () => {
        let callLogsArr = this.state.callLogs;
        callLogs.getCallLogsFromServer(Math.ceil((callLogsArr.length / 20) + 1));
    }
    handleMeetlinkPopup = (data) =>{
        this.setState({meetLinkPopUp: data})
    }

    render() {
        const loaderStyle = {
            width: 80, height: 80
        }
        const { searchterm, newCall, isShow, meetLinkPopUp } = this.state;
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
                            {((isShow === true && callLogArr.length > 0 ) ||
                                searchterm !== "") &&
                                <Search searchIn={this.state.searchIn} handleSearchFilterList={this.handleFilterCallLogsList} />
                            }
                            {this.state.loaderStatus && <div className="loader-container">
                                <img src={loaderSVG} alt="loader" style={loaderStyle} />
                            </div>}
                            <CreateNewmeeting meetLinkPopUp={this.handleMeetlinkPopup}  handleShowCallScreen={this.props.handleShowCallScreen} />
                            {callLogArr.length > 0 &&
                                <ul className={`chat-list-ul padding-bottom-adjust ${meetLinkPopUp ? "active" : ""}`} id="scrollableUl-callLog">
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
                                    <h4>{"Oh snap! It seems like they’re no calls to display!"}</h4>

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
        featureStateData: state.featureStateData,
        callLogData: state.callLogData,
        vCardData: state.vCardData.data,
        VCardContactData: state.VCardContactData,
        messageData: state.messageData,
        rosterData: state.rosterData,
        showConfrenceData: state.showConfrenceData, // Line - added to update the call log UI to display the last ended call when user on call log page. 
        groupsMemberParticipantsListData: state.groupsMemberParticipantsListData,
        contactPermission: state?.contactPermission?.data,
        groupsData: state.groupsData,
        contactsWhoBlockedMe: state.contactsWhoBlockedMe,

    });
};

const mapDispatchToProps = {
    callParticiapants: showModal
}

export default connect(mapStateToProps, mapDispatchToProps)(WebChatCallLogs);
