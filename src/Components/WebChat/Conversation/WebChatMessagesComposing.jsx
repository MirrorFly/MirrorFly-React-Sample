import React, { Component } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { connect } from "react-redux";
import uuidv4 from "uuid/v4";
import { popUpState, saveMessageContent } from "../../../Actions/ConversationAction";
import { Attachment, CameraIcon, SendMessage } from "../../../assets/images";
import Config from "../../../config";
import { ls } from "../../../Helpers/LocalStorage";
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
      showPreview: false,
      selectedSlide: 0,
      seletedFiles: {},
      showAttachement: false,
      recordingStatus: true,
      showCamera: false,
      cameraPermission: 0
    };
    this.position = 0;
    this.timeout = 0;
    this.gonetimeout = 0;
    this.selectedText = null;
    ls.setItem("recordingStatus", true);
    this.cameraPermissionTracks = [];
  }

  componentDidMount() {
    const messageContent = document.getElementById("typingContainer");
    messageContent && messageContent.focus();

    const { chatId = "" } = _get(this.props, "activeChatData.data", "");
    if (chatId) {
      const { typedMessage = "" } = this.props?.chatConversationHistory?.data[chatId] || {};
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
            : value
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
      const start = messageContent?.textContent?.substring(0, this.position);
      const end = messageContent?.textContent?.substring(this.position);
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

  handleSendMsg = (messageType, messageContent) => {
    let message;
    const { loaderStatus, handleSendMsg } = this.props;
    if (loaderStatus) return;
    if (messageType === "text") {
      message = {
        type: "text",
        content: messageContent.toString().replace(/<br>/g, "\n").trim()
      };
    } else if (messageType === "media") {
      message = {
        type: "media",
        content: messageContent
      };
    }
    const showEmoji = this.state.showEmoji;
    this.setState(
      {
        typingMessage: "",
        showEmoji: false,
        showPreview: false,
        showAttachement: false
      },
      () => {
        handleSendMsg(message);
        showEmoji && this.updateEmojiPopUpState();
      }
    );
  };

  handleSendTextMsg = () => {
    this.handleSendMsg("text", this.state.typingMessage);
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
      showPreview: !this.state.showPreview
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
    ls.setItem("recordingStatus", status);
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
    return(
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
     return(
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
      selectedSlide,
      showPreview,
      seletedFiles,
      showEmoji,
      typingMessage,
      showAttachement,
      recordingStatus,
      showCamera,
      cameraPermission
    } = this.state;
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

        {recordingStatus && Config.attachement && showAttachement && (
          <Attachement
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
              seletedFiles={seletedFiles}
              jid={jid}
              selectedSlide={selectedSlide}
              onClosePreview={this.handleShowHidePreview}
              onClickSend={this.handleSendMediaMsg}
            />
          </Modal>
        )}
        <form className="message-area-container">
          <div className="message-area">
            <i
              className="em em-slightly_smiling_face"
              data-tag="toggle-emojis-popup"
              onClick={this.handleShowEmojis}
            ></i>
            <ContentEditable
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
            />
            <div className="intraction icon">
              {recordingStatus && Config.attachement && (
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
          {!this.isTypingMessageHasData() && (
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
    conversationState: state.conversationState,
    chatConversationHistory: state.chatConversationHistory,
    activeChatData: state.activeChatData
  };
};

export default connect(mapStateToProps, {
  popUpState: popUpState,
  saveMessageContent: saveMessageContent
})(WebChatMessagesComposing);
