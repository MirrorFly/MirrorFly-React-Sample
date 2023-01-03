import React from "react";
import { StarBlue, StarGray } from "../assets/images";
import { getConversationHistoryTime } from "./Utility";

export const getMessageTimeElement = (
  messageStatus,
  createdAt,
  favouriteStatus = 0,
  isSender = false,
  message_type = "",
  ) => {
  return (
    <span className="message-time">
      <span className="msg-sent-time">
      {favouriteStatus === 1 && <i className="starredIcon">{isSender ? <StarGray /> : <StarBlue />}</i>}
        {message_type !== "image" || message_type !== "video" ? (
          <>
            <span>{messageStatus}</span>
            <span>{getConversationHistoryTime(createdAt)}</span>
          </>
        ) : (
          <>
            {messageStatus}
            {getConversationHistoryTime(createdAt)}
          </>
        )}
      </span>
    </span>
  );
};
