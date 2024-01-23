import React, { Fragment, useEffect, useState } from "react";
import { connect } from 'react-redux';
import { popUpState } from '../../../../../Actions/ConversationAction';
import { Camera, CloseReply, Contact, DocumentIcon, Location, VideoIcon2, ChatAudioSender2, ChatAudioRecorderDark, ImgFavicon } from '../../../../../assets/images';
import { displayNameFromRoster, getDisplayNameFromGroup, isSingleChat, isTextMessage } from '../../../../../Helpers/Chat/ChatHelper';
import { handleMentionedUser, isLocalUser } from "../../../../../Helpers/Chat/User";
import { getThumbBase64URL, handleScheduledTimeFormat, millisToMinutesAndSeconds } from "../../../../../Helpers/Utility";
import ImageComponent from '../../../Common/ImageComponent';
import { getFromLocalStorageAndDecrypt } from "../../../WebChatEncryptDecrypt";
import GoogleMapMarker from "../Common/GoogleMapMarker";


const maximumCaptionLimit = 220;

const ImageReply = React.memo(({ file_url }) => {
    const token = getFromLocalStorageAndDecrypt('token');
    return (
        <ImageComponent
            chatType={null}
            temporary={false}
            classProps={{ 'webchat-conver-image': true }}
            userToken={token}
            imageToken={file_url}
            imageType={"chatimages"}
        />
    )
})

const VideoReply = React.memo(({ thumb_image }) => {
    const responseURL = `data:image/png;base64,${thumb_image}`;
    return (
        <img className='webchat-conver-image' src={responseURL} alt="chat-img" />
    )
});

const filterProfileFromRoster = (rosterData, messageFrom) => {
    const userDetails = rosterData.find((profile) => {
        const rosterJid = (profile.username) ? profile.username : profile.userId;
        return messageFrom === rosterJid
    });
    return displayNameFromRoster(userDetails, messageFrom)
}

const ReplyMessage = React.memo((props) => {
    const { rosterData, closeReplyAction, replyMessage, groupMemberDetails, jid="", showMention } = props;
    const { fromUserId, msgBody: messageContent = {}, message: groupchatMessage = {}, publisherId, chatType, msgBody: mentionedUsersIds = [] } = replyMessage;
    let callRefSpan = React.createRef();
    let messageFrom = isSingleChat(chatType) ? fromUserId : publisherId;
    const { message="", message_type="", media = {},
            location: { latitude, longitude } = {},
            contact:{ name } = { } } = messageContent || groupchatMessage

    const { fileName, duration, caption = "" , audioType , thumb_image} = media;

    const [overflowActive , setOverflowActive] = useState(false)
    useEffect(()=>{
        props.popUpState({
            name: 'smileyPopUp',
            smileyPopUp: {
                active: true
            }
        })
        return () =>{
            props.popUpState({
                name: 'smileyPopUp',
                smileyPopUp: {
                    active: false
                }
            })
        }
    },[])

    const getDisplayName = () => {
        if (isLocalUser(messageFrom)) return 'You'

        if (isSingleChat(chatType)) {
            return filterProfileFromRoster(rosterData, messageFrom)
        }
        const { nameToDisplay: senderName } = getDisplayNameFromGroup(messageFrom, groupMemberDetails);
        return senderName;
    }

    const getReplyCaption = (mediaCaption) => {
      return mediaCaption?.length > maximumCaptionLimit ? mediaCaption.substring(0, maximumCaptionLimit).concat('...') : mediaCaption;
    }
    
    const isEllipsisActive = (e) => {
        return e.offsetHeight < e.scrollHeight || e.offsetWidth < e.scrollWidth;
      }
    useEffect(() => {
        setOverflowActive(isEllipsisActive(callRefSpan));
    },[callRefSpan]);

    const scheduledon = handleScheduledTimeFormat(messageContent?.meet?.scheduledDateTime);

    return (
        <Fragment>
        {(showMention === false || showMention === undefined) && <div id="reply-block-bottom" className="reply-block-bottom">
            <div className="reply-container">
                <div className={`reply-text-message ${isTextMessage(message_type) ? "text-message" : "" }`}>
                    <span className="sender-name" >{getDisplayName() ? getDisplayName() : "You" }</span>
                    {isTextMessage(message_type) && 
                        <span
                         ref={element => callRefSpan = element }
                         className="sender-sends">
                            <span
                             className="reply_mention"
                             dangerouslySetInnerHTML={
                                {__html: handleMentionedUser(getReplyCaption(message), mentionedUsersIds.mentionedUsersIds, false,"blue")}
                                }
                            ></span>
                        </span>
                    }
                    {overflowActive ? "..." : ""}
                    {message_type === 'image' && 
                        <span
                         className="sender-sends">
                            <span>
                                <i className="chat-camera send-attac-icon"><Camera /></i>
                                <span
                                 className="reply_mention"
                                 dangerouslySetInnerHTML={
                                    { __html: handleMentionedUser(caption === '' ?  "Photo" : getReplyCaption(caption), mentionedUsersIds.mentionedUsersIds, false,"blue")}
                                    }
                                ></span>
                            </span>
                        </span>
                    }
                    {message_type === 'video' && <span className="sender-sends">
                            <span>
                                <i className="chat-video send-attac-icon">
                                    <VideoIcon2 />
                                </i>
                                <span
                                 className="reply_mention" 
                                 dangerouslySetInnerHTML={
                                    { __html: caption === '' ? `${millisToMinutesAndSeconds(duration)} Video` : handleMentionedUser(getReplyCaption(caption), mentionedUsersIds.mentionedUsersIds, false,"blue")}
                                    }
                                ></span>
                            </span> </span>
                        }
                    {message_type === 'audio' && < span className="sender-sends">
                        <span><i className="chat-audio send-attac-icon">
                            {audioType !== "recording" ? <ChatAudioSender2 /> : <ChatAudioRecorderDark />}
                            </i><span>{millisToMinutesAndSeconds(duration)}{" Audio "}
                            </span></span>
                    </span>}
                    {message_type === 'file' && <span className="sender-sends"><span><i className="chat-docu send-attac-icon"><DocumentIcon /> </i><span>{fileName} </span></span></span>}
                    {message_type === 'contact' && <span className="sender-sends"><span><i className="chat-contact send-attac-icon"><Contact /></i><span> {name}</span></span></span>}
                    {message_type === 'location' && <span className="sender-sends"><span><i className="chat-location send-attac-icon"><Location /></i><span> Location</span></span></span>}
                    {message_type === 'meet' && <span className="sender-sends meetReply"> {scheduledon}</span>}

                </div>
                {!isTextMessage(message_type) &&
                    <div className="reply-message-type">
                        {message_type === 'image' && 
                        <img src={getThumbBase64URL(thumb_image)} className={`webchat-conver-image ${caption === "" ? "no-caption" : ""}`} alt="reply message" />
                        }
                        {message_type === 'audio' && ""}
                        {message_type === 'video' && <img src={getThumbBase64URL(thumb_image)} className={`webchat-conver-image ${caption === "" ? "no-caption" : ""}`} alt="reply message" />}
                        {message_type === 'file' && ""
                        // Need to implement for ppt and pdf
                        // <span className="webchat-conver-image"><i className="doc-icon"><img alt="file" src={placeholder} /></i></span>
                        }
                        {message_type === 'contact' &&
                        <span className="webchat-conver-image"></span>
                        }
                        {message_type === 'location' && <span className="webchat-conver-image"><GoogleMapMarker latitude={latitude} longitude={longitude} /></span>}
                        {message_type === 'meet' &&  <img className="mirrorfly_meeting_logo" src={ImgFavicon} alt="Mirrorfly Video Call" />}
                    </div>
                }
            </div>
            <div className="RemoveReplay">
                <i><CloseReply onClick={() =>closeReplyAction(jid)} /></i>
            </div>
        </div>}

        </Fragment>
    )
})

export default connect(null, {
    popUpState: popUpState
})(ReplyMessage);
