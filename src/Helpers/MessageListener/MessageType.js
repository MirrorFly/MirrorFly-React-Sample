import MessageHandler from './MessageHandler'

const MessageType = {
    'composing':MessageHandler.Composing,
    'gone':()=>{},
    'carbonSentMessage':()=>{},
    'carbonSentAcknowledge':()=>{},
    'carbonSentSeen':()=>{},
    'block_user':()=>{},
    'unblock_user':()=>{},
    'carbonSentRecall':()=>{},
    'carbonReceiveMessage':()=>{},
    'carbonComposing':()=>{},
    'carbonGone':()=>{},
    'carbonReceive':()=>{},
    'carbonSeen':()=>{},
    'carbonCallStatus':()=>{},
    'userBlocked':()=>{},
    'carbonUserBlocked':()=>{},
    'carbonReceiveAcknowledge':()=>{},
    'carbonGroupDelete':()=>{},
    'carbonReceiveRecall':()=>{},
    'carbonFavourite':()=>{},
    'carbonMessageClear':()=>{},
    'receiveMessage':()=>{},
    'acknowledge':()=>{},
    'groupDelete':()=>{},
    'messageClear':()=>{},
    'logout':()=>{},
    'favourite':()=>{},
    'receive':()=>{},
    'seen':()=>{},
    'recall':()=>{},
    'groupStatus':()=>{},
    'groupMemberRemove':()=>{}
}

export default MessageType;
