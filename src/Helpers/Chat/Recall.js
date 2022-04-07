export const updateRecall = (newMessage, messageArray = []) => {
    return messageArray.map(messageObject => {
        if (newMessage.msgId.includes(messageObject.msgId)) {
            messageObject['deleteStatus'] = 1;
        }
        return messageObject;
    })
}


export const checkMessageStatus = (participants) => {

    const receiveToAll = participants.find(participant => participant.msgStatus === 0)
    if (receiveToAll) {
        return 0
    }
    const seenToAll = participants.find(participant => participant.msgStatus === 1)
    if (seenToAll) {
        return 1
    }
    return 2
}

export const updateRecentStatus = (newMessage, messageArray = []) => {
    const { msgId, participants } = newMessage
    return messageArray.map(messageObject => {
        if (messageObject.msgId === msgId) {
            return {
                ...messageObject,
                status: checkMessageStatus(participants)
            }
        }
        return messageObject;
    })
}

export const emptyMessage = (newMessage, messageArray = []) => {
    const { msgIds = [] } = newMessage
    return messageArray.map(messageObject => {
        if (msgIds.indexOf(messageObject.msgId) !== -1) {
            return {
                ...messageObject,
                MessageType: 'text',
                deleteStatus: 0,
                createdAt:'',
                msgbody: {
                    message_type: "text",
                    message: ''
                },
                msgType: newMessage.msgType,
                lastMsgId: newMessage.lastMsgId
            }
        }
        return messageObject;
    })
}
