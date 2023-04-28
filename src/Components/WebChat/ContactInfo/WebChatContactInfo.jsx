import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import _toArray from "lodash/toArray";
import renderHTML from 'react-render-html';
import { showModal as showModalPopupAction, hideModal } from '../../../Actions/PopUp';
import OutsideClickHandler from 'react-outside-click-handler';
import {
    UnsavedContact, ClosePopup, Done, Edit, MailiconSolid,
    Status,
} from '../../../assets/images';
import "../../../assets/scss/common.scss";
import "../../../assets/scss/minEmoji.scss";
import ImageComponent from '../Common/ImageComponent';
import {
    ABOUT_AND_EMAIL_ID,
    ABOUT_AND_PHONE_NO, REACT_APP_GROUP_NAME_CHAR
} from '../../processENV';
import SDK from '../../SDK';
import Modal from '../Common/Modal';
import { BlockPopUp } from '../PopUp/BlockPopUp';
import { ConformationPopup } from '../PopUp/ComformationPopup';
import WebChatcontactInfoMedia from './WebChatContactInfoMedia';
import { toast } from 'react-toastify';
import WebChatEmoji from '../WebChatEmoji';
import { initialNameHandle, isLocalUser } from '../../../Helpers/Chat/User';
import { isSingleChat, isGroupChat, getChatMessageHistoryById, getActiveConversationChatId, getActiveConversationChatJid, handleTempArchivedChats, getLastMsgFromHistoryById, getActiveChatMessages } from '../../../Helpers/Chat/ChatHelper';
import { updateBlockedContactAction } from '../../../Actions/BlockAction';
import { ADD_PARTICIPANT_GROUP_CONTACT_PERMISSION_DENIED, CHAT_TYPE_SINGLE, REPORT_FROM_CONTACT_INFO, UNBLOCK_CONTACT_TYPE } from '../../../Helpers/Chat/Constant';
import Store from '../../../Store';
import UserStatus from '../Common/UserStatus';
import { isUserWhoBlockedMe } from '../../../Helpers/Chat/BlockContact';
import ProfileImage from '../Common/ProfileImage';
import { getSelectedText, removeMoreNumberChar, setInputCaretPosition } from '../../../Helpers/Chat/ContentEditableEle';
import { blockOfflineAction, getFormatPhoneNumber, getUserIdFromJid, isAppOnline } from '../../../Helpers/Utility';
import ContactInfoProfileUpdate from '../WebChatVCard/ContactInfoProfileUpdate';
import ClearDeleteOption from './ClearDeleteOption';
import BlockUnBlockOption from './BlockUnBlockOption';
import ContactInfoMediaGrid from './ContactInfoMediaGrid';
import ShowMediaInDetailPopup from './ShowMediaInDetailPopup';
import { clearLastMessageinRecentChat, updateMuteStatusRecentChat } from '../../../Actions/RecentChatActions';
import ActionInfoPopup from '../../ActionInfoPopup';
import { getMessagesForReport } from "../../../Helpers/Chat/ChatHelper"
import { ClearChatHistoryAction } from '../../../Actions/ChatHistory';
import { RemoveStaredMessagesClearChat } from '../../../Actions/StarredAction';
class WebChatContactInfo extends React.Component {

    /**
     * Following are the states used in WebChatContactInfo Component.
     * @param {object} displayName contact's name.
     * @param {object} image contact's profile.
     * @param {boolean} status contact's user status.
     * @param {boolean} jid contact's mobile number.
     * @param {boolean} isBlocked contact's blocked/unblocked status.
     */
    constructor(props) {
        super(props);
        this.state = {
            displayName: "",
            image: "",
            status: "",
            jid: "",
            isBlocked: false,
            showContactProfileImg: false,
            contactInfoMediaGrid: false,
            showModal: false,
            groupName: props.rosterName,
            viewEdit: true,
            showDeletePopup: false,
            showReportPopup: false,
            reportPopup: '',
            showClearPopup: false,
            showMediaInDetailPopup: false,
            isLocalUserInGroup: true,
            groupNameCount: "0",
            exitGroup: false,
            confirmExitGroup: false,
            isAdminBlocked:this.props?.roster?.isAdminBlocked,
            isDeletedAccount:this.props?.roster?.isDeletedUser,
            contactPermissionPopup: false
            // userNameChars : REACT_APP_GROUP_NAME_CHAR

        }
        this.userNameCursorPostion = 0;
        this.userNameSelectedText = '';
        this.userStatusCursorPostion = 0;
        this.userStatusSelectedText = '';
        this.addNewParticipantsPopOpen = false;
    }
    
    updateLocalUserGroupState = () => {
        const { groupsMemberListData: { data: { groupJid } = {} } = {}, participants = [] } = this.props;
        const localUser = participants.find(users => isLocalUser(users.userId));
        const isAdmin = localUser && localUser.userType === 'o';
        const preStateUserInGroup = this.state.isLocalUserInGroup;
        const viewEdit = this.state.viewEdit;
        this.setState({
            isAdmin: !!isAdmin,
            groupuniqueId: groupJid,
            isLocalUserInGroup: !!localUser,
            viewEdit: localUser ? viewEdit : true,
            exitGroup: !localUser ? true : false,
        }, () => {
            if (preStateUserInGroup && !this.state.isLocalUserInGroup) {
                // If local user is in the process of Add/Remove users, Make user as admin
                // At this time, if local user is removed from the group by other admin user,
                // we should block the local user from further process.
                const popupModelType = this.props?.popUpData?.modalProps?.modelType;
                const popupAction = this.props?.popUpData?.modalProps?.action;
                if (popupModelType === 'participants' || ["groupRemoveMember", "groupMakeAdmin"].indexOf(popupAction) > -1) {
                    this.props.closePopup();
                    this.props.onInfoClose(true);
                }
                // Suppose If user try to edit the group name,
                // At this time, if local user is removed from the group by other admin user,
                // we should block the local user from further process.
                if (!viewEdit && this.state.viewEdit) {
                    this.props.onInfoClose(true);
                }
            }
        });
        // if (!localUser) {
        //     this.setState({
        //         exitGroup: true
        //     })
        // }
    }

    /**
     * componentDidMount is one of the react lifecycle method. <br />
     *F
     * In this method to handle the block user data.
     */
    componentDidMount() {
        if (this.isChat()) {
            this.handleBlockUserData()
            return
        }
        this.updateLocalUserGroupState();
        this.handleGroupNameCount();
    }

    /**
     * handleBlockUserData() method used to display contacts blocked/unblocked status.
     */
    handleBlockUserData = () => {
        let blockedContactArr = this.props.blockedContact.data;
        const userJid = getActiveConversationChatJid();
        const isBlocked = blockedContactArr.indexOf(userJid) > -1;
        this.setState({ isBlocked });
    }

    /**
     * componentDidUpdate is one of the react lifecycle method. <br />
     *
     * In this method to handle the block user data.
     *
     * @param {object} prevProps
     * @param {object} prevState
     */
    componentDidUpdate(prevProps, prevState) {
        const { chatType } = this.props;
        if (isGroupChat(chatType) && this.props.rosterName !== prevProps.rosterName) {
            this.setState({ groupName: this.props.rosterName });
        }

        // Check group memebers list get update
        const { groupsMemberListData: { id: groupMemberListId } } = this.props
        const previousGroupMemberListId = prevProps?.groupsMemberListData?.id
        if (groupMemberListId !== previousGroupMemberListId) {
            this.updateLocalUserGroupState();
        }

        if(prevProps.rosterData.id !== this.props.rosterData.id){
            const userId = this.props.roster?.userId
            const { data = [] } = this.props.rosterData
            let selectedUser = data.find(ele=> ele.userId === userId)
            this.setState({
                isAdminBlocked : selectedUser?.isAdminBlocked,
                isDeletedAccount:selectedUser?.isDeletedUser
            })
            if(selectedUser?.isDeletedUser || selectedUser?.isAdminBlocked){
                if(this.state.showReportPopup){
                    toast.error( selectedUser?.isDeletedUser ? `Cannot report deleted user` :  `This user no longer available`)
                }
                this.setState({
                    showReportPopup: false,
                });
            }
        }

        if(prevProps.groupsData.id !== this.props.groupsData.id){
            const {activeChatData:{ data : {chatId = "" } }} = this.props
            const { data = [] } = this.props.groupsData
            let selectedUser = data.find(ele=> ele.userId === chatId)
            
            this.setState({
                isAdminBlocked : selectedUser?.isAdminBlocked
            })

            if(selectedUser?.isAdminBlocked){
                this.setState({
                    showReportPopup: false,
                });
            }
        }

        if(prevProps.groupsMemberListData.id !== this.props.groupsMemberListData.id){
            const { data:{ participants = [] } } = this.props.groupsMemberListData
            const { data:{fromUser = ""}} = this.props.vCardData 
            let checkUser = participants.find(ele => ele.userId === fromUser)
            if(!checkUser){
                this.setState({
                    isAdmin:false
                })   
            }
            else if(checkUser?.userType === "o"){
                this.setState({
                    isAdmin:true
                })   
            }
        }
    }

    /**
     * handleProfileImageShow() method to maintain state to show profile image in big screen.
     */
    handleContactInfoImg = (e) => {
        if (this.props.rosterImage !== "") {
            const { showContactProfileImg } = this.state
            this.setState({ showContactProfileImg: !showContactProfileImg }, () => {
                this.props.handlePopUpClassActive(!showContactProfileImg);
            });
        }
    }

    /**
     * handleContactMedia() method to maintain state to show all media.
     */
    handleContactMedia = () => {
        const { contactInfoMediaGrid } = this.state
        this.setState({ contactInfoMediaGrid: !contactInfoMediaGrid });
    }

    isChat = () => isSingleChat(this.props?.activeChatData?.data?.recent?.chatType)

    handleSaveGroupName = async (e) => {
        if (!isAppOnline()) {
            blockOfflineAction()
            return
        }
        let groupName = this.state.groupName.trim();
        if (this.props.rosterName !== groupName) {
            let groupImage = this.props.rosterImage;
            const groupJid = getActiveConversationChatJid();
            SDK.setGroupProfile(groupJid, groupName, groupImage);
        }
        this.setState({ viewEdit: true, groupName })
    }

    /**
     * handleWordCount() method to maintain state for characters left for username field.
     */
    handleGroupName = event => {
        const { value = "" } = event.target;
        const message = removeMoreNumberChar(REACT_APP_GROUP_NAME_CHAR, value);
        this.setState({
            groupName: message,
            groupNameCount: this.findNegativeValue(message, REACT_APP_GROUP_NAME_CHAR),
        });
    }

    handleGroupNameCount = () => {
        const group_name = this.state.groupName;
        const message = removeMoreNumberChar(REACT_APP_GROUP_NAME_CHAR, group_name);
        this.setState({
            groupName: message,
            groupNameCount: this.findNegativeValue(message, REACT_APP_GROUP_NAME_CHAR),
        });
    }

    /**
    * onEmojiClick() method to maintain state to append username and emoji in username field.
    */
    onEmojiClickUsername = (emojiObject) => {
        const { groupName = "" } = this.state;
        const conditionCheck = this.findNegativeValue(groupName, REACT_APP_GROUP_NAME_CHAR) > 0 ? true : false;
        if (conditionCheck) {
            let cursorPosition = this.userNameCursorPostion;
            let userName = '';

            if (this.userNameSelectedText === this.state.groupName) {
                userName = emojiObject;
                cursorPosition = emojiObject.length;
            }
            else {
                const start = this.state.groupName.substring(0, cursorPosition);
                const end = this.state.groupName.substring(cursorPosition);
                userName = start + emojiObject + end;
                cursorPosition = cursorPosition + emojiObject.length;
            }
            const charLeft = this.findNegativeValue(userName, REACT_APP_GROUP_NAME_CHAR);
            this.setState({ groupNameCount: charLeft, groupName: userName }, () => {
                this.userNameCursorPostion = cursorPosition;
                setInputCaretPosition(document.getElementById("username"), cursorPosition);
            });
            (charLeft === REACT_APP_GROUP_NAME_CHAR) ? this.setState({ viewTick: true }) : this.setState({ viewTick: false })
        }
    }

    handleEdit = event => {
        this.setState({ viewEdit: false });
    }
    handleNewParticipants = () => {
        const { isAdmin } = this.state
        if (!isAdmin) {
            return
        }
        if (!this.props.contactPermission) {
            this.setState({ contactPermissionPopup: true });
            return;
        }
        const { rosterName, participants = [] } = this.props
        const groupMembers = participants.map(participant => {
            const { userId, username, GroupUser } = participant
            return userId || username || GroupUser
        })
        this.addNewParticipantsPopOpen = true;
        this.props.addParticiapants({
            open: true,
            modelType: 'participants',
            groupName: rosterName,
            groupMembers: groupMembers,
            groupuniqueId: this.state.groupuniqueId
        })
    }

    handleCloseAddNewParticipantsPopup = () => {
        const {
            popUpData: {
            modalProps: { open , modelType }
            }
        } = this.props;
        if (open && modelType === "participants" && this.addNewParticipantsPopOpen) {
            console.log("handleCloseAddNewParticipantsPopup", "close the popup");
            this.addNewParticipantsPopOpen = false;
            this.props.closePopup();
            this.setState({ contactPermissionPopup: true });
        }
    }

    dispatchAction = () => {
        const { isBlocked } = this.state
        this.setState({
            showModal: false
        }, async () => {
            const userJid = getActiveConversationChatJid();
            if (isBlocked) {
                const res = await SDK.unblockUser(userJid);
                if (res && res.statusCode === 200) {
                    handleTempArchivedChats(userJid, CHAT_TYPE_SINGLE);
                    this.setState({ isBlocked: false });
                    this.props.updateBlockedContactAction(userJid, UNBLOCK_CONTACT_TYPE);
                    toast.success(`${this.props.rosterName || 'User'} has been Unblocked`);
                }
            } else {
                const res = await SDK.blockUser(userJid);
                if (res && res.statusCode === 200) {
                    handleTempArchivedChats(userJid, CHAT_TYPE_SINGLE);
                    this.setState({ isBlocked: true });
                    this.props.updateBlockedContactAction(userJid);
                    toast.success(`${this.props.rosterName || 'User'} has been Blocked`);
                }
            }
        })
    }

    checkMessageExist = () => {
        const chatMessages = getChatMessageHistoryById(getActiveConversationChatId());
        if (chatMessages && Array.isArray(chatMessages) && chatMessages.length === 0) {
            toast.info('There is no conversation.');
            return false;
        }
        return true;
    }

    deleteOrClearAction = async (dataClear) => {
         let lastMsgId = "", lastIndexItem;
         const { chatConversationHistory: {data = {} } = {} } = this.props;
         const userOrGroupJid = getActiveConversationChatJid();
         const userId = getUserIdFromJid(userOrGroupJid);
         const chatids = Object.keys(data);
        if(chatids.includes(userId)) {
            const { msgId = "", msgStatus } = getLastMsgFromHistoryById(userId);
            const chatMessages = getActiveChatMessages();
            const filteredMsg = chatMessages.filter((message) => message.msgStatus !== 3);
            lastIndexItem = filteredMsg.length -1;
            if(msgStatus !== 3) lastMsgId = msgId;
            else lastMsgId = filteredMsg[lastIndexItem]?.msgId || "";
        }
         
        const { isclear } = dataClear;
        const isChat = this.isChat();
        if (isChat) {
            const userJid = getActiveConversationChatJid();
            this.setState({
                showModal: false,
                showDeletePopup: false,
                showClearPopup: false
            }, () => {
                if(isclear){
                    SDK.clearChat(userJid, true, lastMsgId)
                    .then(async (res) => {
                        if(res.statusCode === 200){
                            const resId = { fromUserId: userId, lastMsgId: lastMsgId, msgType: "clearChat" }
                            Store.dispatch(ClearChatHistoryAction(resId));
                            Store.dispatch(clearLastMessageinRecentChat(resId.fromUserId));
                            Store.dispatch(RemoveStaredMessagesClearChat(resId));
                        }
                    }).catch((error) => {
                        console.log("clearChat error",error)
                    })
                }else{
                    SDK.deleteChat(userJid);
                }
                this.props.onInfoClose();
            })
        } else {
            this.setState({
                showModal: false,
                showDeletePopup: false,
                showClearPopup: false
            }, () => {
                const groupJid = getActiveConversationChatJid();
                if(isclear){
                    SDK.clearChat(groupJid, true, lastMsgId)
                    .then(async (res) => {
                        if(res.statusCode === 200){
                            const resId = { fromUserId: userId, lastMsgId: lastMsgId, msgType: "clearChat" }
                            Store.dispatch(ClearChatHistoryAction(resId));
                            Store.dispatch(clearLastMessageinRecentChat(resId.fromUserId));
                            Store.dispatch(RemoveStaredMessagesClearChat(resId));
                        }
                    }).catch((error) => {
                        console.log("clearChat error",error)
                    })
                }else{
                    SDK.userDeleteGroup(groupJid);
                }
                this.props.onInfoClose();
            })
        }
    }

    toastNoInternet = () => {
        if (!isAppOnline()) {
            blockOfflineAction()
            return
        }
    }

    popUpToggleAction = () => {
        const { showModal: showModalPopup } = this.state
        this.setState({
            showModal: !showModalPopup
        })
    };

    deletePopupAction = () => {
        const { showDeletePopup } = this.state
        this.setState({
            showDeletePopup: !showDeletePopup
        })
    }
    reportChatAction = (state = "", show = false) => {
        if(this.state.isDeletedAccount || this.state.isAdminBlocked){
            toast.error( this.state.isDeletedAccount ? `Cannot report deleted user` :  `This user no longer available`)
            return
        }
        this.setState({
            showReportPopup: show,
            reportPopup: state
        });
    }

    reportConfirmAction = async(event) => {
        if(event.detail <=1){
            if (blockOfflineAction()) return;
            if(this.state.isDeletedAccount || this.state.isAdminBlocked)return;
            const { activeChatId = "", activeChatData:{ data : { chatJid = "",chatType = "" } }  } = this.props;
            const reportData = getMessagesForReport(activeChatId, REPORT_FROM_CONTACT_INFO)
            if(reportData.length === 0){
                toast.error(`No Messages To Report`)
                this.setState({
                    showReportPopup: false,
                });
            }else{
                await SDK.reportUserOrGroup(chatJid,chatType,reportData)
                toast.success(`Report sent`);
                this.setState({
                    showReportPopup: false,
                });
                }
        }
    }
    ClearPopupAction = () => {
        if (!this.checkMessageExist()) return;
        const { showClearPopup } = this.state
        this.setState({
            showClearPopup: !showClearPopup,
        })
    }

    dispatchExitAction = () => {
        if (!isAppOnline()) {
            blockOfflineAction()
            return
        }
        const { groupsMemberListData: { data: { groupJid } = {} } = {}, participants = [] } = this.props;
        const localUser = participants.find(users => isLocalUser(users.userId));
        const checkAdmin = localUser && localUser.userType === 'o' ? true : false;
        const userJid = localUser.userJid;
        Store.dispatch(showModalPopupAction({
            groupuniqueId: groupJid,
            userjid: userJid,
            checkAdmin,
            open: true,
            title: 'Are you sure you want to Exit from the group ?',
            activeclass: 'remove-participant',
            modelType: 'action',
            action: 'ExitGroup'
        }));

        this.setState({
            exitGroup: false
        });
    };
    handleMediaInDetail = () => {
        this.setState({
            showMediaInDetailPopup: true,
        })
    }

    /**
    * @param {string} message groupName
    * @param {number} lengthOfString how many char ahs been allowed
    */
    findNegativeValue = (message = "", lengthOfString = 0) => {
        const groupNameLength = lengthOfString - _toArray(message).length;
        if (groupNameLength >= 0) {
            return lengthOfString - _toArray(message).length;
        }
        return 0;
    };

    /**
      * blockPopup render
     */
    blockPopUpRender = () => {
        const { isBlocked = false } = this.state;
        const { rosterName } = this.props;
        return (
            <BlockPopUp
                closeLabel={'Cancel'}
                dispatchAction={this.dispatchAction}
                popUpToggleAction={this.popUpToggleAction}
                actionLabel={`${isBlocked ? 'Unblock' : 'Block'}`}
                headerLabel={`${isBlocked ? 'Unblock' : 'Block'} ${rosterName} ?`}
                infoLabel={`${isBlocked ? 'On unblocking, this contact will be able to call you or send messages to you.' : 'On blocking, this contact will not be able to call you or send messages to you.'}`}
            />
        )
    };

    confirmationPopUpDelete = (showDeletePopup = false) => {//labelDialoge
        if (showDeletePopup) {
            return `Are you sure you want to Delete the ${this.isChat() ? "chat" : "Group"} ?`
        }
        return `Are you sure you want to Clear the chat ?`
    };

    confirmMationUpRender = () => {//confirmationDialoge box
        const { showDeletePopup } = this.state;
        return (
            <ConformationPopup
                dispatchAction={this.deleteOrClearAction}
                closeLabel={showDeletePopup ? 'No' : 'Cancel'}
                actionLabel={`${showDeletePopup ? 'Delete' : 'Clear'}`}
                headerLabel={this.confirmationPopUpDelete(showDeletePopup)}
                label={`${showDeletePopup ? 'DeleteAction' : 'ClearAction'}`}
                popUpToggleAction={showDeletePopup ? this.deletePopupAction : this.ClearPopupAction}
            />
        )
    }

    handleChatMuteAction = async (muteStatus) => {
        if (blockOfflineAction()) return;

        const chatJid = getActiveConversationChatJid();
        SDK.updateMuteNotification(chatJid, muteStatus);
        const dispatchData = {
            fromUserId: getUserIdFromJid(chatJid),
            isMuted: muteStatus
        }
        Store.dispatch(updateMuteStatusRecentChat(dispatchData));
    };

    render() {
        const iniTail = initialNameHandle(this.props.roster, this.props.rosterName);
        const { showModal, contactInfoMediaGrid, viewEdit, showReportPopup, isAdminBlocked,
            isAdmin, groupuniqueId, isBlocked, showDeletePopup, showClearPopup, showMediaInDetailPopup, exitGroup, groupName } = this.state;
        const chatJid = getActiveConversationChatJid()
        if (!this.props.contactPermission) {
            this.handleCloseAddNewParticipantsPopup();
        }
        const {image = ""} = this.props.roster;
        return (
            <Fragment>
                <div>
                    <div className="contactinfo-popup groupinfo-popup">
                        <div className="contactinfo">
                            <OutsideClickHandler onOutsideClick={(event) => {
                                if (event.target.classList.contains('popup')) return
                                if (this.state.showClearPopup) {
                                    this.ClearPopupAction();
                                    return;
                                }
                                if (this.state.showDeletePopup) {
                                    this.deletePopupAction();
                                    return;
                                }
                                if (this.state.showModal) {
                                    this.popUpToggleAction();
                                    return;
                                }
                                if (this.state.showReportPopup) {
                                    return '';
                                }
                                this.props.onInfoClose()
                            }}>
                                {(showDeletePopup || showClearPopup || showModal) &&
                                    <Modal containerId='container'>
                                        {showDeletePopup || showClearPopup ?
                                            this.confirmMationUpRender() : this.blockPopUpRender()
                                        }
                                    </Modal>}
                                <div className="contactinfo-header">
                                    <i onClick={this.props.onInfoClose} >
                                        <ClosePopup />
                                    </i>
                                    <h4>{this.isChat() ? "Contact info" : "Group info"}</h4>
                                </div>

                                {this.isChat() && <div className="single-details-container">
                                    <div className="contactinfo-image-block">
                                        <ProfileImage
                                            chatType={'chat'}
                                            temporary={false}
                                            emailContactInfo={true}
                                            imageToken={this.props.isAdminBlocked  ? "" : this.props.rosterImage}
                                            blocked={isUserWhoBlockedMe(chatJid)}
                                            emailId={this.props.roster?.emailId}
                                            profileImageView={this.handleContactInfoImg}
                                            name={iniTail}
                                            userId={chatJid}
                                        />
                                        <span
                                            title={this.props.rosterName}>
                                            {this.props.rosterName}
                                        </span>
                                    </div>
                                    {this.state.showContactProfileImg && !this.props.isAdminBlocked &&
                                        <Modal containerId='container'>
                                            <div className="Viewphoto-container">
                                                <div className="Viewphoto-preview">
                                                    {
                                                        <ImageComponent
                                                            chatType={'chat'}
                                                            blocked={isUserWhoBlockedMe(chatJid)}
                                                            temporary={false}
                                                            imageToken={image}
                                                        />
                                                    }
                                                    <i className="preview-close" onClick={this.handleContactInfoImg}><ClosePopup /></i>
                                                </div>
                                            </div>
                                        </Modal>
                                    }
                                    { (this.props.roster.emailId || this.props.mobileNumber || this.props.userstatus) &&
                                    <div className="contactinfo-about-no">
                                        <h5>{this.props.roster.emailId ? ABOUT_AND_EMAIL_ID : ABOUT_AND_PHONE_NO}</h5>
                                        {this.props.userstatus &&
                                            <div className="about-no">
                                                <i className="statusIcon">
                                                    <Status />
                                                </i>
                                                <UserStatus
                                                    userId={chatJid}
                                                    status={this.props.userstatus}
                                                />
                                            </div>
                                        }
                                        { (this.props.roster.emailId || this.props.mobileNumber) &&
                                        <div className="about-no">
                                            <i >
                                                {this.props.roster.emailId ? <MailiconSolid /> : <UnsavedContact />}
                                            </i>
                                            <span>{this.props.roster.emailId ? this.props.roster.emailId : getFormatPhoneNumber(this.props.mobileNumber)}</span>
                                        </div>
                                        }
                                    </div>
                                    }

                                    <WebChatcontactInfoMedia
                                        jid={this.props.jid}
                                        chatType={this.props?.activeChatData?.data?.recent?.chatType}
                                    />
                                    <BlockUnBlockOption
                                        handleChatMuteAction={this.handleChatMuteAction}
                                        isBlocked={isBlocked}
                                        ClearPopupAction={this.ClearPopupAction}
                                        popUpToggleAction={this.popUpToggleAction}
                                        deletePopupAction={this.deletePopupAction}
                                        reportSingleChatAction={() => this.reportChatAction('single', true)}
                                        isAdminBlocked={isAdminBlocked}
                                        featureStateData={this.props.featureStateData}
                                    />
                                </div>
                                }
                                {!this.isChat() &&
                                    <div className="group-details-container">
                                        <div className="contactinfo-image-block">
                                            <ContactInfoProfileUpdate
                                                chatType={'groupchat'}
                                                blocked={false}
                                                temporary={false}
                                                imageToken={this.props.rosterImage}
                                                jid={chatJid}
                                                groupName={this.props.rosterName}
                                                roster={this.props.roster}
                                            />
                                            <div className="groupinfo-details">
                                                {!viewEdit && <>
                                                    <input
                                                        type="text"
                                                        value={groupName}
                                                        id="username"
                                                        name="userName"
                                                        maxLength={this.findNegativeValue(groupName, REACT_APP_GROUP_NAME_CHAR) > 0 ? 1000 : 0}
                                                        onChange={this.handleGroupName}
                                                        autoFocus
                                                        onMouseUp={(e) => {
                                                            this.userNameCursorPostion = e.target.selectionStart;
                                                        }}
                                                        onKeyUp={(e) => {
                                                            this.userNameCursorPostion = e.target.selectionStart;
                                                        }}
                                                        onBlur={(e) => {
                                                            this.userNameSelectedText = getSelectedText();
                                                        }}
                                                    ></input>
                                                    <span className="group-count">
                                                        {this.state.groupNameCount}
                                                    </span>
                                                </>}
                                                {!viewEdit &&
                                                    <i className="emoji">
                                                        <WebChatEmoji
                                                            onEmojiClick={this.onEmojiClickUsername}
                                                        />
                                                    </i>
                                                }
                                                {viewEdit &&
                                                    <h4 title={this.state.groupName}>
                                                        {renderHTML(this.state.groupName)}
                                                    </h4>
                                                }
                                            </div>
                                            <div className="groupinfo-controls">
                                                {this.state.isLocalUserInGroup && (!viewEdit ? <i className="editgroupdone" onClick={this.handleSaveGroupName}><Done /></i> :
                                                    <i className="editgroupedit"
                                                        onClick={this.handleEdit}>
                                                        <Edit />
                                                    </i>)
                                                }
                                            </div>
                                        </div>
                                        <WebChatcontactInfoMedia
                                            chatType={this.props?.activeChatData?.data?.recent?.chatType}
                                        />
                                        <ClearDeleteOption
                                            handleChatMuteAction={this.handleChatMuteAction}
                                            isAdmin={isAdmin}
                                            exitGroup={exitGroup}
                                            groupuniqueId={groupuniqueId}
                                            vCardData={this.props.vCardData}
                                            participants={this.props.participants}
                                            ClearPopupAction={this.ClearPopupAction}
                                            deletePopupAction={this.deletePopupAction}
                                            dispatchExitAction={this.dispatchExitAction}
                                            handleNewParticipants={this.handleNewParticipants}
                                            reportGroupChatAction={() => this.reportChatAction('group', true)}
                                        />
                                        {this.state.contactPermissionPopup && <ActionInfoPopup
                                            textActionBtn={"Ok"}
                                            textHeading={"Contact permission"}
                                            textInfo={ADD_PARTICIPANT_GROUP_CONTACT_PERMISSION_DENIED}
                                            />
                                        }
                                    </div>
                                }
                                {showMediaInDetailPopup &&
                                    <ShowMediaInDetailPopup />}
                            </OutsideClickHandler>
                        </div>
                        {/* <div className="outsideHandler" ></div> */}
                    </div>
                    {contactInfoMediaGrid &&
                        <ContactInfoMediaGrid
                            handleContactMedia={this.handleContactMedia}
                        />
                    }
                </div>
                {showReportPopup &&

                    <ActionInfoPopup
                        textActionBtn={"Report"}
                        btnActionClass={"red"}
                        textCancelBtn={"Cancel"}
                        textHeading={`Report ${this.props.rosterName}?`}
                        handleAction={(e) => this.reportConfirmAction(e)}
                        handleCancel={() => this.setState({ showReportPopup: false })}
                        textInfo={
                            `The last 5 messages from this ${this.state.reportPopup === 'single' ?
                            "contact" : "group"
                            } will be forwarded to admin. 
                            ${this.state.reportPopup === 'single' ?
                                "This contact will not be notified." : ""
                            }
                            ${this.state.reportPopup === 'group' ?
                                "No one in this group will be notified." : ""}
                            `}
                    >
                        {/* {this.state.reportPopup === 'group' &&
                            <React.Fragment>
                                <div className='check_option'>
                                    <div className="checkbox-common">
                                        <input
                                            name="participants"
                                            type="checkbox"
                                            checked={confirmExitGroup}
                                            onChange={() => this.setState({
                                                confirmExitGroup: !confirmExitGroup
                                            })}
                                            value={"confirmExitGroup"}
                                            id={"confirmExitGroup"}
                                        />
                                        <label htmlFor={"confirmExitGroup"}></label>
                                    </div>
                                    <label htmlFor={"confirmExitGroup"}>Exit group</label>
                                </div>
                            </React.Fragment>

                        } */}
                    </ActionInfoPopup>
                }
            </Fragment>
        )
    }
}

/**
 * mapping redux data into WebChatContactInfo component properties.
 */
const mapStateToProps = state => {
    return {
        featureStateData: state.featureStateData,
        chatConversationHistory: state.chatConversationHistory,
        activeChatData: state.activeChatData,
        rosterData: state.rosterData,
        blockedContact: state.blockedContact,
        vCardData: state.vCardData,
        groupsData: state.groupsData,
        groupsMemberListData: state.groupsMemberListData,
        contactsWhoBlockedMe: state.contactsWhoBlockedMe,
        popUpData: state.popUpData,
        contactPermission: state?.contactPermission?.data,
        popUpData: state.popUpData
    }
}

const mapDispatchToProps = {
    addParticiapants: showModalPopupAction,
    updateBlockedContactAction,
    closePopup: hideModal,
}

export default connect(mapStateToProps, mapDispatchToProps)(WebChatContactInfo);
