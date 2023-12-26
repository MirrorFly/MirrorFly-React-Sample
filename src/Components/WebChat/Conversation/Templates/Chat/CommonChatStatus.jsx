import React from "react";
import { Menu, Translate } from "../../../../../assets/images";
import DropDownAction from "../Common/DropDownAction";
import { useSelector } from "react-redux";

const CommonChatStatus = (props = {}) => {
  const {
    msgId = "",
    caption = "",
    handleDropDown, //click
    isSender = false,
    forward = false,
    uploadStatus = 0,
    messageInfoOptions,
    sentMessageToParent, //click
    dropDownStatus = false,
    msgType = "",
    chatType = "",
    favouriteStatus,
    pageType,
    messageObject,
    isTranslatable,
    isEnableTranslate,
    handleTranslateLanguage,
    messageType
  } = props;
  const mediaDropDownState = useSelector((state) => state.mediaDropDownData);
 
  return (
    <React.Fragment>
      {((messageType != "meet" && uploadStatus === 2 )|| messageType == "meet") && !forward && pageType === "conversation" && (
        <div className={`${isTranslatable && isEnableTranslate? "drop-lg"  : "" } message-dropdown-menu`}>
          <span className="message-dropdown">
            {(isEnableTranslate && isSender && isTranslatable) && caption !== "" && <span onClick={() => handleTranslateLanguage(msgId,messageObject)} className="translateIcon"> <Translate /></span>}
            <span className="actionDrop" onClick={handleDropDown}></span>
            <i>
              <Menu />
            </i>
          </span>
          {dropDownStatus && mediaDropDownState[msgId] && mediaDropDownState[msgId]?.dropDownStatus && (
            <DropDownAction
              msgid={msgId}
              isSender={isSender}
              handleDropDown={handleDropDown}
              messageAction={sentMessageToParent}
              messageInfoOptions={messageInfoOptions}
              msgType={msgType}
              chatType={chatType}
              favouriteStatus={favouriteStatus}
              messageObject={messageObject}
            />
          )}
        </div>
      )}
    </React.Fragment>
  );
};

export default CommonChatStatus;
