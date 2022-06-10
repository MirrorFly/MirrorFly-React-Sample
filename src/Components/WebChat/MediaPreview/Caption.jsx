import React, { useEffect, useState } from "react";
import _get from "lodash/get";
import _toArray from "lodash/toArray";
import WebChatEmoji from "../WebChatEmoji";
import ContentEditable from "../Conversation/Templates/Common/ContentEditable";
import { ALLOWED_KEY_CODES, CAPTION_CHARACTER_LIMIT } from "../../../Helpers/Constants";
import { setCaretPosition, removeMoreNumberChar } from "../../../Helpers/Chat/ContentEditableEle";

const Caption = (props = {}) => {
  const { onChangeCaption, media = {}, onClickSend } = props;
  const { caption = "" } = media;
  const [typingMessage, setTypingMessage] = useState({
    value: ""
  });
  const [selectedText, setSelectedTextState] = useState(null);
  const [position, setPosition] = useState(0);
  // const setCursorPosition = (pos) => setPosition(pos);

  //cursor point set
  const setCursorPosition = (pos = 0) => {
    const { value: typeingValue = "" } = typingMessage;
    if (typeingValue) {
      const valueLength = typeingValue.length;//get typing length
      setCaretPosition(document.getElementById("image-preview-typingContainer"), +valueLength);
      setPosition(pos);
    } else {
      setPosition(pos);
    }
  }

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

    onChangeCaption(media, targetVal);
  };

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
            captionCount={true}
            captionLength={value}
            id="image-preview-typingContainer"
            handleMessage={handleMessage}
            handleSendTextMsg={onClickSend}
            onInputListener={inputListenerHandler}
            handleOnFocus={handleOnFocus}
            placeholder={"Add a caption"}
            setCursorPosition={setCursorPosition}
            setSelectedText={setSelectedText}
            onKeyDownListner={handleOnKeyDownListner}
            html={removeMoreNumberChar(CAPTION_CHARACTER_LIMIT, value)}
          />
          {remainingLenthCall(_toArray(_get(typingMessage, "value", "")).length)}
        </div>
      </div>
    </div>
  );
};

export default Caption;
