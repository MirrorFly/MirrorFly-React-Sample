import React, { useEffect, useState } from "react";
import _get from "lodash/get";
import _toArray from "lodash/toArray";
import WebChatEmoji from "../WebChatEmoji";
import ContentEditable from "../Conversation/Templates/Common/ContentEditable";
import { ALLOWED_KEY_CODES, CAPTION_CHARACTER_LIMIT } from "../../../Helpers/Constants";
import { setCaretPosition, removeMoreNumberChar } from "../../../Helpers/Chat/ContentEditableEle";
import OutsideClickHandler from "react-outside-click-handler";
import MentionUserList from "../Conversation/Templates/Common/MentionUserList";
import { getUserDetails } from "../../../Helpers/Chat/User";
import { useSelector } from "react-redux";
import { placeCaretAtEnd } from "../../../Helpers/Utility";
import { CHAT_TYPE_GROUP } from "../../../Helpers/Chat/Constant";

const Caption = (props = {}) => {
  const { onChangeCaption, media = {}, onClickSend, chatType, uniqueId, chatId, newFile, selectedFiles } = props;
  const { caption = "" } = media;
  const [typingMessage, setTypingMessage] = useState({
    value: ""
  });
  const [selectedText, setSelectedTextState] = useState(null);
  const [position, setPosition] = useState(0);
  const setCursorPosition = (pos) => setPosition(pos);
  const [GroupMemberList, setGroupMemberlist ] = useState([]);
  const [MentionView, setMentionView] = useState(false)
  const [MentionViewClicked, setMentionViewClicked] = useState(false)
  const [emojiSelected, setEmojiSelected] = useState(false);
  const [showEmojiState, setShowEmojiState] = useState(false);
  const [mentionedUsersIds, setMentionedUsersId] = useState([])
  const groupList = useSelector((state)=>state.groupsMemberListData);
  const vcardData = useSelector((state)=>state.vCardData)
  const groupMembers = useSelector((state)=>state.groupsMemberListData)
  const { typedMessage = "" } = useSelector((state)=>state.chatConversationHistory?.data[chatId] || {})
  const [showCursor, setshowCursor] = useState(false);
  const [searchEmoji, setSearchEmoji] = useState("");
  const [filteredTextForSearch, setFilteredTextForSearch] = useState("");
  const [getId, setId] = useState("image-preview-typingContainer");

  const handleEmojiText = (emojiObject, isClicked = false) => {
    setEmojiSelected(isClicked)
    const { value: typeVal } = typingMessage;
    let positionToUpdate;
    let text = "";
    const msgContent = document.getElementById(`${getId}-${uniqueId}`);
    // When user select all the text & choose emoji means,
    // Need to replace the emoji with existing content.
    // That's why below we check condition, selectedText & current state typingMessage is equal
    // Need to clear other content message & enter only the emoji
    if (selectedText === typeVal) {
      text = emojiObject;
      positionToUpdate = emojiObject.length;
    } else {
      const start = typeVal.substring(0, position);
      const end = typeVal.substring(position);
      text = start + emojiObject + end;
      positionToUpdate = position + emojiObject.length;
    }
    let filteredHtml = "";
    if (_toArray(text).length <= CAPTION_CHARACTER_LIMIT) {
      setTypingMessage((prevState) => {
        setCursorPosition(positionToUpdate);
        setCaretPosition(msgContent, positionToUpdate);
        return {
          ...prevState,
          value: text
        };
      });
      onChangeCaption(media, text);
      
      if ((typingMessage.value.length === position) && chatType === CHAT_TYPE_GROUP) {
        const atIndex = text.lastIndexOf('@')-1;
        const findBeforeAt = text.charAt(atIndex);
        filteredHtml = text.toString().includes('@') && text.substring(text.lastIndexOf('@')+1, positionToUpdate);
        if (filteredHtml !== undefined && filteredHtml.length > 0 &&
           MentionView === true && GroupMemberList.length < 1 && (findBeforeAt === "" || findBeforeAt === " ")) {
          setFilteredTextForSearch(filteredHtml);
          setMentionView(true);
        }
      } else if ((typingMessage.value.length !== position) && chatType === CHAT_TYPE_GROUP) {
        const atIndex = text.lastIndexOf('@', position);
        const checkBeforeAt = text.charAt(atIndex-1);
        const result = text.substring(atIndex+1, positionToUpdate);
        filteredHtml = result;
        if (filteredHtml !== undefined && filteredHtml.length > 0 &&
          MentionView === true && GroupMemberList.length < 1 && 
          (checkBeforeAt.includes(' ') === true || checkBeforeAt === "")) {
            setFilteredTextForSearch(filteredHtml);
            setMentionView(true);
        }
      }

 
    }
  };
  
  const handleMentionedUser = (userId, chatName = "", isClicked = false) => {   
    setMentionViewClicked(isClicked)
    let rosterDataValue = getUserDetails(userId);
    let displayName = rosterDataValue.displayName;
    let positionToUpdate;
    let text = "";
    let messageDocContent = document.getElementById(`${getId}-${uniqueId}`);
    let msgElement = typingMessage.value;
    let startCursor = msgElement?.substring(0, position);
    startCursor = startCursor.substring(0, startCursor.lastIndexOf("@"));
    const end = msgElement?.substring(position);
    const uiHtml = `<span data-mentioned="${userId}" class="mentioned blue" contenteditable="true">@${displayName}</span> `;
    text = startCursor + uiHtml + end;
    positionToUpdate = position + (uiHtml.length -1);
    setMentionView(false)
    setGroupMemberlist([])
    let mentionedUsersId = mentionedUsersIds
    mentionedUsersId.push(userId);
      setMentionedUsersId(
        mentionedUsersId
      )

    if (_toArray(text).length <= CAPTION_CHARACTER_LIMIT) {
      setTypingMessage((prevState) => {
        setCursorPosition(positionToUpdate);
        setCaretPosition(messageDocContent, positionToUpdate);
        return {
          ...prevState,
          value: text,
        };
      });
      onChangeCaption(media, text, mentionedUsersIds);
    }
  };

  const handleDeleteMentionedUsers = (ele) => {
    let mentionedIds = ele.dataset.mentioned;
    let mentionedUserId = [...mentionedUsersIds]
    let index = mentionedUserId.indexOf(mentionedIds);
    if (index > -1) {
      let mentionedId = mentionedUserId.filter((ind)=> ind !== index)
      setMentionedUsersId(
          [...mentionedId]
      )
    }   
  }

  const handleSearchList = (searchChar = "") => {       
    try {
      let searchValue = searchChar.includes("&amp;") === true ? 
      searchChar.replace("&amp;", "&") : searchChar;
      setSearchEmoji(searchValue);
      if (searchValue.length < 1) {
        setGroupMemberlist([]);
        return;
      }
      let groupParticipants = groupList.data.participants;
      let vCardUserId = vcardData.data.userId;
      let groupMemberlistsForSearch = groupParticipants.filter(participants=>participants.userId !== vCardUserId);
      const searchResults = groupMemberlistsForSearch.filter(
        (ele) => ele.userProfile.nickName.toLowerCase().includes(searchValue.toLowerCase())
      );
      setGroupMemberlist(searchResults)
      return searchResults;
    } catch(e) {}
  }
 
  // Added to Restrict User to Enter More than Allowed Characters Length
  const handleOnKeyDownListner = (e) => {
    if (
      _toArray(_get(typingMessage, "value", "")).length >= CAPTION_CHARACTER_LIMIT &&
      ALLOWED_KEY_CODES.indexOf(e.which) === -1
    ) {
      e.preventDefault();
    }
  };

  const handleMessage = ({ target }) => {
    const msgContent = document.getElementById(`${getId}-${uniqueId}`);
    const { value: targetVal } = target;
    setTypingMessage((prevState) => ({
      ...prevState,
      value:
        (prevState.value.length === 0 && targetVal.trim().length === 0) ||
          (targetVal.length === 1 && targetVal === "\n")
          ? ""
          : targetVal
    }));
    if (showCursor === true) {
      if (selectedFiles.length > 1 && msgContent !== null) {
        let msgContent = document.getElementById(`${getId}-${selectedFiles[0]?.fileDetails?.fileId}`)
        placeCaretAtEnd(msgContent)
      } else { placeCaretAtEnd(msgContent) }
      setshowCursor(false);
    }
    onChangeCaption(media, targetVal, mentionedUsersIds);
  };

  const handleMentionList = (mentionView = false, groupList = []) => {
    setGroupMemberlist(groupList)
    setMentionView(mentionView)

  }

  const handleEmptyContent = () => {
    setTypingMessage({ value : ""})
  }

  const remainingLenthCall = (typingMessageLength = 0) => {
    if (typingMessageLength >= 975) {
      const balanceCount = CAPTION_CHARACTER_LIMIT - typingMessageLength;
      return <span className="captionCount">{balanceCount > 0 ? balanceCount : 0}</span>;
    }
    return "";
  };

  const inputListenerHandler = () => true;
  const handleOnFocus = () => true;
  const setSelectedText = (selectText) => setSelectedTextState(selectText);

  useEffect(() => {
    const msgContent = document.getElementById(`${getId}-${uniqueId}`);
    if (MentionViewClicked === true || emojiSelected === true) {
      placeCaretAtEnd(msgContent)
      setMentionViewClicked(false)
      emojiSelected && setEmojiSelected(false)
    }
    if (newFile === undefined || newFile === null) {
      setshowCursor(true)
      handleMessage({ target: { value: typedMessage } });
      setCursorPosition(typedMessage.length)    
    }
  }, []);

  useEffect(() => {
    if (chatType === CHAT_TYPE_GROUP && filteredTextForSearch.length > 0 && filteredTextForSearch !== "") {
      const searchedList = handleSearchList(filteredTextForSearch)
      if (searchedList.length < 1) {
        setShowEmojiState(true)
      }
      else {
        setShowEmojiState(false)
      }
    }
  }, [filteredTextForSearch]);

  useEffect(() => {
    const msgContent = document.getElementById(`${getId}-${uniqueId}`);
    /** Group Chat **/
    if (chatType === CHAT_TYPE_GROUP) {
      if (GroupMemberList.length > 0 && MentionView === true && showEmojiState === true){
        setShowEmojiState(false)
      } else if (GroupMemberList.length < 1 && MentionView === true && showEmojiState === false){
        setShowEmojiState(true)
      }

      if (caption.length === position && (MentionViewClicked === true || emojiSelected === true)) {
        placeCaretAtEnd(msgContent)
        setMentionViewClicked(false)
        emojiSelected && setEmojiSelected(false);
      } 
      else if ((caption.length !== position) && emojiSelected === true && (
        caption.includes("&amp;") === false && caption.includes("span") === false)) {
        emojiSelected && setEmojiSelected(false);
        setCursorPosition(position);
        setCaretPosition(msgContent, position);
      } 
      else {
        if (MentionViewClicked === true || emojiSelected === true) {
          setCursorPosition(position);
          placeCaretAtEnd(msgContent);
          emojiSelected && setEmojiSelected(false);
          MentionViewClicked && setMentionViewClicked(false);
        }  
      }
    } else {
        /** Single Chat **/
      if (caption.length === position && emojiSelected === true) {
        placeCaretAtEnd(msgContent)
        emojiSelected && setEmojiSelected(false);
      } else if ((caption.length !== position) && emojiSelected === true && caption.includes("&amp;") === false) { //&& (caption.includes("&amp;") === false && caption.includes("span") === false)
        emojiSelected && setEmojiSelected(false);
        setCursorPosition(position);
        setCaretPosition(msgContent, position);
      } else {
        if (emojiSelected === true) {
          emojiSelected && setEmojiSelected(false);
          setCursorPosition(position);
          placeCaretAtEnd(msgContent);
        }
      }
    }

    if (caption.length > 0) {
      handleMessage({ target: { value: caption } }); //captionValue has been set
    }
    if (chatId) {
       setId("image-preview-$typingContainer");
    }
  }, [caption]);

  const { value = "" } = typingMessage;

  const handleshowEmoji = (isClicked = false) => {
    setShowEmojiState(isClicked) 
    if (isClicked === true) {
      const messageContent  = document.getElementById(`${getId}-${uniqueId}`);
      const messageContent1 = typingMessage.value;
      if (chatType === CHAT_TYPE_GROUP) {
        let groupMemberList = groupMembers.data.participants;
        let groupLists = groupMemberList?.filter(participants => participants.userId !== vcardData.data.userId);
        groupLists = groupLists.map((obj) => {
          obj.rosterData = getUserDetails(obj.userId)
          return obj;
        });
        const lastIndex = messageContent1?.lastIndexOf('@');
        const result = messageContent1?.substring(lastIndex-1, lastIndex);
        if ((lastIndex < 0 === false) && result.length < 1 || result === ' ') {
          setMentionView(true)
          if (searchEmoji !== "" && MentionView === true) {
            handleSearchList(searchEmoji);
          } else {
            if (MentionView === true) setGroupMemberlist(groupLists);
          }
        }

        if (position === typingMessage.value.length && 
          (typingMessage.value.includes('&amp;') === true)) {
          placeCaretAtEnd(messageContent)
        } else {
          setCursorPosition(position);
          setCaretPosition(messageContent, position);
        }
      }
    }
  }

  const handleSearchEmojiView = (searchValue = "") => {
    setSearchEmoji(searchValue);
  }

  return (
    <div className="uploadImageCaption">
      <div className="message-area-container">
        <div className="message-area" id={`video-caption-${props?.uniqueId}`}>
          <WebChatEmoji
           emojiState={handleshowEmoji}
           onEmojiClick={handleEmojiText}
           showEmoji={showEmojiState}
           />
          <ContentEditable
            handleMentionView={handleMentionList}
            captionCount={true}
            captionLength={value}
            chatType={chatType}
            handleSearchView={handleSearchEmojiView}
            id={`${getId}-${uniqueId}`}
            handleMessage={handleMessage}
            handleSendTextMsg={onClickSend}
            onInputListener={inputListenerHandler}
            handleOnFocus={handleOnFocus}
            placeholder={"Add a caption"}
            setCursorPosition={setCursorPosition}
            setSelectedText={setSelectedText}
            onKeyDownListner={handleOnKeyDownListner}
            handleDeleteMentionedUser={handleDeleteMentionedUsers}
            handleEmptyContent={handleEmptyContent}
            html={removeMoreNumberChar(CAPTION_CHARACTER_LIMIT, value)}
          />
          {chatType === CHAT_TYPE_GROUP && GroupMemberList.length > 0 && MentionView && showEmojiState === false && (
            <OutsideClickHandler onOutsideClick={() => handleMentionList(false , [])}>
              <MentionUserList handleMentionedData={handleMentionedUser} GroupParticiapantsList={GroupMemberList} />
            </OutsideClickHandler>
          )}  

          {chatType === CHAT_TYPE_GROUP && GroupMemberList.length > 0 && MentionView && showEmojiState === true && (
            <MentionUserList handleMentionedData={handleMentionedUser} GroupParticiapantsList={GroupMemberList} />
          )}
          {remainingLenthCall(_toArray(_get(typingMessage, "value", "")).length)}
        
        </div>
      </div>
    </div>
  );
};

export default Caption;