import React from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import { connect } from 'react-redux';
import { CallLogs, NewChat, NewGroup, DotMenu, Settings, ArrowBack } from '../../assets/images';
import WebChatLogout from '../WebChat/Authentication/WebChatLogout';
import WebChatPopup from '../WebChat/Authentication/WebChatPopup';
import ActionPopUp from '../WebChat/ContactInfo/ActionPopUp';
import ParticipantPopUp from '../WebChat/ContactInfo/ParticipantsPopUp';
import CreateNewGroup from '../WebChat/NewGroup';
import RecentChatSection from '../WebChat/RecentChat';
import CallParticipantsPopup from '../WebCall/ParticipantsPopUp';
import WebChatCallLogs from '../WebCall/CallLogs/WebCallLogs'
import Setting from '../WebChat/Setting';
import WebChatRoster from '../WebChat/WebChatRoster';
import WebChatVCard from '../WebChat/WebChatVCard/WebChatVCard';
import MediaErrorPopup from '../WebCall/MediaErrorPopup';
import CallConversionPopup from '../WebCall/CallConversionPopup';
import callLogsObj from '../WebCall/CallLogs/callLog';
import { fetchingCallLog } from '../../Actions/CallLogAction';
import Store from '../../Store';
import { CALL_CONVERSION_STATUS_ACCEPT, CALL_CONVERSION_STATUS_CANCEL, CALL_CONVERSION_STATUS_DECLINE, CALL_CONVERSION_STATUS_REQUEST, CALL_CONVERSION_STATUS_REQ_WAITING } from '../../Helpers/Call/Constant';
import { Archived } from '../WebChat/Setting/images';
import { UpdateArchiveChatDataAction } from "../../Actions/Common"
import Modal from '../WebChat/Common/Modal';
import ActionPopup from '../ActionPopup/index';
import { showModal } from '../../Actions/PopUp';
import { disconnectCallConnection } from '../../Helpers/Call/Call';
import { callIntermediateScreen, resetConferencePopup } from '../../Actions/CallAction';
import { NEW_CHAT_CONTACT_PERMISSION_DENIED, NEW_GROUP_CONTACT_PERMISSION_DENIED } from '../../Helpers/Chat/Constant';
import { encryptAndStoreInLocalStorage} from '../WebChat/WebChatEncryptDecrypt';
import userList from '../WebChat/RecentChat/userList';

class Sidebar extends React.Component {

    constructor(props) {
        super(props);
        this.currentUserRequestingCallSwitch = false;
        this.remoteUserRequestingCallSwitch = false;
        this.state = {
            menuDropDownStatus: false,
            popupStatus: false,
            newChatStatus: true,
            newChatStatusLevel: "",
            newGroupParticipants: false,
            archivedChatList: false,
            menuSetGroupImage: false,
            chatLogs: false,
            handleBackStatus: false,
            callLogs: false,
            settingStatus: false,
            archivedSetting: false,
            callLogCount: 1,
        };
    }

    handleLogutStatus = (status) => {
        this.setState({ popupStatus: status, menuDropDownStatus: false });
    }

    handleMenuDrop = (e) => {
        this.setState({ menuDropDownStatus: !this.state.menuDropDownStatus });
    }

    outsidePopupClick = (e) => {
        const { popUpData: { modalProps: { open } } } = this.props
        if (open) {
            return;
        }
        this.setState({ menuDropDownStatus: false, popupStatus: false });
    }

    handleNewChat = () => {
        if(this.props.contactPermission === 0){
            this.props.handleContactPermissionPopup(true, NEW_CHAT_CONTACT_PERMISSION_DENIED);
            return;
        }
        userList.getUsersListFromSDK(1);
        this.setState({ newChatStatus: false });
    }

    handleOnBack() {
        this.setState({ chatLogs: false });
    }

    handleCallLogs = () => {
        this.setState({ newChatStatus: false });
        this.setState({ callLogs: true });
        Store.dispatch(fetchingCallLog(true));
        callLogsObj.getCallLogsFromServer(1);
    }

    /**
     * handleBackStatus() manage view of recent chat or conversatipon page in responsive mode.
     * Also manage view of recent chat or roster.
     */
    handleBackStatus = (status) => {
        this.props.handlePopupState(status)
        let statusView = "block";
        this.setState({ newChatStatus: status }, () => {
            this.props.handleConversationSectionDisplay(statusView)
        });
    }

    handleDropdownStatus = (status) => {
        this.setState({ menuDropDownStatus: !this.state.menuDropDownStatu });
    }

    //New group participant list
    handleCreateNewGroup = () => {
        if(this.props.contactPermission === 0){
            this.props.handleContactPermissionPopup(true, NEW_GROUP_CONTACT_PERMISSION_DENIED);
            return;
        }
        this.setState({ newGroupParticipants: true }, () => {
            this.setState({ menuDropDownStatus: false })
        });
    }

    handleArchivedChatList = () => {
        this.setState({ archivedChatList: true, menuDropDownStatus: false }, () => {
            setTimeout(() => {
                Store.dispatch(UpdateArchiveChatDataAction({ isArchived: true }))
            }, 1000);
        });
    }

    handleBackToRecentChat = () => {
        this.setState({
            newGroupParticipants: false,
            archivedChatList: false
        }, () => {
            Store.dispatch(UpdateArchiveChatDataAction({ isArchived: false }));
        });

    }

    handleBackToArchivedList = () => {
        this.setState({
            archivedSetting: false,
            archivedChatList: true
        });
    }
    handleBackToGroupParticipants = () => {
        this.setState({
            newGroupParticipants: true
        });
    }

    handleSetting = () => {
        this.setState({
            settingStatus: true,
        });
    }
    handleBackFromSetting = () => {
        this.setState({
            settingStatus: false,
        });
    }
    handleBackFromCallLogs = (status) => {
        this.setState({ newChatStatus: status });
        this.setState({ callLogs: false });
    }

    _sideMenuPop = () => {
        return (
            <>
                <OutsideClickHandler onOutsideClick={() => this.outsidePopupClick()} >
                    {this.state.menuDropDownStatus &&
                        <ul className="menu-dropdown">
                            <li title="New Group" onClick={this.handleCreateNewGroup}><i><NewGroup /></i><span>New Group</span></li>
                            {/* <li title="Starred Messages" onClick={this.handleStarred} ><i><Starred/></i><span>Starred</span></li>  */}
                            <li title="Settings" onClick={this.handleSetting}><i><Settings /></i><span>Settings</span></li>
                            <WebChatLogout history={this.props.history} logoutStatus={this.handleLogutStatus} handleDropdownStatus={this.handleDropdownStatus} />
                        </ul>
                    }
                </OutsideClickHandler>
            </>
        )
    }

    browserNotifyRedirect = (prevProps) => {
        // When click on missed call notification, need to redirect to calllog page
        // We check the browserNotify pageName is 'calllog', then swith the page to calllog
        const prevPropsBrowserNotifyData = prevProps.browserNotifyData;
        const browserNotifyData = this.props.browserNotifyData;
        if (browserNotifyData.pageName &&
            prevPropsBrowserNotifyData.pageName !== browserNotifyData.pageName &&
            browserNotifyData.pageName === 'calllog'
        ) {
            this.handleCallLogs()
        }
    }

    componentDidUpdate = (prevProps) => {
        this.browserNotifyRedirect(prevProps);
    }

    resetCallConversionRequestData = () => {
        this.currentUserRequestingCallSwitch = false;
        this.remoteUserRequestingCallSwitch = false;
    }

    renderRecentChat = (pageType) => {
        return (
            <RecentChatSection
                pageType={pageType}
                handleConversationSectionDisplay={this.props.handleConversationSectionDisplay}
                handleBackStatus={this.handleBackStatus}
                callUserJID={this.props.callUserJID}
                callStatus={this.props.callStatus}
                newChatStatus={this.state.newChatStatus}
                handleShowCallScreen={this.props.handleShowCallScreen}
                callType={this.props.callType}
                callMode={this.props.callMode}
                handlePopupState={this.props.handlePopupState}
                handleArchivedChatList={this.handleArchivedChatList}
            />
        );
    };

    closeModel = (modelType) => {
        Store.dispatch(
            showModal({
                open: false,
                modelType
            })
        );
    }

    handleJoinCallAction = () => {
        encryptAndStoreInLocalStorage("isNewCallExist", true);
        disconnectCallConnection();
        Store.dispatch(resetConferencePopup());
        this.closeModel("CallConfirm");
        const newLink = this.props.popUpData?.modalProps?.newCallLink
        setTimeout(() => {
            Store.dispatch(callIntermediateScreen({ show: true, link: newLink }));
        }, 10);
    };

    handleCancel = () => {
        this.closeModel("CallConfirm");
    };

    render() {
        let { menuDropDownStatus, popupStatus, newChatStatus, newGroupParticipants, settingStatus,
            callLogs, archivedChatList, callLogCount } = this.state;
        const { vCardData, popUpData: { modalProps: { open, modelType } }, callConversionData, featureStateData } = this.props
        const { isOneToOneCallEnabled = false, isGroupCallEnabled = false, isGroupChatEnabled = false } = featureStateData;
        if (callConversionData && callConversionData.status) {
            if (callConversionData.status === CALL_CONVERSION_STATUS_ACCEPT) {
                if (this.remoteUserRequestingCallSwitch === true && this.currentUserRequestingCallSwitch === true) {
                    this.currentUserRequestingCallSwitch = false;
                }
                this.remoteUserRequestingCallSwitch = false;
            } else if (callConversionData.status === CALL_CONVERSION_STATUS_REQ_WAITING) {
                this.currentUserRequestingCallSwitch = true;
            } else if (callConversionData.status === CALL_CONVERSION_STATUS_REQUEST) {
                this.remoteUserRequestingCallSwitch = true;
            } else if (callConversionData.status === CALL_CONVERSION_STATUS_CANCEL) {
                this.resetCallConversionRequestData();
            } else if (callConversionData.status === CALL_CONVERSION_STATUS_DECLINE) {
                this.resetCallConversionRequestData();
            }
        }

        return (
            <>
                <div className="recent-chatlist">
                    <OutsideClickHandler onOutsideClick={() => this.outsidePopupClick()} >
                        {newChatStatus && <>
                            <div className="recent-chatlist-header">
                                <WebChatVCard />
                                <div className="profile-options">
                                    {(isOneToOneCallEnabled || isGroupCallEnabled) &&
                                        <i className="callLogs" onClick={this.handleCallLogs} title="Call logs">
                                            {callLogCount ?
                                                <div className='callLogCount'>
                                                    <CallLogs />
                                                    <span style={{ display: "none" }}>{callLogCount}</span>
                                                </div>
                                                :
                                                <CallLogs />
                                            }
                                        </i>
                                    }
                                    <i className="newchat-icon" onClick={this.handleNewChat} title="New chat">
                                        <span className="toggleAnimation"></span>
                                        <NewChat />
                                    </i>
                                    <i className={(this.state.menuDropDownStatus) ? 'menu-icon open' : 'menu-icon'} onClick={this.handleMenuDrop} title="More options">
                                        <span className="toggleAnimation"></span>
                                        <DotMenu />
                                    </i>
                                </div>
                                {menuDropDownStatus ? <>
                                    <OutsideClickHandler onOutsideClick={() => this.outsidePopupClick()} >
                                        <ul className="menu-dropdown open">
                                           {isGroupChatEnabled && <li title="New Group" onClick={this.handleCreateNewGroup}><i><NewGroup /></i><span>New Group</span></li>}
                                            {!this.props.isEnableArchived && <li title="Archived Chats" onClick={this.handleArchivedChatList} ><i><Archived style={{ color: "#6a92c5", fill: "#6a92c5" }} /></i><span>Archived</span></li>}
                                            <li title="Settings" onClick={this.handleSetting}><i><Settings /></i><span>Settings</span></li>
                                            <WebChatLogout history={this.props.history} logoutStatus={this.handleLogutStatus} handleDropdownStatus={this.handleDropdownStatus} />
                                        </ul>
                                    </OutsideClickHandler>
                                </> : null}
                            </div>
                            {popupStatus && <WebChatPopup history={this.props.history} logoutStatus={this.handleLogutStatus} />}
                        </>
                        }
                        {this.renderRecentChat("recent")}
                        {!newChatStatus && <WebChatRoster
                            newChatStatus={newChatStatus}
                            handleBackStatus={this.handleBackStatus}
                        />}
                    </OutsideClickHandler>
                    {newGroupParticipants &&
                        <CreateNewGroup
                            vCardData={vCardData}
                            handleBackToRecentChat={this.handleBackToRecentChat}
                        />
                    }
                    {archivedChatList &&
                        <div className="contactlist">
                            <div className="recent-chatlist-header">
                                <div className="profile-img-name">
                                    <i className="newchat-icon" onClick={this.handleBackToRecentChat} title="Back">
                                        <ArrowBack />
                                    </i>
                                    <span>{"Archived"}</span>
                                </div>
                            </div>
                            {this.renderRecentChat("archive")}
                        </div>
                    }
                    {
                        callLogs && <WebChatCallLogs handleBackStatus={this.handleBackFromCallLogs} handleContactPermissionPopup={this.props.handleContactPermissionPopup}/>
                    }

                    {settingStatus &&
                        <Setting
                            handleBackFromSetting={this.handleBackFromSetting}
                            logoutStatus={this.handleLogutStatus}
                        />
                    }
                </div>
                {open && modelType === 'action' && <ActionPopUp {...this.props.popUpData} />}
                {open && modelType === 'participants' && <ParticipantPopUp />}
                {open && ['callparticipants', 'inviteParticipants', 'calllogparticipants'].indexOf(modelType) > -1 && <CallParticipantsPopup />}
                {open && ["mediaPermissionDenied", "mediaAccessError"].indexOf(modelType) > -1 && <MediaErrorPopup />}
                {callConversionData.status &&
                    <CallConversionPopup
                        callConversionData={callConversionData}
                        resetCallConversionRequestData={this.resetCallConversionRequestData}
                        currentUserRequestingCallSwitch={this.currentUserRequestingCallSwitch}
                        remoteUserRequestingCallSwitch={this.remoteUserRequestingCallSwitch}
                    />
                }
                {open && modelType === "CallConfirm" && (
                    <Modal containerId="container">
                        <ActionPopup
                            handleActionText={"Ok"}
                            handleCancelText={"Cancel"}
                            handleAction={() => this.handleJoinCallAction()}
                            handleCancel={() => this.handleCancel()}
                            text={"Do you want to leave your call to join this one?"}
                        />
                    </Modal>
                )}
            </>

        )
    }

}

const mapStateToProps = state => {
    return {
        featureStateData: state.featureStateData,
        popUpData: state.popUpData,
        vCardData: state.vCardData,
        callConversionData: state.callConversionData,
        browserNotifyData: state.browserNotifyData,
        isEnableArchived: state?.webLocalStorageSetting?.isEnableArchived,
        contactPermission: state?.contactPermission?.data
    }
}

export default connect(mapStateToProps, null)(Sidebar);
