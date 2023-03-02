import React, { Component } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { connect } from "react-redux";
import uuidv4 from "uuid/v4";
import { popUpState, saveMessageContent } from "../../../Actions/ConversationAction";
import { Attachment, CameraIcon, SendMessage } from "../../../assets/images";
import Config from "../../../config";
import MediaPreview from "../../WebChat/MediaPreview";
import AudioRecorder from "../Common/AudioRecorder";
import Modal from "../Common/Modal";
import { Emoji } from "../Common/Emoji";
import Attachement from "./Templates/Common/Attachement";
import ContentEditable from "./Templates/Common/ContentEditable";
import ReplyToMessage from "./Templates/SendMessage/ReplyToMessage";
import { CAMERA_PERMISSION_DENIED, PERMISSION_DENIED, REACT_APP_XMPP_SOCKET_HOST } from "../../processENV";
import SDK from "../../SDK";
import { setCaretPosition } from "../../../Helpers/Chat/ContentEditableEle";
import Camera from "../Camera";
import { getCameraPermission } from "./Templates/Common/Media";
import { TYPE_DELAY_TIME } from "../../../Helpers/Constants";
import { blockOfflineMsgAction, isBoxedLayoutEnabled } from "../../../Helpers/Utility";
import { get as _get } from "lodash";
import Store from "../../../Store";
import { UpdateTypedMessage } from "../../../Actions/ChatHistory";
import { encryptAndStoreInLocalStorage } from "../WebChatEncryptDecrypt";
import MentionUserList from "./Templates/Common/MentionUserList";
import { getUserDetails } from "../../../Helpers/Chat/User";
function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

var typing = false,
  lastTypingTime = 0;
class WebChatMessagesComposing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showEmoji: false,
      typingMessage: "",
      typingMessageOriginal: "",
      showPreview: false,
      selectedSlide: 0,
      seletedFiles: {},
      showAttachement: false,
      recordingStatus: true,
      showCamera: false,
      cameraPermission: 0,
      featuresAvailable: {},
      mentionedData: {},
      mentionedUsersIds: []
    };
    this.position = 0;
    this.timeout = 0;
    this.gonetimeout = 0;
    this.selectedText = null;
    encryptAndStoreInLocalStorage("recordingStatus", true);
    this.cameraPermissionTracks = [];
  }

  componentDidMount() {
    const messageContent = document.getElementById("typingContainer");
    messageContent && messageContent.focus();

    const { chatId = "" } = _get(this.props, "activeChatData.data", "");
    if (chatId) {
      const { typedMessage = "" } = this.props?.chatConversationHistory?.data[chatId] || {};
      const { featureStateData } = this.props;
      this.setState({featuresAvailable: featureStateData})
      this.setState(
        {
          typingMessage: typedMessage
        },
        () => {
          const msgContent = document.getElementById("typingContainer");
          msgContent && this.placeCaretAtEnd(msgContent);
        }
      );
    }
  }

  placeCaretAtEnd = (el) => {
    el.focus();
    if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
      var range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
      var textRange = document.body.createTextRange();
      textRange.moveToElementText(el);
      textRange.collapse(false);
      textRange.select();
    }
  };

  componentDidUpdate(prevProps = {}) {
    const { sendMessgeType, dragOnContainer: { draggedId = "" } = {} } = this.props;
    if (draggedId && prevProps?.dragOnContainer?.draggedId !== draggedId) {
      this.setState({
        showPreview: true
      });
      return;
    }
    const messageContent = document.getElementById("typingContainer");
    if (prevProps.sendMessgeType !== sendMessgeType) {
      messageContent && this.placeCaretAtEnd(messageContent);
      return;
    }

    const { chatId = "" } = _get(this.props, "activeChatData.data", {});
    const { chatId: prevChatId = "" } = _get(prevProps, "activeChatData.data", {});

    if (prevChatId !== chatId) {
      typing = false;
      clearTimeout(this.timeout);
      if (messageContent && prevChatId) {
        if (prevProps.chatType === "groupchat" || prevProps.chatType === "chat") {
          const prevJid = this.getJid(prevProps.chatType, prevChatId);
          this.goneStatus(prevProps.chatType, prevJid);
        }
      }

      const { typedMessage = "" } = this.props.chatConversationHistory.data[chatId] || {};
      this.setState(
        {
          typingMessage: typedMessage,
          showPreview: false,
          showCamera: false
        },
        () => {
          messageContent && this.placeCaretAtEnd(messageContent);
        }
      );
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  handleMessage = (event = {}) => {
    const { value = "" } = _get(event, "target", {});
    let temp = document.createElement("div");
    temp.innerHTML = value;
    let mentionedUiElements = temp.getElementsByClassName("mentioned");
    Array.from(mentionedUiElements).forEach((e) => {
      e.innerHTML = "@[?]"
    });
    let typingMessageOriginal = temp.textContent || temp.innerText;
    // Here '\n' compare with string length 1 instead of 2
    // Because when we use shift+enter to go next line, this '\n'
    // consider as single text not two chars. That's when value length 1 &
    // value is '\n', set empty data to typingMessage to display the mic button
    // instead of send message button
    this.setState(
      {
        typingMessage:
          (this.state.typingMessage.length === 0 && (value.trim().length === 0 || value === "&nbsp;")) ||
            (value.length === 1 && value === "\n")
            ? ""
            : value,
        typingMessageOriginal: typingMessageOriginal
      },
      () => {
        Store.dispatch(UpdateTypedMessage({ chatId: this.props.jid, message: this.state.typingMessage }));
      }
    );
  };

  handleEmojiText = (emojiObject) => {
    
    const messageContent = document.getElementById("typingContainer");
    let position = this.position;
    let text = "";
    // When user select all the text & choose emoji means,
    // Need to replace the emoji with existing content.
    // That's why below we check condition, selectedText & current state typingMessage is equal
    // Need to clear other content message & enter only the emoji
    if (this.selectedText === this.state.typingMessage) {
      text = emojiObject;
      position = emojiObject.length;
    } else {
      const start = messageContent?.innerHTML?.substring(0, this.position);
      const end = messageContent?.innerHTML?.substring(this.position);
      text = start + emojiObject + end;
      position = this.position + _get(emojiObject, "length", 0);
    }
    this.setState(
      {
        typingMessage: text
      },
      () => {
        this.delay();
        this.setCursorPosition(position);
        setCaretPosition(messageContent, this.position);
      }
    );
    if (messageContent) messageContent.selectionEnd = position;

  };

  setCursorPosition = (pos) => {
    this.position = typeof pos === "undefined" ? 0 : pos;
  };

  setSelectedText = (selectedText) => {
    this.selectedText = selectedText;
  };

  handleEmptyContent = () => {
    this.setState({
      typingMessage: "",
      typingMessageOriginal: ""
    })
  }

  handleSendMsg = (messageType, messageContent) => {    
    let message;
    const { loaderStatus, handleSendMsg } = this.props;
    if (loaderStatus) return;
    if (messageType === "text") {
      message = {
        type: "text",
        content: messageContent,
      };  
    } else if (messageType === "media") {
      message = {
        type: "media",
        content: messageContent
      };
    }
    message.mentionedUsersIds = this.state.mentionedUsersIds;
    const showEmoji = this.state.showEmoji;
    this.setState(
      {
        typingMessage: "",
        showEmoji: false,
        showPreview: false,
        showAttachement: false,
        seletedFiles: {},
        mentionedUsersIds: []
      },
      () => {
        handleSendMsg(message);
        showEmoji && this.updateEmojiPopUpState();
      }
    );
    setTimeout(() => {
      this.setState({ typingMessage: "" })
    }, 250);
  };

  handleSendTextMsg = () => {
    this.handleSendMsg("text", this.state.typingMessageOriginal, true,this.state.mentionedList);
  };

  handleSendMediaMsg = (Media) => {
    this.handleSendMsg("media", Media);
  };

  toggleAttachement = () => {
    const showEmoji = this.state.showEmoji;
    this.setState(
      {
        showEmoji: false,
        showAttachement: !this.state.showAttachement
      },
      () => {
        showEmoji && this.updateEmojiPopUpState();
      }
    );
  };

  onCloseAttachment = () => {
    this.setState({ showAttachement: false });
  };

  handleShowHidePreview = () => {
    this.setState({
      selectedSlide: 0,
      showAttachement: false,
      showPreview: !this.state.showPreview,
      seletedFiles: {}
    });
  };

  selectFile = (event, mediaType) => {
    this.setState({
      showPreview: true,
      seletedFiles: {
        filesId: uuidv4(),
        files: event.target.files,
        mediaType
      }
    });
  };

  recordingStatus = (status) => {
    encryptAndStoreInLocalStorage("recordingStatus", status);
    this.setState({
      recordingStatus: status
    });
  };

  handleShowEmojis = () => {
    this.setState(
      {
        showEmoji: !this.state.showEmoji,
        showAttachement: false
      },
      () => {
        this.updateEmojiPopUpState();
      }
    );
  };

  typingStopped = debounce(() => {
    if (!typing) {
      return;
    }
    typing = false;
    const { chatType, jid } = this.props;
    const updatedJid = this.getJid(chatType, jid);
    this.goneStatus(chatType, updatedJid);
  }, TYPE_DELAY_TIME);

  typingStarted = function () {
    typing = true;
    if (this.state.typingMessage.length + 1 !== 0 && Date.now() - lastTypingTime > TYPE_DELAY_TIME) {
      lastTypingTime = Date.now();
      this.sentTypingstatus();
    }
  };

  delay = () => {
    this.typingStarted();
    this.typingStopped();
  };

  goneStatus = (chatType, jid) => {
    SDK.sendTypingGoneStatus(jid);
  };

  getJid = (chatType, jid) => {
    return chatType === "groupchat"
      ? jid + "@mix." + REACT_APP_XMPP_SOCKET_HOST
      : jid + "@" + REACT_APP_XMPP_SOCKET_HOST;
  };

  sentTypingstatus = () => {
    const { chatType, jid } = this.props;
    if (!(chatType === "groupchat" || chatType === "chat")) {
      return;
    }
    let userJid = this.getJid(chatType, jid);
    SDK.sendTypingStatus(userJid);
  };

  handleOnFocus = (e) => {
    this.state.showAttachement && this.setState({ showAttachement: false });
  };

  isTypingMessageHasData = () => {
    const { typingMessage = "" } = this.state || {};
    return typingMessage || "".trim().length > 0;
  };

  updateEmojiPopUpState = () => {
    this.props.popUpState({
      name: "smileyPopUp",
      smileyPopUp: {
        active: this.state.showEmoji
      }
    });
  };

  outsideClick = (event) => {
    const tagName = event.target.getAttribute("data-tag");
    if (
      event.offsetX > event.target.clientWidth ||
      event.offsetY > event.target.clientHeight ||
      tagName === "toggle-emojis-popup"
    ) {
      event.stopPropagation();
      return false;
    }
    const { showEmoji } = this.state;
    if (!showEmoji) return false;
    this.setState(
      {
        showEmoji: false
      },
      () => {
        this.updateEmojiPopUpState();
      }
    );
    return true;
  };

  closeCamera = () => {
    this.stopCameraPermissionTracks();
    this.setState({
      showCamera: false
    });
  };

  handleCameraTakenFile = (file) => {
    if (blockOfflineMsgAction()) return;
    file.fileDetails = {};
    this.handleSendMediaMsg([file]);
    this.closeCamera();
  };

  toggleCamera = async () => {
    this.setState({ showAttachement: false });
    const permissionResult = await getCameraPermission();
    this.cameraPermissionTracks = permissionResult || [];
    this.setState({ cameraPermission: permissionResult ? 1 : 2 });

    if (permissionResult)
      this.setState({
        showCamera: !this.state.showCamera
      });
  };

  stopCameraPermissionTracks = () => {
    const tracks = this.cameraPermissionTracks;
    Array.isArray(tracks) &&
      tracks.forEach(function (track) {
        track.stop && track.stop();
      });
    this.cameraPermissionTracks = [];
  };

  handleCameraPopupClose = () => {
    this.setState({
      showCamera: false,
      cameraPermission: 0
    });
  };

  handleMentionView = (view = false, Groupdata = {}) => {

    this.setState({
      showMention: view,
      GroupParticiapantsList: Groupdata,
    });
  };

   handleMentionedData = (userId) => {
    let rosterData = getUserDetails(userId);
    let displayName = rosterData.displayName;
    let position = this.position;
    let text = "";
    const messageContent = document.getElementById("typingContainer");
    let start = messageContent?.innerHTML?.substring(0, this.position);
    start = start.substring(0, start.lastIndexOf("@"));
    const end = messageContent?.innerHTML?.substring(this.position);
    const uihtml = `<span data-mentioned="${userId}" class="mentioned blue">@${displayName}</span> `;
    text = start + uihtml + end;
    position = this.position + _get(uihtml, "length", 0);
    let temp = document.createElement("div");
    temp.innerHTML = text;
    let mentionedUiElements = temp.getElementsByClassName("mentioned");
    Array.from(mentionedUiElements).forEach((e) => {
      e.innerHTML = "@[?]";
    });
    let typingMessageOriginal = temp.textContent || temp.innerText;
    let mentionedUsersIds = [...this.state.mentionedUsersIds];
    mentionedUsersIds.push(userId);
    this.setState({
      typingMessage: text ,
      showMention: false,
      typingMessageOriginal: typingMessageOriginal,
      mentionedUsersIds: mentionedUsersIds
    }, () => {
      this.setCursorPosition(position);
      setCaretPosition(messageContent, position);
    });
  };

  removeMentionedUserId=(arr, value)=> {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }

  handleDeleteMentionedUser = (ele) =>{
      let mentionedId = ele.dataset.mentioned;
      let mentionedUsersIds = [this.state.mentionedUsersIds];
      this.setState({
        mentionedUsersIds: this.removeMentionedUserId(mentionedUsersIds[0], mentionedId), 
      })
  }

  groupMemberSearchList = (searchWith) => {
    const { GroupParticiapantsList } = this.state;
    const searchResult = GroupParticiapantsList.filter((ele) => ele.userProfile.nickName.toLowerCase().includes(searchWith.toLowerCase()))
    return searchResult;
  };

  handleSearchView = (searchValue) => {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.setState({
        searchEnable: searchValue === "" ? false : true,
        searchValue: searchValue,
        GroupParticiapantsList: this.groupMemberSearchList(searchValue)

      })

    }, 0);
  }

  findReply = (jid = "") => {
    const { userReplayDetails = [] } = this.props;
    const autoReplay = userReplayDetails.some(
      (ele) => _get(ele, "roster.userId", "") === jid || _get(ele, "roster.groupId", "") === jid
    );
    const autoMsgfind = userReplayDetails.find(
      (ele) => _get(ele, "roster.userId", "") === jid || _get(ele, "roster.groupId", "") === jid
    );
    const { replyMessages = {} } = autoMsgfind || {};
    return { autoReplay: autoReplay, autoMsgfind: replyMessages };
  };

  renderCameraPopup = () => {
    return (
      <div className="camera-container mediaAttachCamera">
        <div className="camera-popup">
          <h4>{PERMISSION_DENIED}</h4>
          <i>
            <CameraIcon />
          </i>
          <p>{CAMERA_PERMISSION_DENIED}</p>
          <div className="popup-controls">
            <button
              type="button"
              className="btn-okay"
              onClick={(e) => this.handleCameraPopupClose(e)}
              name="btn-cancel"
            >
              {"Okay"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  renderCameraCapture = () => {
    return (
      <Camera
        stopCameraPermissionTracks={this.stopCameraPermissionTracks}
        onClickClose={this.closeCamera}
        cropEnabled={false}
        onSuccess={this.handleCameraTakenFile}
      />
    );
  };

  render() {
    const {
      showMention,
      selectedSlide,
      showPreview,
      seletedFiles,
      showEmoji,
      typingMessage,
      showAttachement,
      recordingStatus,
      showCamera,
      cameraPermission,
      featuresAvailable,
      GroupParticiapantsList = {}
    } = this.state;
    let { 
      isAttachmentEnabled = false,
      isImageAttachmentEnabled = false,
      isVideoAttachmentEnabled = false,
      isAudioAttachmentEnabled = false,
      isDocumentAttachmentEnabled = false
        } = featuresAvailable;
    if(!isImageAttachmentEnabled && !isVideoAttachmentEnabled &&
      !isAudioAttachmentEnabled && !isDocumentAttachmentEnabled)
    {
      isAttachmentEnabled = false;
    }
    const { jid, loaderStatus, vCardData, rosterData, closeReplyAction, chatType, groupMemberDetails } = this.props;
    const { autoReplay = false, autoMsgfind = {} } = this.findReply(jid);

    return (
      <footer className={`${loaderStatus ? "v-hidden" : ""} footer `}>
        <OutsideClickHandler onOutsideClick={this.outsideClick}>
          <Emoji emojiState={showEmoji} onEmojiClick={this.handleEmojiText} />

          {autoReplay ? (
            <ReplyToMessage
              replyMessage={autoMsgfind}
              vCardData={vCardData}
              rosterData={rosterData}
              closeReplyAction={closeReplyAction}
              groupMemberDetails={groupMemberDetails}
              jid={jid}
            />
          ) : null}
        </OutsideClickHandler>
        {(GroupParticiapantsList.length > 0 && showMention) ?
          <OutsideClickHandler onOutsideClick={() => this.handleMentionView(false)}>
            <MentionUserList handleMentionedData={this.handleMentionedData} GroupParticiapantsList={GroupParticiapantsList} />
          </OutsideClickHandler>
          : null
        }

        {recordingStatus && Config.attachement && showAttachement && (
          <Attachement
            attachment={featuresAvailable}
            selectFile={this.selectFile}
            onclose={this.toggleAttachement}
            closeAttachment={this.onCloseAttachment}
            handleSendMediaMsg={this.handleSendMediaMsg}
            toggleCamera={this.toggleCamera}
          />
        )}

        {showCamera && (
          <>
            {isBoxedLayoutEnabled() ?
              <>
                <Modal containerId="container">
                  {this.renderCameraCapture()}
                </Modal>
              </>
              :
              <>
                {this.renderCameraCapture()}
              </>
            }
          </>
        )}

        {cameraPermission === 2 && (
          <>
            {isBoxedLayoutEnabled() ?
              <Modal containerId="container">
                {this.renderCameraPopup()}
              </Modal>
              :
              <>
                {this.renderCameraPopup()}
              </>
            }
          </>
        )}

        {showPreview && (
          <Modal containerId="container">
            <MediaPreview
              attachment={featuresAvailable}
              seletedFiles={seletedFiles}
              jid={jid}
              selectedSlide={selectedSlide}
              onClosePreview={this.handleShowHidePreview}
              onClickSend={this.handleSendMediaMsg}
            />
          </Modal>
        )}
        <form style={{ visibility: this.props.forwardOption ? "hidden" : " " }} className="message-area-container">
          <div className="message-area">
            <i
              className="em em-slightly_smiling_face"
              data-tag="toggle-emojis-popup"
              onClick={this.handleShowEmojis}
            ></i>
            <ContentEditable
              handleMentionView={this.handleMentionView}
              handleSearchView={this.handleSearchView}
              loaderStatus={loaderStatus}
              html={typingMessage}
              id="typingContainer"
              onInputListener={this.delay}
              jid={jid}
              chatType={chatType}
              handleMessage={this.handleMessage}
              handleSendTextMsg={this.handleSendTextMsg}
              handleOnFocus={this.handleOnFocus}
              setCursorPosition={this.setCursorPosition}
              setSelectedText={this.setSelectedText}
              handleEmptyContent={this.handleEmptyContent}
              handleDeleteMentionedUser={this.handleDeleteMentionedUser}
            />
            <div className="intraction icon">
              {recordingStatus && Config.attachement && isAttachmentEnabled && (
                <i
                  title="Attachment"
                  className={showAttachement ? "attachment open" : "attachment"}
                  onClick={this.toggleAttachement}
                >
                  <span className="toggleAnimation"></span>
                  <Attachment />
                </i>
              )}
            </div>
          </div>
          {!this.isTypingMessageHasData() && isAudioAttachmentEnabled && (
            <AudioRecorder
              jid={this.props.jid}
              handleSendMediaMsg={this.handleSendMediaMsg}
              recordingStatus={this.recordingStatus}
              avoidRecord={this.props.avoidRecord}
            />
          )}
          {this.isTypingMessageHasData() && (
            <div className="formbtns">
              <a type="submit" className="send">
                <i title="Send" className="send" onClick={this.handleSendTextMsg}>
                  <SendMessage />
                </i>
              </a>
            </div>
          )}
        </form>
      </footer>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    featureStateData: state.featureStateData,
    conversationState: state.conversationState,
    chatConversationHistory: state.chatConversationHistory,
    activeChatData: state.activeChatData,
    groupsMemberListData: state.groupsMemberListData,

  };
};

export default connect(mapStateToProps, {
  popUpState: popUpState,
  saveMessageContent: saveMessageContent
})(WebChatMessagesComposing);
