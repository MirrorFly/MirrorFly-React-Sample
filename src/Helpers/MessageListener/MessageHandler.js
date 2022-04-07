class MessageHandler {
    Composing = (response) => {
        console.log(response,'componsing working in handler')
    }
    Gone = () => { }
    CarbonSentMessage = () => { }
    CarbonSentAcknowledge = () => { }
    CarbonSentSeen = () => { }
    BlockUser = () => { }
    UnblockUser = () => { }
    CarbonSentRecall = () => { }
    CarbonReceiveMessage = () => { }
    CarbonComposing = () => { }
    CarbonGone = () => { }
    CarbonReceive = () => { }
    CarbonSeen = () => { }
    CarbonCallStatus = () => { }
    UserBlocked = () => { }
    CarbonUserBlocked = () => { }
    CarbonReceiveAcknowledge = () => { }
    CarbonGroupDelete = () => { }
    CarbonReceiveRecall = () => { }
    CarbonFavourite = () => { }
    CarbonMessageClear = () => { }
    ReceiveMessage = () => { }
    Acknowledge = () => { }
    GroupDelete = () => { }
    MessageClear = () => { }
    Logout = () => { }
    Favourite = () => { }
    Receive = () => { }
    Seen = () => { }
    Recall = () => { }
    GroupStatus = () => { }
    GroupMemberRemove = () => { }
}

export default new MessageHandler()
