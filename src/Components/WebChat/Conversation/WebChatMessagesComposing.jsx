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
import { blockOfflineAction, blockOfflineMsgAction, isAppOnline, isBoxedLayoutEnabled, placeCaretAtEnd } from "../../../Helpers/Utility";
import { get as _get } from "lodash";
import Store from "../../../Store";
import { UpdateTypedMessage } from "../../../Actions/ChatHistory";
import { encryptAndStoreInLocalStorage } from "../WebChatEncryptDecrypt";
import MentionUserList from "./Templates/Common/MentionUserList";
import { getUserDetails } from "../../../Helpers/Chat/User";
function debounce(func, wait, immediate) {
  let timeout;
  return function () {
    let context = this,
      args = arguments;
    let later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

let typing = false,
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
      mentionedUsersIds: [],
      mentionedIdsForEditableField: [],
      searchEmoji: "",
      messageDetails: {},
      editableDetails: {
        [this.props?.activeChatData?.data?.chatId]: {isEditable: false, editMsgId: "", editTypedMessage: "", editTypedOriginalMsg: ""}
      },
    };
    this.position = 0;
    this.timeout = 0;
    this.selectedText = null;
    encryptAndStoreInLocalStorage("recordingStatus", true);
    this.cameraPermissionTracks = [];
    this.chatScreenName = "conversationScreen";
    this.pasteEventListener = this.handleImagePasteFiles.bind(this);
  }

  componentDidMount() {
    const messageContent = document.getElementById("typingContainer");
    messageContent && messageContent.focus();

    const { chatId = "" } = _get(this.props, "activeChatData.data", "");
    if (chatId) {
      const { typedMessage = "" } = this.props?.chatConversationHistory?.data[chatId] || {};
      const { featureStateData } = this.props;
      this.setState({ featuresAvailable: featureStateData })
      this.setState(
        {
          typingMessage: typedMessage
        },
        () => {
          const msgContent = document.getElementById("typingContainer");
          msgContent && placeCaretAtEnd(msgContent);
        }
      );
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { 
      sendMessgeType,
      messageEditDetails, 
      messageDeletedData, 
      chatEditStatus, 
      closeReplyAction, 
      otherActionClick, 
      handleOtherMessageActionClick, 
      editedDetailsArr, 
      dragOnContainer: { draggedId = "" } = {} 
    } = this.props;
    const { isCurrentMsgDeleted = {} } = messageDeletedData;
    const { chatId = "" } = _get(this.props, "activeChatData.data", {});
    const { chatId: prevChatId = "" } = _get(prevProps, "activeChatData.data", {});
    const messageContent = document.getElementById("typingContainer");
    if (draggedId && prevProps?.dragOnContainer?.draggedId !== draggedId) {
      this.setState({
        showPreview: true
      });
      return;
    }

    if (sendMessgeType === 'Edit' && this.state.editableDetails[chatId]?.isEditable && 
    (chatEditStatus[editedDetailsArr[chatId]?.messageEditDetails?.msgId] === false || isCurrentMsgDeleted[messageEditDetails?.msgId] === true
      || otherActionClick === true || this.props.isEditDisabled === true)) {
      this.setState({
        editableDetails: {
          [chatId]: {
            ...prevState.editableDetails[chatId],
            editMsgId: "",
            editTypedMessage: "",
            editTypedOriginalMsg: ""
          }
        },
        typingMessage: "",
        messageDetails: {},
        mentionedIdsForEditableField: [],
      });
      closeReplyAction(chatId);
      Store.dispatch(UpdateTypedMessage({ chatId: chatId, message: "" }));
      otherActionClick === true && handleOtherMessageActionClick(false);
    }

    const { typedMessage = "" } = this.props.chatConversationHistory.data[chatId] || {};
    const mentionedUsersIdsLength = editedDetailsArr[chatId]?.messageEditDetails?.msgBody?.mentionedUsersIds?.length || 0;


    if (((prevProps.sendMessgeType === 'Edit' && sendMessgeType === 'Edit') && 
     (prevProps.editedDetailsArr[chatId]?.existingMessageData !== editedDetailsArr[chatId]?.existingMessageData))
     || ((prevProps.sendMessgeType === 'Edit' && sendMessgeType === 'Edit') && 
     (prevProps.editedDetailsArr[chatId]?.timer !== editedDetailsArr[chatId]?.timer)
     )) {
      const { typedMessage = "" } = this.props.chatConversationHistory.data[chatId] || {};
      this.setCursorPosition(typedMessage.length);
      this.setState({
        editableDetails: {
          [chatId]: {
            isEditable: editedDetailsArr[chatId]?.isEditable || false,
            editMsgId: editedDetailsArr[chatId]?.messageEditDetails?.msgId,
            editTypedMessage: typedMessage,
            editTypedOriginalMsg: editedDetailsArr[chatId]?.messageEditDetails?.msgBody?.message,
          }
        },
        messageDetails: editedDetailsArr[chatId]?.messageEditDetails,
        typingMessage: typedMessage,
        mentionedIdsForEditableField: [],
        },() => {
          (mentionedUsersIdsLength > 0) && this.handleMentionEditable(editedDetailsArr[chatId]?.messageEditDetails, typedMessage);
          messageContent && placeCaretAtEnd(messageContent);
      });    
    }

    if (prevProps.sendMessgeType !== sendMessgeType) {
      if (sendMessgeType === 'Edit') {
        this.setCursorPosition(typedMessage.length);
        this.setState({
          editableDetails: {
            [chatId]: {
              isEditable: editedDetailsArr[chatId]?.isEditable || false,
              editMsgId: editedDetailsArr[chatId]?.messageEditDetails?.msgId,
              editTypedMessage: typedMessage,
              editTypedOriginalMsg: editedDetailsArr[chatId]?.messageEditDetails?.msgBody?.media?.caption || editedDetailsArr[chatId]?.messageEditDetails?.msgBody?.message,
            }
          },
          messageDetails: editedDetailsArr[chatId]?.messageEditDetails,
          typingMessage: typedMessage,
          },() => {
            (mentionedUsersIdsLength > 0) && this.handleMentionEditable(editedDetailsArr[chatId]?.messageEditDetails, typedMessage);
            messageContent && placeCaretAtEnd(messageContent);
        });       
      } else {
        this.setState({
          editableDetails: {[chatId]: {
            isEditable: false,
            editMsgId: "",
            editTypedMessage: "",
            editTypedOriginalMsg: ""
          }},
          messageDetails: {},
          mentionedIdsForEditableField: [],
        })
      }
      messageContent && placeCaretAtEnd(messageContent);
      return;
    }


    if (prevChatId !== chatId) {
      const { typedMessage = "" } = this.props.chatConversationHistory.data[chatId] || {};
      typing = false;
      clearTimeout(this.timeout);
      if (messageContent && prevChatId) {
        if (prevProps.chatType === "groupchat" || prevProps.chatType === "chat") {
          const prevJid = this.getJid(prevProps.chatType, prevChatId);
          this.goneStatus(prevProps.chatType, prevJid);
        }
      }

      this.setState(
        {
          typingMessage: typedMessage,
          showPreview: false,
          showCamera: false
        },
        () => {
          messageContent && placeCaretAtEnd(messageContent);
        }
      );

      if (this.state.editableDetails[chatId] && this.state.editableDetails[chatId]?.isEditable && editedDetailsArr[chatId] &&
        editedDetailsArr[chatId]?.sendMessgeType === 'Edit' && editedDetailsArr[chatId]?.isEditable && 
        (this.state.editableDetails[chatId]?.editMsgId === editedDetailsArr[chatId]?.messageEditDetails?.msgId)) {
          closeReplyAction(chatId);
          this.setState({
            typingMessage: "",
            typingMessageOriginal: "",
            mentionedIdsForEditableField: [],
          },
          () => {
            Store.dispatch(UpdateTypedMessage({ chatId: this.props.jid, message: "" }));
            messageContent && placeCaretAtEnd(messageContent);
          });
      }
    }

  }

  //Handled mentioned Users when editable
  handleMentionEditable = (messageEditDetails) => {
    const mentionedUsers = messageEditDetails?.msgBody?.mentionedUsersIds || [];
    let originalMessage = messageEditDetails?.msgBody?.media?.caption || messageEditDetails?.msgBody?.message;
    if (originalMessage.endsWith('@[?]') === true) {
      originalMessage = originalMessage+" ";
    }
    const pattern = /\@\[\?]\s/g;
    let counter = 0;
    // Replace each @[?] with new span
    let replacedText = "";
    replacedText = originalMessage.replace(pattern, () => {
      const index = counter++;
      const userId = mentionedUsers[index];
      let rosterData = getUserDetails(userId);
      let displayName = rosterData.displayName;
      const uiHtml = `<span data-mentioned="${userId}" class="mentioned blue" contenteditable="true">@${displayName}</span> `;
      return uiHtml;
    });
    const messageContent = document.getElementById("typingContainer");
    messageContent.innerHTML = replacedText;
    this.setState({
      mentionedIdsForEditableField: mentionedUsers
    })
    Store.dispatch(UpdateTypedMessage({ chatId: this.props.jid, message: replacedText }));
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  handleMessage = (event = {}, isClickedTypingField = false) => {
    const { value = "" } = _get(event, "target", {});
    let temp = document.createElement("div");
    temp.innerHTML = value.trim();
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
    const { chatId = "" } = _get(this.props, "activeChatData.data", {});
    this.setState(
      {
        typingMessage:
          (this.state.typingMessage.length === 0 && (value.trim().length === 0 || value === "&nbsp;")) ||
            (value.length === 1 && value === "\n")
            ? ""
            : value,
        typingMessageOriginal: typingMessageOriginal.trim(),
      },
      () => {
        if (this.state.editableDetails[chatId]?.isEditable === false) {
          Store.dispatch(UpdateTypedMessage({ chatId: this.props.jid, message: this.state.typingMessage }));
        }
      }
    );
    if (this.state.editableDetails[chatId] && this.state.editableDetails[chatId]?.isEditable === true && 
      isClickedTypingField === false) {
      this.setState({
        editableDetails: {
          [chatId]: {
            ...this.state.editableDetails[chatId],
            editTypedMessage: value,
            editTypedOriginalMsg: typingMessageOriginal.trim()
          }
        },
        mentionedIdsForEditableField: this.state.mentionedIdsForEditableField,
      })
    }
  };

  handleEmojiText = (emojiObject = "") => {
    const messageContent = document.getElementById("typingContainer");
    const { chatId = "" } = _get(this.props, "activeChatData.data", {});
    let position;
    let text;
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
    let updatedText = text.replace("&amp;", "&");
    let filteredHtml = "";

    //handle editable content
    if (this.state.editableDetails[chatId] && this.state.editableDetails[chatId]?.isEditable === true) {
      this.setState({
        editableDetails: {
          [chatId]: {
            ...this.state.editableDetails[chatId],
            editTypedMessage: text,
            editTypedOriginalMsg: text
          }
        },
      })
    }
    this.setState(
      {
        typingMessage: text,
        typingMessageOriginal: text
      },
      () => {
          this.delay();
          Store.dispatch(UpdateTypedMessage({ chatId: this.props.jid, message: this.state.typingMessage }));
          if (this.state.typingMessage.includes("&amp;") === true) {
            this.setCursorPosition(position);
            setCaretPosition(messageContent, position);
            placeCaretAtEnd(messageContent);
          } else {
            if (this.state.typingMessage.includes("span") === false) {
              this.setCursorPosition(position);
              setCaretPosition(messageContent, this.position);
            } else {
              this.setCursorPosition(position);
              placeCaretAtEnd(messageContent)
            }
          }
      
          if(this.props.chatType === "groupchat") {
            if ((this.state.typingMessage.length === this.position) && this.state.showMention === true) {              
              filteredHtml = updatedText.toString().includes('@') && updatedText.substring(updatedText.lastIndexOf('@')+1, this.position);
            } else if ((this.state.typingMessage.length !== this.position) && this.state.showMention === true) {
              const atIndex = updatedText.lastIndexOf('@', this.position);
              const checkBeforeAt = updatedText.charAt(atIndex-1)
              const result = updatedText.substring(atIndex+1, this.position);
              if (checkBeforeAt.includes(' ') === true || checkBeforeAt === "") {
                filteredHtml = result
              }
            }
            if (this.state.showMention === true) {
              const usersList = this.handleSearchView(filteredHtml);
              if (usersList.length < 1) this.setState({showEmoji: true})
              else this.setState({showEmoji: false})
            }
          }
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
    const { editableDetails } = this.state;
    const { chatId = "" } = _get(this.props, "activeChatData.data", {});
    if (editableDetails[chatId] && editableDetails[chatId]?.isEditable === true && !isAppOnline()) {
      return;
    }
    if ((this.state.editableDetails[chatId]?.isEditable && this.state.editableDetails[chatId]?.editTypedOriginalMsg.length > 0 && 
      (this.props.editedDetailsArr[chatId]?.messageEditDetails?.chatType === 'groupchat' ? 
      this.state.editableDetails[chatId]?.editTypedMessage : this.state.editableDetails[chatId]?.editTypedOriginalMsg) === this.props.editedDetailsArr[chatId]?.existingMessageData)) {//this.state.editableDetails[chatId]?.editTypedMessage
        return;
    }
    this.setState({
      typingMessage: "",
      typingMessageOriginal: ""
    })
  }

  handleSendMsg = (messageType, content, mentionedUsersId = []) => {
    let message, messageContent, editMessageId = "";
    messageContent = content;
    const { loaderStatus, handleSendMsg } = this.props;
    const { messageDetails, editableDetails } = this.state;
    const { chatId = "" } = _get(this.props, "activeChatData.data", {});
    if (editableDetails[chatId] && editableDetails[chatId]?.editMsgId === messageDetails?.msgId) {
      if (!isAppOnline()) {
        blockOfflineAction();
        return;
      }
      editMessageId = editableDetails[chatId]?.editMsgId || "";
      messageContent = editableDetails[chatId]?.editTypedOriginalMsg || "";
    }
    if (loaderStatus) return;

    let type = "text";
    if (editableDetails[chatId]?.editMsgId && messageDetails && messageDetails?.msgBody?.media?.caption !== undefined && 
      messageDetails?.msgBody?.media?.caption !== "") {
      type = "media";
    } 
    if (messageType === "text") {
      message = {
        type: type,
        content: messageContent,
        mentionedUsersIds: editableDetails[chatId]?.isEditable ? this.state.mentionedIdsForEditableField : this.state.mentionedUsersIds,
        editMessageId: editMessageId
      };
    } else if (messageType === "media") {
      message = {
        type: "media",
        content: messageContent,
        mentionedUsersIds: mentionedUsersId,
        editMessageId: ""
      };
    }
    const showEmoji = this.state.showEmoji;
    this.setState(
      {
        typingMessage: "",
        showEmoji: false,
        showPreview: false,
        showAttachement: false,
        seletedFiles: {},
        mentionedUsersIds: [],
        chatType: this.props.chatType,
        editableDetails: {}
      },
      () => {
        handleSendMsg(message, messageDetails);
        showEmoji && this.updateEmojiPopUpState();
        window.removeEventListener('paste', this.pasteEventListener);
      }
    );
    setTimeout(() => {
      this.setState({ typingMessage: "", mentionedIdsForEditableField: [] })
    }, 250);
  };

  handleSendTextMsg = () => {
    const { chatId = "" } = _get(this.props, "activeChatData.data", {});
    if ((this.state.editableDetails[chatId]?.isEditable && this.state.editableDetails[chatId]?.editTypedOriginalMsg.length > 0 && 
      (this.props.editedDetailsArr[chatId]?.messageEditDetails?.chatType === 'groupchat' ? 
      this.state.editableDetails[chatId]?.editTypedMessage : this.state.editableDetails[chatId]?.editTypedOriginalMsg) === 
      this.props.editedDetailsArr[chatId]?.existingMessageData)) {
        return;
    }
    this.handleSendMsg("text", this.state.typingMessageOriginal);
  };

  handleSendMediaMsg = (media) => {
    this.handleSendMsg("media", media);
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
        Store.dispatch(UpdateTypedMessage({ chatId: this.props.jid, message: this.state.typingMessage }));
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
    window.removeEventListener('paste', this.pasteEventListener);
  };

  selectFile = (event, mediaType) => {
    this.setState({
      showPreview: true,
      seletedFiles: {
        filesId: uuidv4(),
        files: event.target.files,
        mediaType,
        chatType: this.props.chatType
      }
    });
  };

  recordingStatus = (status) => {
    encryptAndStoreInLocalStorage("recordingStatus", status);
    this.setState({
      recordingStatus: status
    });
    const messageContent = document.getElementById("typingContainer");
    messageContent && placeCaretAtEnd(messageContent);
  };

  handleShowEmojis = () => {
    const messageContent = document.getElementById("typingContainer");
    let replaceText = this.state.typingMessage.replace("&amp;", "&");
    this.setState(
      {
        showEmoji: !this.state.showEmoji,
        showAttachement: false
      },
      () => {
        this.updateEmojiPopUpState();
        if (this.state.typingMessage.includes("&amp;") === true) {
          if (this.position === this.state.typingMessage.length) {
          placeCaretAtEnd(messageContent)
          }
        } else {
          this.setCursorPosition(this.position);
          setCaretPosition(messageContent, this.position);
        }
      }
    );
    
    if (this.props.chatType === "groupchat") {
      const groupMemberList = this.props.groupsMemberListData?.data?.participants;
      let groupList = groupMemberList.filter(participants => participants.userId !== this.props.vCardData.data.userId);
      groupList = groupList.map((obj) => {
        obj.rosterData = getUserDetails(obj.userId);
        return obj;
      });

        const lastIndex = replaceText.lastIndexOf('@');
        const result = replaceText.substring(lastIndex-1, lastIndex);
        if ((lastIndex < 0 === false) && result.length < 1 || result === ' ') {
          this.setState({
            showMention: true,
            GroupParticiapantsList:
              this.state.searchEmoji !== "" ? this.handleSearchView(this.state.searchEmoji) : groupList
          });
        }
    }
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
    const { chatId = "" } = _get(this.props, "activeChatData.data", {});
    if (this.state.typingMessage.length + 1 !== 0 && Date.now() - lastTypingTime > TYPE_DELAY_TIME && !this.state.editableDetails[chatId]?.isEditable) {
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

  isTypingMessageHasData = (isEditable = false) => {
    if (isEditable) return;
    const { typingMessage = "" } = this.state || {};
    return (typingMessage || "").trim().length > 0;
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

  handleMentionView = (view = false, groupData = {}) => {
    this.setState({
      showMention: view,
      GroupParticiapantsList: groupData,
      },
      () => {
        if (this.state.showMention === true) this.setState({showEmoji: false})
      }
    );
  };

  handleMentionedData = (userId, chatName) => {
    const { chatId = "" } = _get(this.props, "activeChatData.data", {});
    let rosterData = getUserDetails(userId);
    let displayName = rosterData.displayName;
    let position;
    let text = "";
    const messageContent = document.getElementById("typingContainer");
    let start = messageContent?.innerHTML?.substring(0, this.position);
    start = start.substring(0, start.lastIndexOf("@"));
    const end = messageContent?.innerHTML?.substring(this.position);
    const uihtml = `<span data-mentioned="${userId}" class="mentioned blue" contenteditable="true">@${displayName}</span> `;
    text = start + uihtml + end;
    position = this.position + _get(uihtml, "length", 0) -1;
    let temp = document.createElement("div");
    temp.innerHTML = text;
    let mentionedUiElements = temp.getElementsByClassName("mentioned");
    Array.from(mentionedUiElements).forEach((e) => {
      e.innerHTML = "@[?]";
    });
    let typingMessageOriginal = temp.textContent || temp.innerText;
    let mentionedUsersIds = [...this.state.mentionedUsersIds];
    let mentionedUsersIdsEdit;
    if (this.state.editableDetails[chatId] && this.state.editableDetails[chatId]?.isEditable === true) {// when edit is enabled
      mentionedUsersIdsEdit = [...this.state.mentionedIdsForEditableField];
      mentionedUsersIdsEdit.push(userId);
    } else {//normal case
      mentionedUsersIds.push(userId);
    }
    //handle editable content
    if (this.state.editableDetails[chatId] && this.state.editableDetails[chatId]?.isEditable === true) {
      this.setState({
        editableDetails: {
          [chatId]: {
            ...this.state.editableDetails[chatId],
            editTypedMessage: text,
            editTypedOriginalMsg: typingMessageOriginal.trim(),
          }
        },
      })
    } else {
      this.setState({
        mentionedUsersIds: mentionedUsersIds,
      })
    }
    this.setState({
      typingMessage: text,
      showMention: false,
      typingMessageOriginal: typingMessageOriginal.trim(),
      mentionedIdsForEditableField: mentionedUsersIdsEdit,
    }, () => {
      this.setCursorPosition(position);
      setCaretPosition(messageContent, position);
      chatName === this.chatScreenName && placeCaretAtEnd(messageContent)
      if (this.state.editableDetails[chatId]?.isEditable !== true) {
        Store.dispatch(UpdateTypedMessage({ chatId: this.props.jid, message: this.state.typingMessage }));
      }
    });
  };

  removeMentionedUserId = (arr, value) => {
    const index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }

  //Handled Deletion of mentionedUsers from TextField
  handleDeleteMentionedUser = (ele) => {
    const { chatId = "" } = _get(this.props, "activeChatData.data", {});
    let mentionedId = ele.dataset.mentioned;
    let mentionedUsersIds;
    if (this.state.editableDetails[chatId] && this.state.editableDetails[chatId]?.isEditable === true) {
      mentionedUsersIds = [this.state.mentionedIdsForEditableField];
      const deleteItem = this.removeMentionedUserId(mentionedUsersIds[0], mentionedId)
      this.setState({
        mentionedIdsForEditableField: deleteItem,
      })
    } else {
      mentionedUsersIds = [this.state.mentionedUsersIds];
      this.setState({
        mentionedUsersIds: this.removeMentionedUserId(mentionedUsersIds[0], mentionedId),
      })
    }
  }

  groupMemberSearchList = (searchWith) => {
    const groupMemberList = this.props.groupsMemberListData?.data?.participants;
    let groupList = groupMemberList.filter(participants => participants.userId !== this.props.vCardData.data.userId);
    groupList = groupList.map((obj) => {
      obj.rosterData = getUserDetails(obj.userId)
      return obj;
    });
    if(searchWith.length < 1){
      return [];
    } 
    const searchResult = groupList.filter((ele) => ele.userProfile.nickName.toLowerCase().toString().includes(searchWith))
    return searchResult;
  };

  handleSearchView = (searchChar) => {
    let searchValue = searchChar.includes("&amp;") === true ? searchChar.replace("&amp;", "&") : searchChar
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.setState({
        searchEnable: searchValue === "" ? false : true,
        searchValue: searchValue,
        searchEmoji: searchValue,
        GroupParticiapantsList: this.groupMemberSearchList(searchValue)
      })
    }, 0);
    return this.groupMemberSearchList(searchValue);
  }

  handleSearchEmojiView = (searchValue = "") => {
    this.setState({ searchEmoji: searchValue });
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

  renderCameraCapture = (chatId) => {
    return (
      <Camera
        stopCameraPermissionTracks={this.stopCameraPermissionTracks}
        onClickClose={this.closeCamera}
        cropEnabled={false}
        onSuccess={this.handleCameraTakenFile}
        chatType={this.props.chatType}
        chatId={chatId}
      />
    );
  };

  handleImagePaste = (e) => {
    const { chatId = "" } = _get(this.props, "activeChatData.data", {});
    if (this.state.editableDetails[chatId]?.isEditable === true) {
      return;
    }
    window.addEventListener('paste', this.pasteEventListener);
  }

  //Handled Mediapreview enable when paste in textField
  handleImagePasteFiles = (e) => {
    const mediaType = "imageVideo";
    if (e.clipboardData.files.length > 0) {
      this.setState({
        showPreview: true,
        seletedFiles: {
          filesId: uuidv4(),
          files: e.clipboardData.files,
          mediaType
        }
      });
    }
  }

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
      GroupParticiapantsList = [],
      editableDetails
    } = this.state;
    let {
      isAttachmentEnabled = false,
      isImageAttachmentEnabled = false,
      isVideoAttachmentEnabled = false,
      isAudioAttachmentEnabled = false,
      isDocumentAttachmentEnabled = false
    } = featuresAvailable;
    let isAttachment = true;
    if (!isImageAttachmentEnabled && !isVideoAttachmentEnabled &&
      !isAudioAttachmentEnabled && !isDocumentAttachmentEnabled) {
        isAttachment = false;
    }
    const { jid, loaderStatus, vCardData, rosterData, closeReplyAction, chatType, groupMemberDetails } = this.props;
    const { autoReplay = false, autoMsgfind = {} } = this.findReply(jid);
    const { chatId = "" } = _get(this.props, "activeChatData.data", "");
    return (
      <footer className={`${loaderStatus ? "v-hidden" : ""} footer `}>
        <OutsideClickHandler onOutsideClick={this.outsideClick}>
          {recordingStatus && <Emoji emojiState={showEmoji} onEmojiClick={this.handleEmojiText} /> }

          {autoReplay ? (
            <ReplyToMessage
              replyMessage={autoMsgfind}
              vCardData={vCardData}
              rosterData={rosterData}
              closeReplyAction={closeReplyAction}
              groupMemberDetails={groupMemberDetails}
              jid={jid}
              showMention={showMention}
            />
          ) : null}
        </OutsideClickHandler>
        {GroupParticiapantsList.length > 0 && showMention && showEmoji === false && (
          <OutsideClickHandler onOutsideClick={() => this.handleMentionView(false)}>
            <MentionUserList
              handleMentionedData={this.handleMentionedData}
              GroupParticiapantsList={GroupParticiapantsList}
              chatScreenName={"conversationScreen"} />
          </OutsideClickHandler>
        )}
        {showEmoji === true && GroupParticiapantsList.length > 0 && showMention === true && (
            <MentionUserList
              handleMentionedData={this.handleMentionedData}
              GroupParticiapantsList={GroupParticiapantsList}
              chatScreenName={"conversationScreen"} />
        )}

        {recordingStatus && Config.attachement && showAttachement && editableDetails[chatId]?.isEditable !== true && (
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
                  {this.renderCameraCapture(chatId)}
                </Modal>
              </>
              :
              <>
                {this.renderCameraCapture(chatId)}
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
              chatId={chatId}
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
                chatScreenName={"conversationScreen"}
                handleMentionView={this.handleMentionView}
                handleSearchView={this.handleSearchEmojiView}
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
                handleImagePaste = {this.handleImagePaste}
              />
            <div className="intraction icon">
              {recordingStatus && Config.attachement && isAttachmentEnabled && isAttachment && 
              editableDetails[chatId]?.isEditable !== true && (
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
          {((!this.isTypingMessageHasData() && isAudioAttachmentEnabled) || (editableDetails[chatId]?.isEditable === true && !recordingStatus)) && (
            <AudioRecorder
              jid={this.props.jid}
              handleSendMediaMsg={this.handleSendMediaMsg}
              recordingStatus={this.recordingStatus}
              avoidRecord={this.props.avoidRecord}
              isEditable={editableDetails[chatId]?.isEditable}
            />
          )}
          {(this.isTypingMessageHasData(this.state.editableDetails[chatId]?.isEditable ) || 
          (this.state.editableDetails[chatId]?.isEditable && this.state.editableDetails[chatId]?.editTypedOriginalMsg.length > 0 && 
            (this.props.editedDetailsArr[chatId]?.messageEditDetails?.chatType === "groupchat" ? this.state.editableDetails[chatId]?.editTypedMessage :
             this.state.editableDetails[chatId]?.editTypedOriginalMsg) !== this.props.editedDetailsArr[chatId]?.existingMessageData)) && (
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
    chatEditStatus: state.chatEditStatus,
  };
};

export default connect(mapStateToProps, {
  popUpState: popUpState,
  saveMessageContent: saveMessageContent
})(WebChatMessagesComposing);
