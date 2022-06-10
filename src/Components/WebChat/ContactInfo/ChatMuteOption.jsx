import React, { useEffect, useState } from "react";
import { ChatMute, ChatMuteOff } from "../../../assets/images";
import CommonSwitch from "../../WebChat/Common/CommonSwitch";

const ChatMuteOption = (props = {}) => {
  const { isChatMute, handleChatMuteAction, chatId } = props;
  const [chatMuteState, setChatMuteState] = useState(isChatMute);
  useEffect(() => {
    const getMute = localStorage.getItem("tempMuteUser");
    let parserLocalStorage = getMute ? JSON.parse(getMute) : {};
    if (parserLocalStorage[chatId]) {
      setChatMuteState(true);
    } else {
      setChatMuteState(isChatMute);
    }
  }, [isChatMute]);
  return (
    <div className="about-no">
      <i className="MuteIcon">{!chatMuteState ? <ChatMuteOff /> : <ChatMute />}</i>
      <span className="Mutetext">{"Mute"}</span>
      <CommonSwitch handleClick={() => handleChatMuteAction(!isChatMute)} id={1} checked={chatMuteState} />
    </div>
  );
};

export default ChatMuteOption;
