import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ChatContactImg,  ChatAudioRecorder, ChatAudioReceiver2 } from '../../../../../assets/images';
import { displayNameFromRoster, getDisplayNameFromGroup, isSingleChat, isTextMessage } from '../../../../../Helpers/Chat/ChatHelper';
import { isLocalUser } from "../../../../../Helpers/Chat/User";
import { ls } from '../../../../../Helpers/LocalStorage';
import { getThumbBase64URL, millisToMinutesAndSeconds } from "../../../../../Helpers/Utility";
import { getExtension } from "../../../Common/FileUploadValidation";
import ImageComponent from '../../../Common/ImageComponent';
import GoogleMapMarker from "../Common/GoogleMapMarker";
import getFileFromType from "./getFileFromType";

const maximumCaptionLimit=90;

const ImageReply = React.memo(({ file_url, caption }) => {
    const token = ls.getItem('token');
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
   
    
    const { replyMessageData } = replyMessageDetail || {}
    if (!replyMessageData) {
        return null
    }

    const { replyMsgId, fromUserId: messageFrom, replyMsgContent: { message, message_type, media = { },
        location: { latitude, longitude } = {},
        contact: { name } = {} } } = replyMessageData 

    const { fileName, duration, caption, audioType,thumb_image } = media;
    const getDisplayName = () => {
        if (isLocalUser(messageFrom)) return 'You';
        if (isSingleChat(chatType)) {
            const { rosterData } = replyMessageDetail || {}
            return filterProfileFromRoster(rosterData, messageFrom)
        }
        const { nameToDisplay } = getDisplayNameFromGroup(messageFrom, groupMemberDetails);
        return nameToDisplay;
    }

    const fileExtension = getExtension(fileName);
    const placeholder = getFileFromType(null, fileExtension);

    const getReplyCaption = (mediaCaption) => mediaCaption.length > maximumCaptionLimit ? mediaCaption.substring(0, maximumCaptionLimit).concat('...') : mediaCaption;
    return (
        <div className="reply-container" onClick={(event) => {
            event.stopPropagation();
            viewOriginalMessage(replyMsgId, msgId)
        }}>
            <div className="reply-text-message ">
                <span className="sender-name">{getDisplayName()}</span>
                {isTextMessage(message_type) && <span id={`reply-${msgId}`}
                ref={element => callRefSpan = element }
                className="sender-sends">
                <span dangerouslySetInnerHTML={{__html: getReplyCaption(message) }} ></span> </span> }
                {overflowActive ? <span className="sender-sends">...</span> : ""}
                {message_type === 'image' && <span className="sender-sends ReplyCamera">{caption === '' ?  "Photo" : getReplyCaption(caption)}</span>}
                {message_type === 'video' && <span className="sender-sends ReplyVideo">{caption === '' ? "Video" :  getReplyCaption(caption)}</span>}
                {message_type === 'audio' && < span className="sender-sends AudioMessage Recorded">{millisToMinutesAndSeconds(duration)}</span>}
                {message_type === 'file' && <span className="sender-sends filename">{fileName}</span>}
                {message_type === 'contact' && <span className="sender-sends ReplyContact">{name}</span>}
                {message_type === 'location' && <span className="sender-sends location"> Location</span>}

            </div>
            {!isTextMessage(message_type) &&
                <div className={`reply-message-type ${message_type === 'audio' ? "audio" : ""}`}>
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
                </div>
            }
        </div>
    )
})
