import { useState, useEffect } from "react";
import { isGroupChat } from "../Helpers/Chat/ChatHelper";

const currentTypingData = (chatType, data, fromUserId) => {
  if (isGroupChat(chatType)) {
    const displayNames = data.filter((ele) => ele.groupId && ele.groupId.indexOf(fromUserId) > -1 && ele.displayName);
    return displayNames.length && displayNames[0]?.displayName.concat(" typing...");
  }

  const userTypingData = data.find((ele) => ele.fromUserId.indexOf(fromUserId) > -1 && !ele.groupId);
  return userTypingData && "typing...";
};

/**
 * Get the user typing status
 * @param {*} param0
 */
export const useGetTypingStatus = ({ typingId, typingData, fromUserId, chatType }) => {
  const [messageTyping, setmessageTyping] = useState({
    isTyping: false,
    displayName: ""
  });

  useEffect(() => {
    if (typingId) {
      const displayName = currentTypingData(chatType, typingData, fromUserId);
      const isUserTyping = displayName ? true : false;
      const { displayName: prevDisplayName, isTyping: prevIsTyping } = messageTyping;
      if (prevDisplayName === displayName && prevIsTyping) {
        return;
      }
      setmessageTyping({
        isTyping: isUserTyping,
        displayName
      });
      return;
    }
  }, [fromUserId, typingId]);

  return messageTyping;
};
