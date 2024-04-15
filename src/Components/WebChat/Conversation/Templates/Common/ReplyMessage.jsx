import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ChatContactImg,  ChatAudioRecorder, ChatAudioReceiver2, ImgFavicon } from '../../../../../assets/images';
import { displayNameFromRoster, getDisplayNameFromGroup, isSingleChat, isTextMessage } from '../../../../../Helpers/Chat/ChatHelper';
import { handleMentionedUser, isLocalUser } from "../../../../../Helpers/Chat/User";
import { getThumbBase64URL, handleScheduledTimeFormat, millisToMinutesAndSeconds } from "../../../../../Helpers/Utility";
import { getExtension } from "../../../Common/FileUploadValidation";
import ImageComponent from '../../../Common/ImageComponent';
import { getFromLocalStorageAndDecrypt } from "../../../WebChatEncryptDecrypt";
import GoogleMapMarker from "../Common/GoogleMapMarker";
import getFileFromType from "./getFileFromType";


const maximumCaptionLimit=90;

const ImageReply = React.memo(({ file_url, caption }) => {
    const token = getFromLocalStorageAndDecrypt('token');
    return (
        <ImageComponent
            chattype={null}
            temporary={false}
            classProps={{ 'webchat-conver-image': true }}
            userToken={token}
            imageToken={file_url}
            imageType={"chatimages"}
            caption={caption}
        />
    )
})

const VideoReply = React.memo(({ thumb_image, caption }) => {
    const responseURL = `data:image/png;base64,${thumb_image}`;
    return (
       <img className={`webchat-conver-image ${caption === "" ? "no-caption" : ""}`} src={responseURL} alt="chat-img" />
    )
})

const filterProfileFromRoster = (rosterData, messageFrom) => {
    const userDetails = rosterData.find((profile) => {
        const rosterJid = (profile.username) ? profile.username : profile.userId;
        return messageFrom === rosterJid
    })
    return displayNameFromRoster(userDetails, messageFrom)
}

export default React.memo(({ msgId, viewOriginalMessage, groupMemberDetails, chatType }) => {
    let callRefSpan = React.createRef();
    const [overflowActive , setOverflowActive] = useState(false);
    const isEllipsisActive = (replyMsgid) => {
        return replyMsgid.offsetHeight < replyMsgid.scrollHeight || replyMsgid.offsetWidth < replyMsgid.scrollWidth;
    }
    const replyMessageDetail = useSelector(state => {
        if (!state?.replyMessageData?.data) return {};
        return {
            replyMessageData: state.replyMessageData.data.find(msg => (msg && msg.replyMsgId === msgId)),
            rosterData: state.rosterData?.data,
            vCardData: state.vCardData,
        }
    });
    useEffect(() => {
        setOverflowActive(isEllipsisActive(callRefSpan))
    },[overflowActive,replyMessageDetail]);
   
    
    const { replyMessageData, vCardData } = replyMessageDetail || {}
    if (!replyMessageData) {
        return null
    }

    const { replyMsgId, fromUserId: messageFrom, groupId: messageFromGroup, replyMsgContent: { message, message_type, media = {}, mentionedUsersIds = [],
        location: { latitude, longitude } = {},
        contact: { name } = {} } } = replyMessageData 
    const { userId = "" } = vCardData?.data;
    const { fileName, duration, caption = "", audioType,thumb_image } = media;
    const getDisplayName = () => {
        let fromId = messageFrom;
        if (chatType === 'groupchat') { 
            if (userId === messageFromGroup) { fromId = messageFromGroup; }
        }
        if (isLocalUser(fromId)) return 'You';
        if (isSingleChat(chatType)) {
            const { rosterData } = replyMessageDetail || {}
            return filterProfileFromRoster(rosterData, messageFrom)
        }
        const { nameToDisplay } = getDisplayNameFromGroup(messageFrom ? messageFrom : messageFromGroup, groupMemberDetails);
        return nameToDisplay;
    }
    const fileExtension = getExtension(fileName);
    const placeholder = getFileFromType(null, fileExtension);
    const scheduledon = handleScheduledTimeFormat(replyMessageData?.replyMsgContent?.meet?.scheduledDateTime);

    const getReplyCaption = (mediaCaption = "") => mediaCaption?.length > maximumCaptionLimit ? mediaCaption.substring(0, maximumCaptionLimit).concat('...') : mediaCaption;
    return (
        <div className="reply-container" onClick={(event) => {
            event.stopPropagation();
            viewOriginalMessage(replyMsgId, msgId)
        }}>
            <div className="reply-text-message ">
                <span className="sender-name">{getDisplayName()}</span>
                {isTextMessage(message_type) && 
                    <span id={`reply-${msgId}`}
                        ref={element => callRefSpan = element }
                        className="sender-sends"
                    >
                        <span dangerouslySetInnerHTML={{__html: handleMentionedUser(getReplyCaption(message), mentionedUsersIds, false )}}></span>
                    </span>
                }
                {overflowActive ? <span className="sender-sends">...</span> : ""}
                {message_type === 'image' && 
                    <span className="sender-sends ReplyCamera"> 
                        <span dangerouslySetInnerHTML={{__html: caption === '' ?  "Photo" : handleMentionedUser(getReplyCaption(caption), mentionedUsersIds, false)}}></span>
                    </span>
                }
                {message_type === 'video' && 
                    <span className="sender-sends ReplyVideo"> 
                        <span dangerouslySetInnerHTML={{__html: caption === '' ? "Video" :  handleMentionedUser(getReplyCaption(caption), mentionedUsersIds, false)}}></span>
                    </span>
                }
                {message_type === 'audio' && < span className="sender-sends AudioMessage Recorded">{millisToMinutesAndSeconds(duration)}</span>}
                {message_type === 'file' && <span className="sender-sends filename">{fileName}</span>}
                {message_type === 'contact' && <span className="sender-sends ReplyContact">{name}</span>}
                {message_type === 'location' && <span className="sender-sends location"> Location</span>}
                {message_type === 'meet' && <span className="sender-sends" style={{textDecoration:"underline"}}> {scheduledon}</span>}

            </div>
            {!isTextMessage(message_type) &&
                <div className={`reply-message-type ${message_type === 'audio'  ? "audio" : ""} ${message_type === 'meet'  ? "meet" : ""}`}>
                    {message_type === 'image' && <img src={getThumbBase64URL(thumb_image)} className={`webchat-conver-image ${caption === "" ? "no-caption" : ""}`} alt="reply message" /> }
                    {message_type === 'audio' && 
                    <span className="webchat-conver-image">
                        <i className="audio-icon">{audioType !== "recording" ? <ChatAudioReceiver2 /> : <ChatAudioRecorder /> }</i>
                    </span>
                    }
                    {message_type === 'video' && <img src={getThumbBase64URL(thumb_image)} className={`webchat-conver-image ${caption === "" ? "no-caption" : ""}`} alt="reply message" /> }
                    {message_type === 'file' && <span className="webchat-conver-image"><i className="doc-icon"><img alt="file" src={placeholder} /></i></span>}
                    {message_type === 'contact' && <img src={ChatContactImg} alt=""/>}
                    {message_type === 'location' && <span className="webchat-conver-image no-caption"><GoogleMapMarker latitude={latitude} longitude={longitude} /></span>}
                    {message_type === 'meet' &&  <img className="mirrorfly_meeting_logo" src={ImgFavicon} alt="Mirrorfly Video Call" />}
                </div>
            }
        </div>
    )
})
