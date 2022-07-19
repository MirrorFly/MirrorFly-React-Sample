import React from "react";
import { connect } from "react-redux";
import { REACT_APP_SOCKETIO_SERVER_HOST, CHECK_INTERENT_CONNECTIVITY, REACT_APP_SKIP_OTP_LOGIN, REACT_APP_AUTOMATION_URL } from "../processENV";
import "react-toastify/dist/ReactToastify.css";
import { callIntermediateScreen, showConfrence } from "../../Actions/CallAction";
import { GroupChatSelectedMediaReset } from "../../Actions/GroupChatMessageActions";
import { ActiveChatAction, RecentChatAction } from "../../Actions/RecentChatActions";
import { SingleChatSelectedMediaReset } from "../../Actions/SingleChatMessageActions";
import { loader, ScanQRLogo } from "../../assets/images";
import "./Login.scss";
import "./NewLoginScreen.scss";
import "../../assets/scss/common.scss";
import "./popup.scss";
import WebChatMediaPreview from "../../Components/WebChat/Conversation/WebChatMediaPreview";
import { getAutomationLoginCredentials, getInitializeObj, isBoxedLayoutEnabled, isSandboxMode, logout } from "../../Helpers/Utility";
import Store from "../../Store";
import SDK from "../SDK";
import CalleScreen from "../WebCall/calleeScreen";
import Connecting from "../WebCall/Connecting";
import WebCallingLayout from "../WebCall/WebCallingLayout";
import ConversationSection from "../WebChat/ConversationSection";
import { getFromLocalStorageAndDecrypt, encryptAndStoreInLocalStorage, getFromSessionStorageAndDecrypt, deleteItemFromSessionStorage, deleteItemFromLocalStorage} from "../WebChat/WebChatEncryptDecrypt";
import Sidebar from "./Sidebar";
import WebRtcCall from "../WebCall/WebRtcCall";
import { toast, ToastContainer } from "react-toastify";
import browserNotify from "../../Helpers/Browser/BrowserNotify";
import browserTab from "../../Helpers/Browser/BrowserTab";
import { GroupsDataAction } from "../../Actions/GroupsAction";
import { blockedContactAction } from "../../Actions/BlockAction";
import { formatToArrayofJid, setContactWhoBleckedMe } from "../../Helpers/Chat/BlockContact";
import { registerWindowEvent } from "../../Helpers/windowEvent";
import {
  handleUserSettings,
  isCurrentSessionActive,
  resetStoreData,
  updateFavicon,
  updateSessionId,
  updateSessionIdInLocalStorage
} from "../../Helpers/Chat/ChatHelper";
import { CHAT_TYPE_GROUP, DEFAULT_TITLE_NAME, NEW_CHAT_CONTACT_PERMISSION_DENIED } from "../../Helpers/Chat/Constant";
import { NO_INTERNET_TOAST } from "../../Helpers/Constants";
import { formatUserIdToJid } from "../../Helpers/Chat/User";
import { setGroupParticipantsByGroupId } from "../../Helpers/Chat/Group";
import { StarredMessagesList } from "../../Actions/StarredAction";
import OtpLogin from "./OtpLogin/index";
import MeetingScreenJoin from "../WebCall/MeetingScreenJoin/";
import { resetCallData } from "../callbacks";
import ActionInfoPopup from '../ActionInfoPopup';
import BlockedFromApplication from "../BlockedFromApplication";
import { adminBlockStatusUpdate } from "../../Actions/AdminBlockAction";
import { RosterDataAction, RosterPermissionAction } from "../../Actions/RosterActions";

const createHistory = require("history").createBrowserHistory;
export const history = createHistory();
let callStatus = "";
class Login extends React.Component {
  /**
   * WebChatQRCode Constructor <br />
   * Following states in this WebChatQRCode Component.
   * @param { boolean } loaderStatus To check the loader status
   * @param { boolean } webChatStatus To check the web chat statu login or logout
   *
   */
  constructor(props) {
    super(props);
    this.state = {
      loaderStatus: true,
      webChatStatus: false,
      onLineStatus: true,
      connectionStatusLoader: false,
      conversationSectionDisplay: { display: "none" },
      hideCallScreen: false,
      isShowPreviewMedia: false,
      username: "",
      password: "",
      newSession: false,
      openStatus: true,
      showMessageinfo: false,
      joinCallPopup: false,
      contactPermissionPopup: false,
      contactPermissionPopupText: "",
      accountDeletedToast: getFromLocalStorageAndDecrypt("deleteAccount")
    };
    this.handleQRCode = this.handleQRCode.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    encryptAndStoreInLocalStorage("hideCallScreen", false);
    registerWindowEvent();
  }

  handleContactPermissionPopup = (state, value = "") => {
    this.setState({
      contactPermissionPopup: state,
      contactPermissionPopupText: value ? value : NEW_CHAT_CONTACT_PERMISSION_DENIED
    });
  }

  handleIframeTask = (e) => {
    if (e.data === "returntoChat") {
      this.setState({ hideCallScreen: true });
    }
    if (e.data === "endcall") {
      Store.dispatch(
        showConfrence({
          showComponent: false
        })
      );
    }
  };

  endOngoingCall = () => {
    SDK.endCall();
    encryptAndStoreInLocalStorage('callingComponent', false)
    deleteItemFromLocalStorage('roomName')
    deleteItemFromLocalStorage('callType')
    deleteItemFromLocalStorage('call_connection_status');
    encryptAndStoreInLocalStorage("hideCallScreen", false);
    resetCallData();
  }

  handleOnStorageChange = () => {
    if (
      getFromSessionStorageAndDecrypt("sessionId") !== null &&
      getFromLocalStorageAndDecrypt("sessionId") !== getFromSessionStorageAndDecrypt("sessionId") &&
      !this.state.newSession
    ) {
      this.endOngoingCall();
      deleteItemFromSessionStorage("sessionId");
      document.getElementById("root").classList.remove("boxLayout");
      this.setState({ newSession: true });
      document.title = DEFAULT_TITLE_NAME;
      updateFavicon("error");
    }
  };

  componentDidMount() {
    updateSessionIdInLocalStorage();
    this.handleSDKIntialize();
    window.addEventListener("message", this.handleIframeTask);
    window.addEventListener("storage", this.handleOnStorageChange, false);
    browserTab.init();
    browserNotify.init();
  }

  handleShowCallScreen = () => {
    encryptAndStoreInLocalStorage("hideCallScreen", false);
    this.setState({ hideCallScreen: false });
    if (this.props.callIntermediateScreen?.data?.hideCallScreen) {
      Store.dispatch(callIntermediateScreen({ hideCallScreen: false }));
    }
  };

  hideCallScreen = () => {
    encryptAndStoreInLocalStorage("hideCallScreen", true);
    this.setState({ hideCallScreen: true });
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.ConnectionStateData && prevProps.ConnectionStateData.id !== this.props.ConnectionStateData.id) {
      if (this.props.ConnectionStateData.data === "CONNECTED") {
        this.setState({
          connectionStatusLoader: true,
          onLineStatus: true
        });
      }
    }

    if (prevProps.messageData && this.props.messageData && prevProps.messageData.id !== this.props.messageData.id) {
      if (this.props.messageData.data.msgType === "logout") {
        logout();
      }
    }

    if (
      prevProps.SingleChatSelectedMediaData &&
      this.props.SingleChatSelectedMediaData &&
      prevProps.SingleChatSelectedMediaData.id !== this.props.SingleChatSelectedMediaData.id &&
      this.props.SingleChatSelectedMediaData.id !== null
    ) {
      this.setState({ isShowPreviewMedia: true });
    }

    if (
      prevProps.GroupChatSelectedMediaData &&
      this.props.GroupChatSelectedMediaData &&
      prevProps.GroupChatSelectedMediaData.id !== this.props.GroupChatSelectedMediaData.id &&
      this.props.GroupChatSelectedMediaData.id !== null
    ) {
      this.setState({ isShowPreviewMedia: true });
    }

    if (prevProps.isAppOnline !== this.props.isAppOnline) {
      if (!this.props.isAppOnline) this.setState({ loaderStatus: true, onLineStatus: false });
      else
        this.setState({ loaderStatus: false, onLineStatus: true }, () => {
          !this.state.webChatStatus && this.handleQRCode();
        });
    }

    const { callIntermediateScreen: { data: { toggleCallScreen, hideCallScreen } = {} } = {} } = this.props;
    if (toggleCallScreen !== prevProps.callIntermediateScreen?.data?.toggleCallScreen) {
      encryptAndStoreInLocalStorage("hideCallScreen", toggleCallScreen);
      this.setState({ hideCallScreen: toggleCallScreen });
    }

    if (hideCallScreen !== this.state.hideCallScreen && hideCallScreen !== prevProps.callIntermediateScreen?.data?.hideCallScreen) {
      if (hideCallScreen) {
        this.hideCallScreen();
      } else {
        this.handleShowCallScreen();
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener("storage", this.handleOnStorageChange);
  }

  handleSDKIntialize = async () => {
    const initializeObj = getInitializeObj();
    const response = await SDK.initializeSDK(initializeObj);
    let responseCall = { statusCode: 200 };

    if (response.statusCode === 200 && responseCall.statusCode === 200) {
      SDK.setMediaEncryption(true); //Enable the media encryption
      if (window.location.hostname === REACT_APP_AUTOMATION_URL) {
        const staticCredential = getAutomationLoginCredentials();
        console.log("staticCredential :>> ", staticCredential);
        this.setState({ webChatStatus: true }, () => {
          this.handleLogin(staticCredential);
        });
        return;
      }

      if (getFromLocalStorageAndDecrypt("auth_user") !== null) {
        let decryptResponse = getFromLocalStorageAndDecrypt("auth_user");

        if (isCurrentSessionActive())
          this.setState({ webChatStatus: true }, () => {
            this.handleLogin(decryptResponse);
          });
        else {
          this.setState({ loaderStatus: false }, () => {
            this.handleQRCode();
          });
        }
      } else {
        this.setState({ loaderStatus: false }, () => {
          this.handleQRCode();
        });
      }
    } else {
      console.log("Intialize error, ", response);
    }
  };

  handleQRCode() {
    try {
      updateSessionId(Date.now());

      if (REACT_APP_SKIP_OTP_LOGIN !== "true") {
        SDK.generateQrCode(
          document.getElementById("divQRCode"),
          document.getElementById("qr-logo"),
          REACT_APP_SOCKETIO_SERVER_HOST,
          (response) => {
            if (response && response.statusCode === 200) {
              let loginResponse = {
                username: response.username,
                password: response.password,
                type: "web"
              };
              return this.handleLoginToken(loginResponse);
            }
            return true;
          }
        );
      }
    } catch (error) {
      console.log("handleQRCode error: ", error);
    }
  }

  handleLoginSuccess = async (data) => {
    
    let resource = SDK.getCurrentUserJid();
    if (resource.statusCode === 200) encryptAndStoreInLocalStorage("loggedInUserJidWithResource", resource.userJid);
    
    const tokenResult = await SDK.getUserToken(data.username, data.password);
    if (tokenResult.statusCode === 200) {
      encryptAndStoreInLocalStorage("token", tokenResult.userToken);
    }

    deleteItemFromSessionStorage("isLogout");
    encryptAndStoreInLocalStorage("recordingStatus", true);
    encryptAndStoreInLocalStorage("auth_user", data);

    if (isBoxedLayoutEnabled()) {
      document.getElementById("root").classList.add("boxLayout");
    }

    await SDK.getUserProfile(formatUserIdToJid(data.username));
    const userIBlockedRes = await SDK.getUsersIBlocked();
    if (userIBlockedRes && userIBlockedRes.statusCode === 200) {
      const jidArr = formatToArrayofJid(userIBlockedRes.data);
      Store.dispatch(blockedContactAction(jidArr));
    }

    const userBlockedMeRes = await SDK.getUsersWhoBlockedMe();
    if (userBlockedMeRes && userBlockedMeRes.statusCode === 200) {
      const jidArr = formatToArrayofJid(userBlockedMeRes.data);
      setContactWhoBleckedMe(jidArr);
    }

    //await SDK.getFriendsList();
    Store.dispatch(RosterPermissionAction(true));
    Store.dispatch(RosterDataAction([]));

    const groupListRes = await SDK.getGroupsList();

    if (groupListRes && groupListRes.statusCode === 200) {
      groupListRes.data.map(async (group) => {
        const groupJid = formatUserIdToJid(group.groupId, CHAT_TYPE_GROUP);
        const groupPartRes = await SDK.getGroupParticipants(groupJid);
        if (groupPartRes && groupPartRes.statusCode === 200) {
          setGroupParticipantsByGroupId(groupJid, groupPartRes.data.participants);
        }
      });
      Store.dispatch(GroupsDataAction(groupListRes.data));
    }

    handleUserSettings();
    setTimeout(() => {
      this.setState({ webChatStatus: true }, async () => {
        const recentChatsRes = await SDK.getRecentChats();
        if (recentChatsRes && recentChatsRes.statusCode === 200) {
          Store.dispatch(RecentChatAction(recentChatsRes.data));
        }

        const urlPath = this.props.location?.pathname ? this.props.location?.pathname.split("/") : [];
        if (urlPath.length > 1 && urlPath[1]) {
          Store.dispatch(callIntermediateScreen({ show: true, link: urlPath[1] }));
          this.props.history.replace({ pathname: `/` });
        }

        const favResult = await SDK.getAllFavouriteMessages();
        Store.dispatch(StarredMessagesList(favResult.data));
      });
    }, 100);
  };

  async handleLoginToken(data) {
    this.handleLoginSuccess(data);
  }

  handleSandboxProfileUpdate = async (response) => {
    if (response.isProfileUpdated === false) {
      await SDK.setUserProfile(response.username, ``, ``, ``, ``);
    }
  };

  /**
   * handleLogin()
   * To call the SDK.connect() method with user name and password.
   */
  handleLogin(response) {
    let loginResponse = {
      username: response.username,
      password: response.password,
      type: "web"
    };
    let tabId = Date.now();
    SDK.connect(response.username, response.password)
      .then(async (res) => {
        if (res.statusCode === 200) {
          // if (isSandboxMode() && response.isProfileUpdated === false) {
          //   this.handleSandboxProfileUpdate(response);
          // }
          updateSessionId(tabId);
          this.handleLoginToken(loginResponse);
          return;
        } else if (res.statusCode === 403) {
          Store.dispatch(adminBlockStatusUpdate({
            toUserId: response.username,
            isAdminBlocked: true
          }));
          logout("block");
          return
        }
        throw new Error("login Failed");
      })
      .catch((error) => {
        console.log("handleLogin error, ", error);
        deleteItemFromLocalStorage("auth_user");
        this.setState({ webChatStatus: false, loaderStatus: false });
      });
  }

  handleInputChange = (evt) => {
    const { name, value } = evt.target;
    this.setState((prevState) => ({ ...prevState, [name]: value }));
  };

  submitLogin = async () => {
    const obj = {};
    const { username, password } = this.state;
    obj.username = username;
    obj.password = password;
    if (obj.username && obj.password) {
      this.handleLogin(obj);
    }
  };

  qrCodeStatus = () => {
    if (!this.state.onLineStatus) {
      return CHECK_INTERENT_CONNECTIVITY;
    }
    return "Generating QR code";
  };

  qaCanvas = () => {
    return (
      <>
        <canvas id="divQRCode" />
        {this.state.connectionStatusLoader && (
          <div className="qr-load-container">
            <img className="qr-load" src={loader} alt="loader" />
          </div>
        )}
      </>
    );
  };

  renderQRTemplate = () => {
    return (
      <div className="qr-image">
        <img src={ScanQRLogo} alt="scan-logo" id="qr-logo" />
        {this.state.loaderStatus ? (
          <span className="loader-text">{this.qrCodeStatus()}</span>
        ) : (
          <>
            <span className="loader-text">{this.qrCodeStatus()}</span>
            {this.qaCanvas()}
          </>
        )}
      </div>
    );
  };

  openJoinCallPopup = () => {
    this.setState({
      joinCallPopup: true
    });
  };

  cancelJoinCallPopup = () => {
    this.setState({
      joinCallPopup: false
    });
  };

  renderUsernamePasswordTemplate = () => {
    return (
      <div className="mirrorfly newLoginScreen">
        <div className={`login-wrapper`}>
          <div className="login-content skip-login-form">
            <form className="form-login">
              <div className="form-control">
                <label>Username</label>
                <input
                  name="username"
                  className="login-input"
                  value={this.state.username}
                  onChange={this.handleInputChange}
                />
              </div>
              {!isSandboxMode() && (
                <div className="form-control">
                  <label>Password</label>
                  <input
                    name="password"
                    className="login-input"
                    value={this.state.password}
                    onChange={this.handleInputChange}
                  />
                </div>
              )}
              <div className="form-control">
                <button type="button" className="login-btn" onClick={this.submitLogin}>
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  renderLoginTemplate = () => {
    if (REACT_APP_SKIP_OTP_LOGIN === "true") {
      return this.renderUsernamePasswordTemplate();
    }
    return (
      <OtpLogin
        qrCode={this.renderQRTemplate()}
        handleLoginSuccess={this.handleLoginSuccess}
        handleSDKIntialize={this.handleSDKIntialize}
      />
    );
  };

  handleMediaClose = (e) => {
    Store.dispatch(SingleChatSelectedMediaReset());
    Store.dispatch(GroupChatSelectedMediaReset());
    this.setState({ isShowPreviewMedia: false });
  };

  // messageInformation component enable and disable
  messageInfoShow = (valueToShowMsgInfo = false) => {
    this.setState({
      showMessageinfo: valueToShowMsgInfo
    });
  };

  /**
   * handleWebChatConnect() method to handle properly connectted with socket.
   */
  handleWebChatConnect = () => {
    let { webChatStatus, hideCallScreen, isShowPreviewMedia } = this.state;
    const {
      SingleChatSelectedMediaData: { data: singleChatSelectedMedia = {} } = {},
      GroupChatSelectedMediaData: { data: groupChatSelectedMedia = {} } = {}
    } = this.props;

    const selectedMedia = singleChatSelectedMedia.jid ? singleChatSelectedMedia : groupChatSelectedMedia;

    const callConnectionDate = JSON.parse(getFromLocalStorageAndDecrypt("call_connection_status"));
    if (callConnectionDate === null || callConnectionDate === undefined) {
      hideCallScreen = false;
    }
    hideCallScreen = hideCallScreen && getFromLocalStorageAndDecrypt("hideCallScreen") === true ? true : false;
    let anotherUser = "";
    if (callConnectionDate && callConnectionDate.from && this.props.showConfrenceData?.data) { // TODO
      if (this.props.showConfrenceData?.data?.callStatusText) {
        callStatus = this.props.showConfrenceData.data.callStatusText;
      }
      if (callConnectionDate.callMode === "onetoone") {
        anotherUser = callConnectionDate.from;
        if (
          callConnectionDate.from.includes("@")
            ? callConnectionDate.from.split("@")[0]
            : callConnectionDate.from === this.props.vcardData?.data.fromUser
        ) {
          anotherUser = callConnectionDate.to;
          anotherUser = anotherUser.includes("@") ? anotherUser.split("@")[0] : anotherUser;
        }
      }
      if (callConnectionDate.callMode === "onetomany") {
        anotherUser =
          callConnectionDate.groupId !== undefined && callConnectionDate.groupId !== null
            ? callConnectionDate.groupId
            : callConnectionDate.from;
        anotherUser = anotherUser.includes("@") ? anotherUser.split("@")[0] : anotherUser;
      }
    }

    let accountDeletedToast = this.state.accountDeletedToast;
    if (accountDeletedToast) {
      setTimeout( () => {
        deleteItemFromLocalStorage("deleteAccount");
        this.setState({
          accountDeletedToast: false
        });
      }, 3000)
    }

    return !webChatStatus ? (
      <div className="container">
        <div className="login-container" id="login-container">
          {this.renderLoginTemplate()}
          { accountDeletedToast && 
            <div className='toast_container'>
                <span>Your MirrorFly account has been deleted.</span>
            </div>
          }
        </div>
      </div>
    ) : (
      <div className="container containerLayout" id="container">
        {this.props.showConfrenceData &&
          this.props.showConfrenceData.data &&
          this.props.showConfrenceData.data.showCalleComponent && (
            <div className={`${(hideCallScreen && "BackToConversion") || ""}`}>
              <CalleScreen
                callStatus={this.props.showConfrenceData.data.callStatusText}
                stopSound={this.props.showConfrenceData.data.stopSound || ""}
                hideCallScreen={this.hideCallScreen}
              />
            </div>
          )}

        {this.props.callIntermediateScreen?.data?.show && (
          <MeetingScreenJoin callData={this.props.callIntermediateScreen?.data} />
        )}

        {this.props.showConfrenceData &&
          this.props.showConfrenceData.data &&
          getFromLocalStorageAndDecrypt("callingComponent") === true && (
            <div className={`${(hideCallScreen && "BackToConversion") || ""}`}>
              <WebCallingLayout
                callStatus={this.props.showConfrenceData.data.callStatusText}
                stopSound={this.props.showConfrenceData.data.stopSound || ""}
                soundPath={this.props.showConfrenceData.data.soundPath || ""}
                hideCallScreen={this.hideCallScreen}
              />
            </div>
          )}
        <Sidebar
          handleConversationSectionDisplay={this.handleConversationSectionDisplay}
          callUserJID={anotherUser}
          callStatus={callStatus}
          handleShowCallScreen={this.handleShowCallScreen}
          callType={(callConnectionDate && callConnectionDate.callType) || ""}
          handlePopupState={this.handlePopupState}
          callMode={(callConnectionDate && callConnectionDate.callMode) || ""}
          handleContactPermissionPopup={this.handleContactPermissionPopup}
        />
        <ConversationSection
          showMessageinfo={this.state.showMessageinfo}
          messageInfoShow={this.messageInfoShow}
          conversationSectionDisplay={this.state.conversationSectionDisplay}
          handleConversationSectionDisplay={this.handleConversationSectionDisplay}
          showonGoingcallDuration={hideCallScreen}
          handleShowCallScreen={this.handleShowCallScreen}
          showCallerName={callConnectionDate && callConnectionDate.from}
          openStatus={this.state.openStatus}
          handlePopupState={this.handlePopupState}
        />
        {isShowPreviewMedia && (
          <WebChatMediaPreview
            jid={selectedMedia.jid}
            chatType={selectedMedia.chatType}
            selectedMessageData={selectedMedia.selectedMessageData}
            handleMediaClose={(e) => this.handleMediaClose(e)}
          />
        )}
        {this.props.showConfrenceData &&
          this.props.showConfrenceData.data &&
          this.props.vCardData &&
          this.props.vCardData.data &&
          this.props.showConfrenceData.data.showComponent && (
            <div className={`connecting webrtc  ${(hideCallScreen && "visible") || ""}`}>
              <Connecting
                jid={this.props.jid}
                fromuser={this.props.vCardData.data.fromuser}
                hideCallScreen={this.hideCallScreen}
              />
            </div>
          )}
        {this.props.showConfrenceData &&
          this.props.showConfrenceData.data &&
          this.props.showConfrenceData.data.showStreamingComponent &&
          callConnectionDate && (
            <div className={`connecting  ${(hideCallScreen && "visible") || ""}`}>
              <WebRtcCall
                showConfrenceDataId={this.props.showConfrenceData.id}
                remoteVideoMuted={this.props.showConfrenceData.data.remoteVideoMuted}
                remoteAudioMuted={this.props.showConfrenceData.data.remoteAudioMuted}
                localVideoMuted={this.props.showConfrenceData.data.localVideoMuted}
                localAudioMuted={this.props.showConfrenceData.data.localAudioMuted}
                hideCallScreen={this.hideCallScreen}
                fromJid={this.props.showConfrenceData.data.fromJid}
                status={this.props.showConfrenceData.data.status}
                localStream={this.props.showConfrenceData.data.localStream}
                remoteStream={this.props.showConfrenceData.data.remoteStream}
              />
            </div>
          )}
        <ToastContainer />
        {(this.props.adminBlockData?.data?.toUserId && (this.props.adminBlockData?.data?.toUserId === this.props.vCardData?.data?.fromUser)) &&
          <BlockedFromApplication />
        }
        {this.state.contactPermissionPopup && !this.props.contactPermission &&
          <ActionInfoPopup
            textActionBtn={"Ok"}
            handleAction={() => this.handleContactPermissionPopup(false)}
            textHeading={"Contact permission"}
            textInfo={this.state.contactPermissionPopupText}
          />
        }
      </div>
    );
  };

  /**
   * handleConversationSectionDisplay() manage view of recent chat or conversatipon page in responsive mode.
   */
  handleConversationSectionDisplay = (status, response = null) => {
    this.setState({
      openStatus: true,
      showMessageinfo: false
    });
    if (!response) return undefined;

    const { recent: { chatType, fromUserId } = {} } = response;
    if (chatType && fromUserId) {
      response.chatType = chatType;
      response.chatId = fromUserId;
      response.chatJid = formatUserIdToJid(fromUserId, chatType);
      return Store.dispatch(ActiveChatAction(response));
    }
    return undefined;
  };

  handlePopupState = (status) => {
    this.setState({
      openStatus: status
    });
  };

  handleUseHere = () => {
    if (this.props.isAppOnline) {
      let currentTabId = getFromSessionStorageAndDecrypt("sessionId");
      encryptAndStoreInLocalStorage("sessionId", currentTabId);
      updateFavicon("");
      if (getFromLocalStorageAndDecrypt("auth_user") !== null) {
        let decryptResponse = getFromLocalStorageAndDecrypt("auth_user");
        this.setState({ webChatStatus: true, newSession: false }, () => {
          resetStoreData();
          this.handleLogin(decryptResponse);
        });
      } else {
        this.setState(
          { webChatStatus: false, loaderStatus: false, newSession: false, connectionStatusLoader: false },
          () => {
            this.handleQRCode();
          }
        );
      }
    } else toast.error(NO_INTERNET_TOAST);
  };

  render() {
    return (
      <>
        {!this.state.newSession ? (
          this.handleWebChatConnect()
        ) : (
          <>
            <div className="popup-wraper">
              <div className="popup-inner">
                <div className="popup-header">
                  <label>{`MirrorFly is open in another window.
                  Click “Use Here” to use MirrorFly in this window.`}</label>
                </div>
                <div className="popup-footer">
                  <button type="button" className="btn-action" name="btn-action" onClick={this.handleUseHere}>
                    {"Use Here"}
                  </button>
                </div>
              </div>
            </div>
            <ToastContainer />
          </>
        )}
      </>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    ConnectionStateData: state.ConnectionStateData,
    messageData: state.messageData,
    showConfrenceData: state.showConfrenceData,
    vCardData: state.vCardData,
    SingleChatSelectedMediaData: state.SingleChatSelectedMediaData,
    GroupChatSelectedMediaData: state.GroupChatSelectedMediaData,
    isAppOnline: state?.appOnlineStatus?.isOnline,
    callIntermediateScreen: state?.callIntermediateScreen,
    contactPermission: state?.contactPermission?.data,
    adminBlockData: state.adminBlockData
  };
};

export default connect(mapStateToProps, null)(Login);
