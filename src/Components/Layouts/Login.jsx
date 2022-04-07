import React from "react";
import { connect } from "react-redux";
import {
  REACT_APP_XMPP_SOCKET_HOST,
  REACT_APP_XMPP_SOCKET_PORT,
  REACT_APP_SSL,
  REACT_APP_ENCRYPT_KEY,
  REACT_APP_API_URL,
  REACT_APP_SOCKETIO_SERVER_HOST,
  CHECK_INTERENT_CONNECTIVITY,
  REACT_APP_LICENSE_KEY,
  REACT_APP_JANUS_URL,
  REACT_APP_TURN_URL,
  REACT_APP_TURN_USERNAME,
  REACT_APP_TURN_PASSWORD,
  REACT_APP_STUN_URL
} from "../processENV";
import { callbacks } from "../callbacks";
import "react-toastify/dist/ReactToastify.css";
import { showConfrence } from "../../Actions/CallAction";
import { GroupChatSelectedMediaReset } from "../../Actions/GroupChatMessageActions";
import { ActiveChatAction, RecentChatAction } from "../../Actions/RecentChatActions";
import { SingleChatSelectedMediaReset } from "../../Actions/SingleChatMessageActions";
import { loader, LoginInfo, NewLogoVector, ScanQRLogo } from "../../assets/images";
import "./Login.scss";
import "../../assets/scss/common.scss";
import "./popup.scss";
import WebChatMediaPreview from "../../Components/WebChat/Conversation/WebChatMediaPreview";
import { logout, setLocalWebsettings } from "../../Helpers/Utility";
import Store from "../../Store";
import config from "../../config";
import SDK from "../SDK";
import CalleScreen from "../WebCall/calleeScreen";
import Connecting from "../WebCall/Connecting";
import WebCallingLayout from "../WebCall/WebCallingLayout";
import ConversationSection from "../WebChat/ConversationSection";
import { decryption, encryption } from "../WebChat/WebChatEncryptDecrypt";
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
  isCurrentSessionActive,
  resetStoreData,
  updateFavicon,
  updateSessionId,
  updateSessionIdInLocalStorage
} from "../../Helpers/Chat/ChatHelper";
import { CHAT_TYPE_GROUP, DEFAULT_TITLE_NAME } from "../../Helpers/Chat/Constant";
import { NO_INTERNET_TOAST } from "../../Helpers/Constants";
import { formatUserIdToJid } from "../../Helpers/Chat/User";
import { getMaxUsersInCall } from "../../Helpers/Call/Call";
import { setGroupParticipantsByGroupId } from "../../Helpers/Chat/Group";
import { StarredMessagesList } from "../../Actions/StarredAction";
import { webSettingLocalAction } from "../../Actions/BrowserAction";

const { helpUrl } = config;
const createHistory = require("history").createBrowserHistory;
export const history = createHistory();
let callStatus = "";

class Login extends React.Component {
  /**
   * WebChatQRCode Constructor <br />
   * Following states in this WebChatQRCode Component.
   * @param { boolean } connectionInitialize Connection Initialize status
   * @param { boolean } loaderStatus To check the loader status
   * @param { boolean } webChatStatus To check the web chat statu login or logout
   *
   */
  constructor(props) {
    super(props);
    this.state = {
      connectionInitialize: false,
      loaderStatus: true,
      webChatStatus: false,
      onLineStatus: true,
      connectionStatusLoader: false,
      conversationSectionDisplay: { display: "none" },
      hideCallScreen: false,
      isShowPreviewMedia: false,
      username: "",
      password: "",
      showLoginForm: false,
      newSession: false,
      openStatus: true,
      isVisibleScroll: false,
      testUrl: "webreact-auto.contus.us",
      showMessageinfo: false
    };
    this.setIntervalTime = 0;
    this.handleQRCode = this.handleQRCode.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    localStorage.setItem("hideCallScreen", false);
    registerWindowEvent();
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

  handleOnStorageChange = () => {
    if (
      sessionStorage.getItem("sessionId") !== null &&
      localStorage.getItem("sessionId") !== sessionStorage.getItem("sessionId") &&
      !this.state.newSession
    ) {
      sessionStorage.removeItem("sessionId");
      this.setState({ newSession: true });
      document.title = DEFAULT_TITLE_NAME;
      updateFavicon("error");
    }

    if (sessionStorage.getItem("sessionId") !== null && localStorage.getItem("auth_user") === null) {
      window.location.reload();
    }
  };

  /**
   * ComponentDidMount is one of the react lifecycle method. <br>
   * In this method to call the SDK.initialize() method.
   */
  componentDidMount() {
    updateSessionIdInLocalStorage();
    this.handleSDKIntialize();
    window.addEventListener("message", this.handleIframeTask);
    window.addEventListener("storage", this.handleOnStorageChange, false);
    browserTab.init();
    browserNotify.init();
  }

  handleShowCallScreen = () => {
    localStorage.setItem("hideCallScreen", false);
    this.setState({ hideCallScreen: false });
  };

  hideCallScreen = () => {
    localStorage.setItem("hideCallScreen", true);
    this.setState({ hideCallScreen: true });
  };

  /**
   * componentDidUpdate is one of the react lifecycle method. <br>
   *
   * @param {object} prevProps
   * @param {object} prevState
   */
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
  }

  /**
   * componentWillUnmount is one of the react lifecycle method. <br>
   * In this method, to removed the setInterval time.
   */
  componentWillUnmount() {
    clearInterval(this.setIntervalTime);
    window.removeEventListener("storage", this.handleOnStorageChange);
  }

  handleSDKIntialize = async () => {
    const initializeObj = {
      xmppSocketHost: REACT_APP_XMPP_SOCKET_HOST,
      xmppSocketPort: Number(REACT_APP_XMPP_SOCKET_PORT),
      ssl: REACT_APP_SSL === "true",
      encryptKey: REACT_APP_ENCRYPT_KEY,
      apiBaseUrl: REACT_APP_API_URL,
      callbackListeners: callbacks,
      signalServer: REACT_APP_SOCKETIO_SERVER_HOST,
      janusUrl: REACT_APP_JANUS_URL,
      licenseKey: REACT_APP_LICENSE_KEY,
      isSandbox: false,
      stunTurnServers: [
        {
          urls: REACT_APP_TURN_URL,
          username: REACT_APP_TURN_USERNAME,
          credential: REACT_APP_TURN_PASSWORD
        },
        {
          urls: REACT_APP_STUN_URL
        }
      ],
      maxUsersIncall: getMaxUsersInCall()
    };
    const response = await SDK.initializeSDK(initializeObj);
    let responseCall = { statusCode: 200 };

    if (response.statusCode === 200 && responseCall.statusCode === 200) {
      if (window.location.hostname === this.state.testUrl) {
        const staticCredential = { username: "918825508012", password: "BPB2M5bkPXNj8F8" };
        this.setState({ webChatStatus: true }, () => {
          this.handleLogin(staticCredential);
        });
        return;
      }
      if (localStorage.getItem("auth_user") !== null) {
        let decryptResponse = decryption("auth_user");

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
    } catch (error) {
      console.log("handleQRCode error: ", error);
    }
  }

  handleLoginSuccess = async (data) => {
    sessionStorage.removeItem("isLogout");
    localStorage.setItem("recordingStatus", true);
    encryption("auth_user", data);
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
    await SDK.getFriendsList();
    const groupListRes = await SDK.getGroupsList();
    if (groupListRes && groupListRes.statusCode === 200) {
      encryption("groupslist_data", groupListRes.data);
      groupListRes.data.map(async (group) => {
        const groupJid = formatUserIdToJid(group.groupId, CHAT_TYPE_GROUP);
        const groupPartRes = await SDK.getGroupParticipants(groupJid);
        if (groupPartRes && groupPartRes.statusCode === 200) {
          setGroupParticipantsByGroupId(groupJid, groupPartRes.data.participants);
        }
      });
      Store.dispatch(GroupsDataAction(groupListRes.data));
    }

    const userSettings = await SDK.getUserSettings();
    Store.dispatch(webSettingLocalAction({ "isEnableArchived" : userSettings?.data?.archive === 0 ? false : true }));
    setLocalWebsettings("archive", userSettings?.data?.archive === 0 ? false : true);

    setTimeout(() => {
      this.setState({ webChatStatus: true }, async () => {
        const recentChatsRes = await SDK.getRecentChats();
        if (recentChatsRes && recentChatsRes.statusCode === 200) {
          Store.dispatch(RecentChatAction(recentChatsRes.data));
        }
        const favResult = await SDK.getAllFavouriteMessages();
        Store.dispatch(StarredMessagesList(favResult.data));
      });
    }, 100);
  };

  async handleLoginToken(data) {
    let resource = SDK.getCurrentUserJid();
    if (resource.statusCode === 200) encryption("loggedInUserJidWithResource", resource.userJid);
    await SDK.getUserToken(data.username, data.password);
    this.handleLoginSuccess(data);
  }

  /**
   * handleLogin()
   * To call the SDK.login() method with user name and password.
   */
  handleLogin(response) {
    let loginResponse = {
      username: response.username,
      password: response.password,
      type: "web"
    };
    let tabId = Date.now();
    localStorage.setItem("connectingId", tabId);
    SDK.login(response.username, response.password)
      .then(async (res) => {
        if (res.statusCode === 200) {
          updateSessionId(tabId);
          this.handleLoginToken(loginResponse);
          return;
        }
        throw new Error("login Failed");
      })
      .catch((error) => {
        console.log("handleLogin error, ", error);
        localStorage.removeItem("auth_user");
        this.setState({ webChatStatus: false, loaderStatus: false });
      });
  }

  handleInputChange = (evt) => {
    const { name, value } = evt.target;
    this.setState((prevState) => ({ ...prevState, [name]: value }));
  };

  submitLogin = () => {
    const obj = {
      username: this.state.username,
      password: this.state.password
    };
    if (this.state.username && this.state.password) {
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

  showLoginFormRender = () => {
    return (
      <div className="qr-image">
        <img src={ScanQRLogo} alt="scan-logo" id="qr-logo" />
        {this.state.loaderStatus ? (
          // <img className="scanLoader" src={loader} alt="loader" />
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

  /**
   * handleLoaderQRCode() method to handle the loader or display QR Code div element.
   */
  handleLoaderQRCode = () => {
    return (
      <>
        <div className="mirrorfly">
          <div className="login-wrapper">
            <div className="login-content">
              <div className="left-section">
                <div className="logo">
                  <img src={NewLogoVector} alt="logo" />
                  <h2>Scan with MirrorFly app to Login</h2>
                  <ul>
                    <li>
                      1. Open <span>MirrorFly</span> on your phone.
                    </li>
                    <li>
                      2. Tap <span>Menu</span>{" "}
                      <i className="iconOption">
                        <LoginInfo />
                      </i>{" "}
                      or <span className="ios-icon">+</span> and select <span>Web.</span>
                    </li>
                    <li>
                      3. Scan the <span>QR Code </span> and get <span>Logged in.</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="right-section">
                {!this.state.showLoginForm ? (
                  this.showLoginFormRender()
                ) : (
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
                    <div className="form-control">
                      <label>Password</label>
                      <input
                        name="password"
                        className="login-input"
                        value={this.state.password}
                        onChange={this.handleInputChange}
                      />
                    </div>
                    <div className="form-control">
                      <button type="button" className="login-btn" onClick={this.submitLogin}>
                        Login
                      </button>
                    </div>
                  </form>
                )}
                <a href={helpUrl} target="_blank" rel="noopener noreferrer">
                  Need help to get started?
                </a>
              </div>
            </div>
          </div>
        </div>
      </>
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

    const callConnectionDate = JSON.parse(localStorage.getItem("call_connection_status"));
    if (callConnectionDate === null || callConnectionDate === undefined) {
      hideCallScreen = false;
    }
    hideCallScreen = hideCallScreen && localStorage.getItem("hideCallScreen") === "true" ? true : false;
    let anotherUser = "";
    if (callConnectionDate && callConnectionDate.from) {
      if (this.props.showConfrenceData.data.callStatusText) {
        callStatus = this.props.showConfrenceData.data.callStatusText;
      }
      if (callConnectionDate.callMode === "onetoone") {
        anotherUser = callConnectionDate.from;
        let vcardData = decryption("vcard_data");
        if (
          callConnectionDate.from.includes("@")
            ? callConnectionDate.from.split("@")[0]
            : callConnectionDate.from === vcardData.fromUser
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
    return !webChatStatus ? (
      <div className="container">
        <div className="login-container" id="login-container">
          {this.handleLoaderQRCode()}
        </div>
      </div>
    ) : (
      <div className="container" id="container">
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

        {this.props.showConfrenceData &&
          this.props.showConfrenceData.data &&
          localStorage.getItem("callingComponent") === "true" && (
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
      </div>
    );
  };

  /**
   * handleConversationSectionDisplay() manage view of recent chat or conversatipon page in responsive mode.
   */
  handleConversationSectionDisplay = (status, response = null) => {
    this.setState({
      openStatus: true,
      isVisibleScroll: false,
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
      let currentTabId = sessionStorage.getItem("sessionId");
      localStorage.setItem("sessionId", currentTabId);
      updateFavicon("");
      if (localStorage.getItem("auth_user") !== null) {
        let decryptResponse = decryption("auth_user");
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
    isAppOnline: state?.appOnlineStatus?.isOnline
  };
};

export default connect(mapStateToProps, null)(Login);
