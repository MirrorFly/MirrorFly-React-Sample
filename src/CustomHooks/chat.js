import { useState, useEffect } from 'react';
import { getMsgStatusInOrder, isGroupChat } from '../Helpers/Chat/ChatHelper';

/**
 * Custom hooks to get the status in the order even If we receive the status in different order
 * @param {*} newStatus - status to update
 * @param {*} currentMsgId - component message ID
 * @param {*} newMsgId - new status message iD
 */
export const useGetUpdatedMsgStatus = ({messageStatus, messageId, messageDataMsgStatus, messageDataMsgId, chatUserType, groupChatStatusId, groupChatStatusData = {}}) => {
    const [status, setStatus] = useState(messageStatus);
    // New message status take from the main props msgStatus
    // by finding the changes of main props messageId
    useEffect(() => {
        let statusToUpdate = messageStatus;
        // sometimes message data details update first, then updates the recent & conversation value
        // that's why check condition here & take the messages base on order
        if(messageId === messageDataMsgId){
            statusToUpdate = getMsgStatusInOrder(messageStatus, messageDataMsgStatus);
        }
        setStatus(statusToUpdate);
    }, [messageId]);
    // Updated message status will be received in messageData props
    // that's take updated message status from the messageData props
    // should match the main props message Id & messageData props msgId to update the status next level
    useEffect(() => {
        if(messageId === messageDataMsgId && typeof messageDataMsgStatus !== 'undefined'){
            const statusToUpdate = getMsgStatusInOrder(status, messageDataMsgStatus);
            setStatus(statusToUpdate);
        }
    }, [messageDataMsgStatus, messageDataMsgId]);

    useEffect(() => {
        const { msgId, status: newStatus } = groupChatStatusData;
        if(isGroupChat(chatUserType) && messageId === msgId){
            setStatus(newStatus);
        }
    }, [groupChatStatusId])
  
    return status;
}

const currentTypingData = (chatType, data, fromUserId) => {
    if (isGroupChat(chatType)) {
      const displayNames = data
        .filter((ele) => ele.groupId && ele.groupId.indexOf(fromUserId) > -1 && ele.displayName)
        return displayNames.length && displayNames[0]?.displayName.concat(" typing...");
    }
    
    const userTypingData = data.find((ele) => ele.fromUserId.indexOf(fromUserId) > -1 && !ele.groupId);
    return userTypingData && "typing...";
};

/**
 * Get the user typing status
 * @param {*} param0 
 */
export const useGetTypingStatus = ({typingId, typingData, fromUserId, chatType}) => {
    const [messageTyping, setmessageTyping] = useState({
        isTyping: false,
        displayName: ""
    });

    useEffect(() => {
        if (typingId) {
            const displayName = currentTypingData(chatType, typingData, fromUserId)
            const isUserTyping = displayName ? true : false
            const { displayName: prevDisplayName, isTyping: prevIsTyping } = messageTyping
            if (prevDisplayName === displayName && prevIsTyping) {
                return
            }
            setmessageTyping({
                isTyping: isUserTyping,
                displayName
            })
            return
        }
    }, [fromUserId, typingId]);

    return messageTyping;
}
