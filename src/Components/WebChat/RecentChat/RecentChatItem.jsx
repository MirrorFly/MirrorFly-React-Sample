import React, { Component, Fragment } from "react";
import renderHTML from "react-render-html";
import { connect } from "react-redux";
import _get from "lodash/get";
import { chatResetMessage } from "../../../Actions/GroupChatMessageActions";
import { UnreadCountDelete, UnreadCountUpdate } from "../../../Actions/UnreadCount";
import {
  Audio2,
  Camera,
  Contact,
  DocumentIcon,
  Location,
  VideoIcon2,
  RecentVideoCall,
  RecentAudioCall,
  ChatAudioRecorderDark,
  RecentCallHangup,
  AudioOn,
  AudioOff,
  RecentDeletedMessage,
  ChatMute,
  DropdownArrow,
  IconMissedCallAudio,
  IconMissedCallVideo
} from "../../../assets/images";
import { groupstatus } from "../../../Helpers/Chat/RecentChat";
import IndexedDb from "../../../Helpers/IndexedDb";
import {
  getFormatPhoneNumber,
  getFormattedRecentChatText,
  getHighlightedText,
  capitalizeFirstLetter,
  capitalizeTxt,
  sendNotification,
  blockOfflineAction,
  getArchiveSetting,
  shouldHideNotification
} from "../../../Helpers/Utility";
import Store from "../../../Store";
import { getAvatarImage, groupAvatar } from "../Common/Avatarbase64";
import ProfileImage from "../Common/ProfileImage";
import { convertUTCTOLocalTimeStamp, formatChatDateTime } from "../WebChatTimeStamp";
import Message from "./Message";
import {
  formatUserIdToJid,
  getContactNameFromRoster,
  getDataFromRoster,
  handleMentionedUser,
  initialNameHandle,
  isLocalUser
} from "../../../Helpers/Chat/User";
import {
  GROUP_CHAT_PROFILE_UPDATED_NOTIFY,
  THIS_MESSAGE_WAS_DELETED,
  YOU_DELETED_THIS_MESSAGE
} from "../../../Helpers/Chat/Constant";
import {
  notificationMessageType,
  isActiveConversationUserOrGroup,
  isTextMessage,
  isGroupChat,
  getActiveConversationUserOrGroupId
} from "../../../Helpers/Chat/ChatHelper";
import browserTab from "../../../Helpers/Browser/BrowserTab";
import { isMuteAudioAction } from "../../../Actions/CallAction";
import SDK from "../../SDK";
import { muteLocalAudio } from "../../callbacks";
import { disconnectCallConnection } from "../../../Helpers/Call/Call";
import { Archived, IconPinChat, IconUnarchive } from "../Setting/images";
import { toast } from "react-toastify";
import { updateArchiveStatusRecentChat } from "../../../Actions/RecentChatActions";
import OutsideClickHandler from "react-outside-click-handler";
import Modal from "../Common/Modal";
import browserNotify from "../../../Helpers/Browser/BrowserNotify";
import {getFromLocalStorageAndDecrypt} from "../WebChatEncryptDecrypt";


const allowedIds = ["recent-menu", "recent-menu-archive", "recent-menu-archive-icon", "recent-menu-archive-text"];
class RecentChatItem extends Component {
  constructor(props = {}) {
    super(props);
    this.state = {
      image: null,
      showModal: false,
      recentDrop: false,
      pinChat: false,
      archiveChat: false,
      isArchive: true,
      needToImplement: false
    };
    this.localDb = new IndexedDb();
    this.audio = new Audio("sounds/busySignal.mp3");
  }
  getContactName = () => {
    const { item = {} } = this.props;
    return getContactNameFromRoster(item.roster);
  };

  handleToggleMute = async () => {
    const { callLogData: { callAudioMute = false } = {} } = this.props;
    const audioMuteResult = await SDK.muteAudio(!callAudioMute);
    if (audioMuteResult?.statusCode === 200) {
      muteLocalAudio(!callAudioMute);
      Store.dispatch(isMuteAudioAction(!callAudioMute));
    }
  };

  stopAudio() {
    this.audio.loop = false;
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  handleToggleHangUpCall = () => {
    this.stopAudio();
    disconnectCallConnection(); //hangUp calls
  };

  formatMessage = (msgBody, msgType) => {
    let message = msgBody.message;
    if (["image", "video", "audio", "file", "contact", "location"].indexOf(msgType) > -1) {
      // Media type icon mapping
      const icons = {
        image: (
          <i className="chat-camera">
            <Camera />
          </i>
        ),
        video: (
          <i className="chat-video">
            <VideoIcon2 />
          </i>
        ),
        audio: (
          <i className={` ${_get(msgBody, "media.audioType", "") !== "recording" ? "audio" : "mic"} chat-audio`}>
            {_get(msgBody, "media.audioType", "") !== "recording" ? <Audio2 /> : <ChatAudioRecorderDark />}
          </i>
        ),
        file: (
          <i className="chat-docu">
            <DocumentIcon />
          </i>
        ),
        contact: (
          <i className="chat-contact">
            <Contact />
          </i>
        ),
        location: (
          <i className="chat-location">
            <Location />
          </i>
        ),
        missedCallAudio: (
          <i className="chat-missedcall">
            <IconMissedCallAudio />
          </i>
        ),
        missedCallVideo: (
          <i className="chat-missedcall">
            <IconMissedCallVideo />
          </i>
        ),

      };
      message = msgBody && typeof msgBody === "object" && msgBody.media ? msgBody.media.caption : undefined;
      message = message || (msgType === "image" ? "Photo" : capitalizeFirstLetter(msgType));
      message = renderHTML(getFormattedRecentChatText(message));
      return (
        <>
          {icons[msgType] || ""} {message}
        </>
      );
      }
    return renderHTML(handleMentionedUser(getFormattedRecentChatText(message), msgBody.mentionedUsersIds, false));
  };

  getDeletedText = (publisherId) =>
    isLocalUser(publisherId) ? (
      <span className="text-italic innerSpan">{YOU_DELETED_THIS_MESSAGE}</span>
    ) : (
      <span className="text-italic innerSpan">{THIS_MESSAGE_WAS_DELETED}</span>
    );

  /**
   * handleLastMessage function is to handle the last message publisher name along with last message.
   */
  handleLastMessage = (data) => {
    const { vCardData: { data: { fromUser } = {} } = {} } = this.props;
    const {
      recent: { chatType, publisherId, msgBody, msgType }
    } = data;

    const conditionArray = [{ condition: "groupchat" }, { condition: "broadcast" }];
    const condionCheck = conditionArray.some((ele) => ele.condition === chatType);
    if (condionCheck) {
      if (publisherId !== fromUser) {
        const senderDetails = getDataFromRoster(publisherId);

        if (senderDetails) {
          const lastMessageBy = getContactNameFromRoster(senderDetails);
          const lastMessage = this.formatMessage(msgBody, msgType);
          return (
            <Fragment>
              {lastMessageBy && <span className="groupLastMessageBy">{lastMessageBy}: </span>}
              {lastMessage && (
                <span className="groupLastMessage">
                  {_get(this.props, "item.recent.deleteStatus", 0) === 1 ? THIS_MESSAGE_WAS_DELETED : lastMessage}
                </span>
              )}
            </Fragment>
          );
        }
        const unknownPublisher =
          senderDetails && senderDetails.mobileNumber ? getFormatPhoneNumber(senderDetails.mobileNumber) : publisherId;
        return (
          <Fragment>
            {unknownPublisher && <span className="groupLastMessageBy">{unknownPublisher}: </span>}
            <span className="groupLastMessage">{this.formatMessage(msgBody, msgType)} </span>
          </Fragment>
        );
      }
    }
    return _get(this.props, "item.recent.deleteStatus", 0) === 1 ? (
      <>
        <i className="recallMsgIcon">
          <RecentDeletedMessage />
        </i>
        {this.getDeletedText(publisherId)}
      </>
    ) : (
      this.formatMessage(msgBody, msgType)
    );
  };

  groupNotification = (item) => {
    const {
      rosterData: { data }
    } = this.props;
    const {
      recent: { publisherId, userId, profileUpdatedStatus, chatType }
    } = item;
    return groupstatus(publisherId, userId, profileUpdatedStatus, data, chatType);
  };

  /**
   * handleMessageType method to handle the last message type icon in recent chat section.
   * @param {object} item
   */
  handleMessageType = (item) => {
    if (item.recent.msgType === GROUP_CHAT_PROFILE_UPDATED_NOTIFY) {
      return this.groupNotification(item);
    }
    switch (item.recent.msgType) {
      case "text":
      case "auto_text":
      case "image":
      case "video":
      case "audio":
      case "file":
      case "contact":
      case "location":
        return this.handleLastMessage(item);
      default:
        return null;
    }
  };

  /**
   * handleTimeStamp() method to manage the message time format.
   * @param {object} response
   */
  handleTimeStamp(time) {
    return formatChatDateTime(convertUTCTOLocalTimeStamp(time), "recent-chat");
  }

  addActiveClass = (element) => {
    const activeElement = element.target.closest("ul").querySelector("li.active");
    activeElement && activeElement.classList.remove("active");
    element.target.closest("li").classList.add("active");
  };

  /**
   * clickListener() method to dispatch the action with contact info payload.
   * In this method, to perform display the conversation header section.
   * @param {object} event
   * @param {object} response
   */
  clickListener = (e, response) => {
    const { recent: { fromUserId } = {} } = response;
    this.props.handlePopupState(true);
    const activeClass = e.target?.closest("li")?.classList?.contains("active");
    const recordingStatus = getFromLocalStorageAndDecrypt("recordingStatus");
    if (activeClass || recordingStatus === false) return;
    this.addActiveClass(e);
    let status = "block";

    // When user switch chat clean it
    // Store.dispatch(clearChatSeenPendingMsg());
    Store.dispatch(chatResetMessage())
      .then(() => Store.dispatch(UnreadCountDelete({ fromUserId })))
      .then(() => this.props.handleOnclick(status, response));
  };

  componentDidMount() {
    const { item: { roster: { image, groupImage } = {} } = {} } = this.props;
    this.setState(
      {
        image: image || groupImage
      },
      () => {
        this.setUnreadCount();
      }
    );
  }

  setUnreadCount = () => {
    const { item: { recent: { unreadCount, fromUserId: msgfrom, chatType } } = {} } = this.props;
    if (
      !unreadCount ||
      parseInt(unreadCount) === 0 ||
      (isGroupChat(chatType) &&
        (!this.props?.item?.roster ||
          (typeof this.props.item.roster === "object" && Object.keys(this.props.item.roster).length === 0)))
    )
      return;
    Store.dispatch(UnreadCountUpdate({ count: parseInt(unreadCount), fromUserId: msgfrom, isRefresh: true }));
  };

  componentDidUpdate(prevProps) {
    const {
      item: {
        recent: { fromUserId, publisherId, chatType, muteStatus, archiveStatus = 0 },
        roster: { image } = {}
      } = {},
      messageId,
      messageData
    } = this.props;
    const { data: { msgType, msgId, msgBody } = {} } = messageData || {};
    
    if (msgType && msgType === "carbonSentSeen" && prevProps.messageData.id !== messageData.id && msgId === messageId) {
      Store.dispatch(UnreadCountDelete({ fromUserId }));
    }

    if (
      this.props.refreshUnreadCount !== prevProps.refreshUnreadCount &&
      this.props.refreshUnreadCount &&
      getActiveConversationUserOrGroupId() !== fromUserId
    ) {
      this.setUnreadCount();
    }
    
    if (
      (this.props?.item?.recent?.msgType === GROUP_CHAT_PROFILE_UPDATED_NOTIFY &&
        this.props?.item?.recent?.timestamp !== prevProps?.item?.recent?.timestamp) ||
      prevProps?.messageId !== messageId
    ) {

      const messageFromUser = this.props?.vCardData?.data?.fromUser;
      if (!isLocalUser(publisherId)) {
        const webSettings = getFromLocalStorageAndDecrypt("websettings");
        let parserLocalStorage = webSettings ? JSON.parse(webSettings) : {};
        const { Notifications = true } = parserLocalStorage;

        if (!isActiveConversationUserOrGroup(fromUserId, chatType) || !browserTab.isVisible()) {
          const recentChat = this.props?.item;
          if (msgType && typeof msgbody === "string" && notificationMessageType.indexOf(msgBody) > -1) {
            const {
              recent: { NotificationTo }
            } = recentChat;
            if (NotificationTo !== messageFromUser && msgBody === "2") {
              return;
            }
            Notifications && muteStatus === 0 && archiveStatus !== 1 && this.createPushNotification(recentChat);
          } else {
            Notifications && muteStatus === 0 && archiveStatus !== 1 && this.createPushNotification(recentChat);
          }
        }
      }
      return;
    }

    if (prevProps?.item?.roster?.image !== image) {
      this.setState({
        image: image
      });
    }
  }

  getsenderName = (contactDetails) => {
    return getContactNameFromRoster(contactDetails);
  };

  createPushNotification = (recentChat) => {
    try {
      const {
        recent: {
          chatType,
          msgBody: { message_type, message },
          publisherId,
          fromUserId
        },
        roster: { image, groupImage }
      } = recentChat;
      const messageBody = isTextMessage(message_type) ? message : `${capitalizeTxt(message_type || "")}`;
      let updateMessage = message_type ? messageBody : this.handleMessageType(recentChat);
      let updateDisplayName, imageToken;

      if (chatType === "chat") {
        updateDisplayName = this.getsenderName(recentChat.roster);
        imageToken = image;
      } else {
        updateDisplayName = this.getContactName();
        imageToken = groupImage;
        const senderName = getContactNameFromRoster(getDataFromRoster(publisherId)) || publisherId;
        if (message_type) updateMessage = `${senderName}: ${updateMessage}`;
      }

      const {
        unreadCountData: { unreadDataObj }
      } = this.props;
      let totalChats = 0;
      let totalCounts = 0;
      Object.entries(unreadDataObj).map(item => {
        let count = item[1].count;
        totalChats++;
        totalCounts = totalCounts + count;
      })
      if (shouldHideNotification() && browserNotify.isPageHidden) {
        updateDisplayName = "You have " + totalChats +" new chat" + ((totalChats > 1) ? "s" : "");
        updateMessage = "Total " + totalCounts + " unread message" + ((totalCounts > 1) ? "s" : "");
      }
      this.localDb
        .getImageByKey(imageToken, "profileimages")
        .then((blob) => {
          let blobUrl = window.URL.createObjectURL(blob);
          if (shouldHideNotification() && browserNotify.isPageHidden) {
            blobUrl = "";
          }
          sendNotification(updateDisplayName, blobUrl, updateMessage, fromUserId);
        })
        .catch((err) => {
          let avatarImage = chatType === "chat" ? getAvatarImage : groupAvatar;
          if (shouldHideNotification() && browserNotify.isPageHidden) {
            avatarImage = "";
          }
          sendNotification(updateDisplayName, avatarImage, updateMessage, fromUserId);
        });
    } catch (error) { }
  };

  shouldComponentUpdate(nextProps) {
    const {
      unreadCountData: { id, activeUser },
      item: { recent: { msgfrom } = {} }
    } = this.props;
    if (id && nextProps.unreadCountData.id !== id && msgfrom !== activeUser.msgfrom) {
      return false;
    }
    return true;
  }

  handleDrop = () => {
    const currentState = this.state.recentDrop;
    this.setState({
      recentDrop: !currentState
    });
  };

  handleDropClose = () => {
    this.setState({
      recentDrop: false
    });
  };

  handleArchivedChat = async (fromUserId, chatType, archiveStatus) => {
    if (blockOfflineAction()) return;
    this.setState({ recentDrop: false });
    const isArchived = archiveStatus === 0;
    const result = await SDK.updateArchiveChat(formatUserIdToJid(fromUserId, chatType), isArchived);
    if (result?.statusCode === 200) {
      const dispatchData = {
        fromUserId: fromUserId,
        isArchived: isArchived
      };
      Store.dispatch(updateArchiveStatusRecentChat(dispatchData));
      toast.success(isArchived ? "Chat archived" : "Chat unarchived");
    }
  };

  handlePinChat = () => {
    if (blockOfflineAction()) return;
    this.setState(
      (prevState) => ({
        recentDrop: false,
        pinChat: !prevState.pinChat
      }),
      () => {
        toast.success(this.state.pinChat === false ? "Pinned" : "Unpinned");
      }
    );
  };

  handleRecentChatClick = (e, item) => {
    if (item?.recent?.chatType === "groupchat") {
      const groupData = this.props.groupsData?.data?.find((ele) => ele.groupId === item?.roster?.groupId);
      if (groupData?.isAdminBlocked) {
        this.setState({ showModal: true });
        return
      }
    }
    this.clickListener(e, item);
  }

  render() {
    const {
      item,
      searchTerm,
      vCardData,
      messageId,
      callUserJID,
      hidden,
      callStatus,
      enableDropDown = false,
      isAdminBlocked = false
    } = this.props;
    const {
      item: { roster: { image, groupImage } = {} } = {},
      callLogData: { callAudioMute = false } = {},
      pageType = ""
    } = this.props;
    const {
      roster: { groupId, emailId, userId },
      recent: { chatType, createdAt, msgStatus, fromUserId, msgType, deleteStatus, muteStatus, archiveStatus } = {}
    } = item;
    const lastMessage = this.handleMessageType(item);
    const messageDeliveryTime = (createdAt && this.handleTimeStamp(createdAt)) || null;

    const contactName = this.getContactName();
    const iniTail = initialNameHandle(item.roster, contactName);
    const hightlightText = contactName ? getHighlightedText(contactName, searchTerm) : fromUserId;
    const token = getFromLocalStorageAndDecrypt("token");
    if (chatType === "groupchat" && !groupId) return null;

    let selectedRoster = this.props.selectedRoster;
    let selectedJid = "";

    if (selectedRoster && selectedRoster.data && selectedRoster.data.roster) {
      selectedJid = selectedRoster.data.roster.userId;
      if (selectedJid === undefined) {
        selectedJid = selectedRoster.data.roster.groupId;
      }
    }
    const {
      unreadCountData: { unreadDataObj }
    } = this.props;
    const unreadCount = (unreadDataObj[fromUserId] && unreadDataObj[fromUserId].count) || 0;
    const ongoingCallDisplayText =
      "Ongoing " +
      (this.props.callMode && this.props.callMode === "onetomany" ? "group " : " ") +
      this.props.callType +
      " call…";

    const activeClass = userId ? userId : groupId;
    const { recentDrop, pinChat, archiveChat, showModal } = this.state;
    const isPermanentArchvie = getArchiveSetting();

    return (
      <Fragment>
        <li
          style={{ display: hidden ? "none" : "" }}
          className={`chat-list-li  ${pageType ? "recentLiCustom" : ""} ${activeClass === selectedJid ? "active" : ""
            } ${recentDrop ? "set-top" : ""} ${fromUserId === callUserJID ? " activeCall" : ""} `}
          // className={`chat-list-li ${(msgfrom == callUserJID) ? '' : ''}`}
          id="chat-list-id"
          data-name="list"
          data-chat-id={fromUserId}
          ref={(event) => (this.listElement = event)}
          onClick={(e) => {
            if (allowedIds.includes(e.target.id)) return;
            this.handleRecentChatClick(e, item)
          }}
        >
          <ProfileImage
            chatType={chatType}
            userToken={token}
            userId={userId || groupId}
            temporary={false}
            imageToken={isAdminBlocked ? "" : image || groupImage}
            emailId={emailId}
            name={iniTail}
          />
          <div className="recentchats">
            <div className="recent-username-block">
              <div className="recent-username">
                <div className="username">
                  <h3 title={contactName}>{hightlightText}</h3>
                </div>
              </div>
              {lastMessage && (
                <span className={unreadCount && parseInt(unreadCount) !== 0 ? "messagetime-plus" : "messagetime"}>
                  {messageDeliveryTime}
                </span>
              )}
            </div>
            <div className="recent-message-block">
              {fromUserId === callUserJID && (
                <>
                  <div className="iconOnGoingCall" onClick={this.props.handleShowCallScreen}>
                    {this.props.callType === "audio" ? (
                      <i className="iconAudioCall">
                        <RecentAudioCall />
                      </i>
                    ) : (
                      <i className="iconvideoCall">
                        <RecentVideoCall />
                      </i>
                    )}
                  </div>
                  <span className="callDetails" onClick={this.props.handleShowCallScreen}>
                    {ongoingCallDisplayText}
                  </span>
                </>
              )}
              <Message
                msgStatus={msgStatus}
                lastMessage={lastMessage}
                messageId={messageId}
                fromUserId={fromUserId}
                chatUserType={chatType}
                msgType={msgType}
                publisherId={item.recent.publisherId}
                fromUser={vCardData.data.fromUser}
                deleteStatus={deleteStatus}
              />
              <div className="recent-message-icon">
                {((muteStatus === 1 && pageType === "recent") ||
                  (muteStatus === 1 && pageType === "archive" && !isPermanentArchvie)) && (
                    <i className="MuteChat">
                      <ChatMute />
                    </i>
                  )}
                {pinChat && (
                  <i className="pinChat">
                    <IconPinChat style={{ color: "#2698F9" }} />
                  </i>
                )}
                {parseInt(unreadCount) !== 0 && (
                  <p className="notifi">{parseInt(unreadCount) > 99 ? "99+" : unreadCount}</p>
                )}
                {archiveStatus === 1 && searchTerm && <span className="recent-badge">Archived</span>}
                {enableDropDown && (fromUserId !== callUserJID) && (
                  <span
                    style={{
                      width: recentDrop ? "1.5em" : "0",
                      height: recentDrop ? "auto" : "0"
                    }}
                    className="recentMenu"
                  >
                    <div className="recentMenuOverlay" id="recent-menu" onClick={this.handleDrop}></div>
                    <DropdownArrow style={{ fill: `${recentDrop ? "#2698F9" : "#C6CBD8"}` }} />
                  </span>
                )}
              </div>
            </div>
            <div className="recentDrop">
              {recentDrop && (
                <OutsideClickHandler onOutsideClick={() => this.handleDropClose()}>
                  <ul style={{ padding: 0 }} className={`menu-dropdown open`}>
                    <li
                      onClick={() => this.handleArchivedChat(fromUserId, chatType, archiveStatus)}
                      className="ArchiveChat"
                      title={archiveChat ? "Archived Chat" : "Unarchived Chat"}
                      id="recent-menu-archive"
                    >
                      <i id="recent-menu-archive-icon">{archiveStatus === 0 ? <Archived /> : <IconUnarchive />}</i>
                      <span id="recent-menu-archive-text">
                        {archiveStatus === 0 ? "Archive chat" : "Unarchive chat"}
                      </span>
                    </li>
                    {pinChat && (
                      <li onClick={this.handlePinChat} className="Unpinchat" title={pinChat ? "" : "Pin Chat"}>
                        <i>
                          <IconPinChat />
                        </i>
                        <span>{pinChat ? "Pin chat" : "Unpin chat"}</span>
                      </li>
                    )}
                  </ul>
                </OutsideClickHandler>
              )}
            </div>
          </div>
          {fromUserId === callUserJID && (
            <div className="CallAction">
              {callStatus && callStatus.toLowerCase() === "connected" && (
                <i onClick={this.handleToggleMute} title="Mute/Unmute" className={callAudioMute ? "Mute" : ""}>
                  {callAudioMute ? <AudioOff /> : <AudioOn />}
                </i>
              )}
              <i title="Hangup" className="Hangup" onClick={this.handleToggleHangUpCall}>
                <RecentCallHangup />
              </i>
            </div>
          )}
        </li>
        {(showModal) &&
          <Modal containerId='container'>
            <div className="popup-wrapper BlockedPopUp">
              <div className="popup-container">
                <div className="popup-container-inner" style={{ maxWidth: "23em" }}>
                  <div className="popup-label"><label>{"This group is no longer available"}</label></div>
                  <div className="popup-noteinfo">
                    <button onClick={() => this.setState({ showModal: false })}
                      type="button"
                      name="btn-action"
                      className="popup btn-action danger"
                    >
                      {"OK"}</button>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        }
      </Fragment >
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    vCardData: state.vCardData,
    rosterData: state.rosterData,
    blockedContact: state.blockedContact,
    unreadCountData: state.unreadCountData,
    selectedRoster: state.activeChatData,
    contactsWhoBlockedMe: state.contactsWhoBlockedMe,
    groupsData: state.groupsData,
    callLogData: state.callLogData
  };
};
export default connect(mapStateToProps, null)(RecentChatItem);
