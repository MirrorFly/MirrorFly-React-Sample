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

const Caption = (props = {}) => {
  const { onChangeCaption, media = {}, onClickSend, chatType } = props;
  const { caption = "" } = media;
  const [typingMessage, setTypingMessage] = useState({
    value: ""
  });
  const [selectedText, setSelectedTextState] = useState(null);
  const [position, setPosition] = useState(0);
  const setCursorPosition = (pos) => setPosition(pos);
  const [GroupMemberList, setGroupMemberlist ] = useState({});
  const [MentionView,setMentionView] = useState(false)
  const [mentionedUsersIds,setMentionedUsersId] = useState([])
  const groupList = useSelector((state)=>state.groupsMemberListData);
  const vcardData = useSelector((state)=>state.vCardData)

  const handleEmojiText = (emojiObject) => {
    const { value: typeVal } = typingMessage;
    let positionToUpdate = position;
    let text = "";
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
    if (_toArray(text).length <= CAPTION_CHARACTER_LIMIT) {
      setTypingMessage((prevState) => {
        setCursorPosition(positionToUpdate);
        setCaretPosition(document.getElementById("image-preview-typingContainer"), positionToUpdate);
        return {
          ...prevState,
          value: text
        };
      });
      onChangeCaption(media, text);
    }
  };
  
  const handleMentionedUser = (userId) => {      
    let rosterDataValue = getUserDetails(userId);
    let displayName = rosterDataValue.displayName;
    let positionToUpdate = position;
    let text = "";
    const messageDocContent = document.getElementById("image-preview-typingContainer");
    let startCursor = messageDocContent?.innerHTML?.substring(0, position);
    startCursor = startCursor.substring(0, startCursor.lastIndexOf("@"));
    const end = messageDocContent?.innerHTML?.substring(position);
    const uiHtml = `<span data-mentioned="${userId}" class="mentioned blue">@${displayName}</span> `;
    text = startCursor + uiHtml + end;
    positionToUpdate = position + uiHtml.length;
    setMentionView(false)
    let mentionedUsersId = mentionedUsersIds
    mentionedUsersId.push(userId);
      setMentionedUsersId(
        mentionedUsersId
      )

    if (_toArray(text).length <= CAPTION_CHARACTER_LIMIT) {
      setTypingMessage((prevState) => {
        setCursorPosition(positionToUpdate);
        setCaretPosition(document.getElementById("image-preview-typingContainer"), positionToUpdate);
  
        return {
          ...prevState,
          value: text,
        };
      });
      onChangeCaption(media, text, mentionedUsersIds);
    }
  };

  const handleDeleteMentionedUsers = (ele) =>{
    
    let mentionedIds = ele.dataset.mentioned;
    let mentionedUserId = [...mentionedUsersIds]

        var index = mentionedUserId.indexOf(mentionedIds);
    if (index > -1) {
      let mentionedId = mentionedUserId.filter((ind)=> ind !== index)
    setMentionedUsersId(
        [...mentionedId]
    )
    }   
  }

  const handleSearchList = (searchValue) => {         
    const GroupParticiapants = groupList.data.participants   
    const vCardUserId = vcardData.data.userId 
    const groupMemberlist = GroupParticiapants.filter(participants=>participants.userId !== vCardUserId);
    const searchResults = groupMemberlist.filter((ele) => ele.userProfile.nickName.toLowerCase().includes(searchValue.toLowerCase()))
    setGroupMemberlist(searchResults)
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
    const { value: targetVal } = target;
    setTypingMessage((prevState) => ({
      ...prevState,
      value:
        (prevState.value.length === 0 && targetVal.trim().length === 0) ||
          (targetVal.length === 1 && targetVal === "\n")
          ? ""
          : targetVal
    }));

    onChangeCaption(media, targetVal,mentionedUsersIds);
  };
const handleMentionList = (mentionView, grouplist) =>{
  setGroupMemberlist(grouplist)
  setMentionView(mentionView)
}
const handleEmptyContent = () =>{
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
    handleMessage({ target: { value: caption } }); //captionValue has been set
  }, [caption]);

  const { value = "" } = typingMessage;

  return (
    <div className="uploadImageCaption">
      <div className="message-area-container">
        <div className="message-area" id={`video-caption-${props?.uniqueId}`}>
          <WebChatEmoji onEmojiClick={handleEmojiText} />
          <ContentEditable
            handleMentionView={handleMentionList}
            captionCount={true}
            captionLength={value}
            chatType={chatType}
            handleSearchView={handleSearchList}
            id="image-preview-typingContainer"
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
            {(GroupMemberList.length > 0 && MentionView) ?
          <OutsideClickHandler onOutsideClick={() => handleMentionList(false , {})}>
            <MentionUserList handleMentionedData={handleMentionedUser} GroupParticiapantsList={GroupMemberList} />
          </OutsideClickHandler>
          : null
        }
          {remainingLenthCall(_toArray(_get(typingMessage, "value", "")).length)}
        
        </div>
      </div>
    </div>
  );
};

export default Caption;
