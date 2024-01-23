import React from "react";
import { StarBlue, StarGray } from "../assets/images";
import { EDITED_LABEL } from "./Chat/Constant";
import { getConversationHistoryTime } from "./Utility";

export const getMessageTimeElement = (
  messageStatus,
  createdAt,
  favouriteStatus = 0,
  isSender = false,
  message_type = "",
  isEditedMessage = 0
  ) => {
  return (
    <span className="message-time">
      <span className="msg-sent-time">
      {favouriteStatus === 1 && <i className="starredIcon">{isSender ? <StarGray /> : <StarBlue />}</i>}
        {message_type !== "image" || message_type !== "video" ? (
          <>
            <span>{messageStatus}</span>
            {isEditedMessage === 1 && <span>{EDITED_LABEL}</span>}&nbsp;
            <span>{getConversationHistoryTime(createdAt)}</span>
          </>
        ) : (
          <>
            {messageStatus}
            {isEditedMessage === 1 && <span>{EDITED_LABEL}</span>}&nbsp;
            {getConversationHistoryTime(createdAt)}
          </>
        )}
      </span>
    </span>
  );
};
