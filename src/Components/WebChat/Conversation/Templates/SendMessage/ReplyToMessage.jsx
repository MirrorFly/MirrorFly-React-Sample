import React, { Fragment, useEffect, useState } from "react";
import { connect } from 'react-redux';
import { popUpState } from '../../../../../Actions/ConversationAction';
import { Camera, CloseReply, Contact, DocumentIcon, Location, VideoIcon2, ChatAudioSender2, ChatAudioRecorderDark } from '../../../../../assets/images';
import { displayNameFromRoster, getDisplayNameFromGroup, isSingleChat, isTextMessage } from '../../../../../Helpers/Chat/ChatHelper';
import { isLocalUser } from "../../../../../Helpers/Chat/User";
import { ls } from '../../../../../Helpers/LocalStorage';
import { getThumbBase64URL, millisToMinutesAndSeconds } from "../../../../../Helpers/Utility";
import ImageComponent from '../../../Common/ImageComponent';
import GoogleMapMarker from "../Common/GoogleMapMarker";

const maximumCaptionLimit = 220;

const ImageReply = React.memo(({ file_url }) => {
    const token = ls.getItem('token');
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
    const { rosterData, closeReplyAction, replyMessage, groupMemberDetails,jid="" } = props
    const { fromUserId, msgBody: messageContent = {}, message: groupchatMessage = {}, publisherId, chatType } = replyMessage;
    let callRefSpan = React.createRef();
    let messageFrom = isSingleChat(chatType) ? fromUserId : publisherId;
    const { message="", message_type="", media = {},
            location: { latitude, longitude } = {},
            contact:{ name } = { } } = messageContent || groupchatMessage

    const { fileName, duration, caption , audioType , thumb_image} = media;
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

    const getReplyCaption = (mediaCaption) => mediaCaption.length > maximumCaptionLimit ? mediaCaption.substring(0, maximumCaptionLimit).concat('...') : mediaCaption;

    const isEllipsisActive = (e) => {
        return e.offsetHeight < e.scrollHeight || e.offsetWidth < e.scrollWidth;
      }
    useEffect(() => {
        setOverflowActive(isEllipsisActive(callRefSpan));
    },[callRefSpan]);
    return (
        <Fragment>
        <div id="reply-block-bottom" className="reply-block-bottom">
            <div className="reply-container">
                <div className={`reply-text-message ${isTextMessage(message_type) ? "text-message" : "" }`}>
                    <span className="sender-name" >{getDisplayName() ? getDisplayName() : "You" }</span>
                    {isTextMessage(message_type) && <span  ref={element => callRefSpan = element }  className="sender-sends"><span  dangerouslySetInnerHTML={{__html: getReplyCaption(message) }} ></span></span> }{overflowActive ? "..." : ""}
                    {message_type === 'image' && <span className="sender-sends"><span><i className="chat-camera"><Camera /></i><span>{caption === '' ?  "Photo" : getReplyCaption(caption)}</span></span></span>}
                    {message_type === 'video' && <span className="sender-sends">
                            <span>
                                <i className="chat-video">
                                    <VideoIcon2 />
                                </i>
                                {caption === '' ? `${millisToMinutesAndSeconds(duration)} Video` : getReplyCaption(caption)}
                            </span> </span>
                        }
                    {message_type === 'audio' && < span className="sender-sends">
                        <span><i className="chat-audio">
                            {audioType !== "recording" ? <ChatAudioSender2 /> : <ChatAudioRecorderDark />}
                            </i><span>{millisToMinutesAndSeconds(duration)}{" Audio "}
                            </span></span>
                    </span>}
                    {message_type === 'file' && <span className="sender-sends"><span><i className="chat-docu"><DocumentIcon /> </i><span>{fileName} </span></span></span>}
                    {message_type === 'contact' && <span className="sender-sends"><span><i className="chat-contact"><Contact /></i><span> {name}</span></span></span>}
                    {message_type === 'location' && <span className="sender-sends"><span><i className="chat-location"><Location /></i><span> Location</span></span></span>}
                </div>
                {!isTextMessage(message_type) &&
                <div className="reply-message-type">
                    {message_type === 'image' && 
                    <img src={getThumbBase64URL(thumb_image)} className={`webchat-conver-image ${caption === "" ? "no-caption" : ""}`} alt="reply message" />
                    }
                    {message_type === 'audio' && ""}
                    {message_type === 'video' && <img src={getThumbBase64URL(thumb_image)} className={`webchat-conver-image ${caption === "" ? "no-caption" : ""}`} alt="reply message" />}
                    {message_type === 'file' && ""
                    // TODO - Need to implement for ppt and pdf
                    // <span className="webchat-conver-image"><i className="doc-icon"><img alt="file" src={placeholder} /></i></span>
                    }
                    {message_type === 'contact' &&
                    <span className="webchat-conver-image"></span>
                    }
                    {message_type === 'location' && <span className="webchat-conver-image"><GoogleMapMarker latitude={latitude} longitude={longitude} /></span>}
                </div>
                }
            </div>
            <div className="RemoveReplay">
            <i><CloseReply onClick={() =>closeReplyAction(jid)} /></i>
        </div>
        </div>

        </Fragment>
    )
})

export default connect(null, {
    popUpState: popUpState
})(ReplyMessage);
