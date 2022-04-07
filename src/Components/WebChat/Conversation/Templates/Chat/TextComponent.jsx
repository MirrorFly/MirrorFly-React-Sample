import React from "react";
import renderHTML from "react-render-html";
import { convertTextToURL, getFormattedText } from "../../../../../Helpers/Utility";
import Translate from "./Translate";

const TextComponent = (props = {}) => {
  const { messageObject = {}, isSender = false, pageType } = props;
  const { msgBody = {} } = messageObject;
  const messageLink = convertTextToURL(msgBody.message);

  const isTranslated = () =>
    !isSender &&
    pageType === "conversation" &&
    msgBody?.translatedMessage &&
    Object.keys(msgBody.translatedMessage).length;

  return (
    <div className="message-text">
      <span>{msgBody ? renderHTML(getFormattedText(messageLink)) : null}</span>
      {isTranslated() && <Translate tMessage={msgBody?.translatedMessage} />}
    </div>
  );
};

export default TextComponent;
