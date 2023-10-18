import SDK from '../../../../SDK';
import Translate from "./Translate";
import React, { Fragment, useEffect, useState } from "react";
import Store from "../../../../../Store";
import { useSelector, connect } from "react-redux";
import { showModal } from "../../../../../Actions/PopUp";
import { callIntermediateScreen } from "../../../../../Actions/CallAction";
import { IconMeetingVideo, ImgFavicon } from "../../../../../assets/images";
import { CALL_STATUS_CONNECTED, CALL_STATUS_RECONNECT } from "../../../../../Helpers/Call/Constant";
import {
  blockOfflineAction,
  convertTextToURL,
  getFormattedText,
  getSiteDomain,
  handleScheduledTimeFormat,
  isCallLink
} from "../../../../../Helpers/Utility";
import {  handleMentionedUser } from '../../../../../Helpers/Chat/User';

const HtmlToReactParser = require('html-to-react').Parser;
const htmlToReactParser = new HtmlToReactParser();

const MeetComponent = (props = {}) => {
  const { messageObject = {}, isSender = false, pageType, vCardData = {}} = props;
  const { msgBody = {} } = messageObject;
  const { data = {} } = vCardData;
  const messageLink = convertTextToURL(msgBody?.meet?.link);
  const { data: conferenceData = {} } = useSelector((state) => state.showConfrenceData || {});
  const { data: callData = {} } = useSelector((state) => state.callIntermediateScreen || {});
  const [callLinkMessageBody, setCallLinkMessageBody] = useState({
    prevMeetText:null,
    meetLink:null,
    endMeetText:null,
    scheduledon:null
  })
  const isTranslated = () =>
    !isSender &&
    pageType === "conversation" &&
    msgBody?.translatedMessage &&
    Object.keys(msgBody.translatedMessage).length;

  const renderMessageBody = () => {
    const mentionedUsers = msgBody && msgBody.mentionedUsersIds ? msgBody.mentionedUsersIds : [];
    const formattedText = htmlToReactParser.parse(handleMentionedUser(getFormattedText(messageLink), mentionedUsers, !isSender && data.userId, null, messageObject.chatType));
    const result = msgBody ? formattedText : null;
    return result;
  };

  const subscribeToCall = async(meetLink) => {
    if (blockOfflineAction()) return "";  
    const callLink = meetLink?.split(`${getSiteDomain()}/`)[1];
      if (callData && (conferenceData.callStatusText === CALL_STATUS_CONNECTED ||conferenceData.callStatusText === CALL_STATUS_RECONNECT)) {
         const roomLink = await SDK.getCallLink();
        if (meetLink.includes(roomLink.data)) {
          props.handleShowCallScreen();
        } else {
          Store.dispatch(
            showModal({
              open: true,
              modelType: "CallConfirm",
              newCallLink: callLink
            })
          );
        }
      } else {
        Store.dispatch(callIntermediateScreen({ show: true, link: callLink }));
      }  
  };

  useEffect(() =>{
      const urlRegex = /https?:\/\/\S+/g;
      const ArrayOfLinkSplit = msgBody?.meet?.link && msgBody.meet.link?.split(urlRegex) || [];
      const meetLinkUrl =  msgBody?.meet?.link && msgBody.meet.link?.match(urlRegex) || [];
      const scheduledon = handleScheduledTimeFormat(msgBody?.meet?.scheduledDateTime);
      setCallLinkMessageBody({
        prevMeetText:ArrayOfLinkSplit[0],
        meetLink:meetLinkUrl[0],
        endMeetText:ArrayOfLinkSplit[1],
        scheduledon:scheduledon
      })
  },[])

  return (
    <div className='meetinglink'>
    <Fragment> 
      {callLinkMessageBody.meetLink != null && isCallLink(callLinkMessageBody.meetLink) ? (
        <div className="message_meeting_link">
          <button type="button" className="meetingL_link_share" onClick={() => subscribeToCall(callLinkMessageBody.meetLink)}>
            <div className="meeting_link_detail">
              <div>
                <span className='textmessages'>{callLinkMessageBody.prevMeetText}</span> 
                <span  className="meeting_ink">{callLinkMessageBody.meetLink}</span>
                <span className='textmessages'>{callLinkMessageBody.endMeetText}</span>
              </div>
            </div>
            {msgBody?.meet?.scheduledDateTime != 0 ? (
              <div className='meeting_center_description'> 
                <div className='meeting_center_left'>
                  <div className='scheduled_label'>Scheduled on</div> 
                  <div className='scheduled_message'>{callLinkMessageBody?.scheduledon}</div>
                </div>
                <div className="call_icon">
                      <IconMeetingVideo />
                </div>  
            </div>
            ):(
              <div className='meeting_center_description'> 
              <span>Mirrorfly video Call link</span>
              <span className="call_icon">
                  <IconMeetingVideo />
                </span>  
              </div>
            )}
            
            <div className="meeting_desc">
              <img className="mirrorfly_meeting_logo" src={ImgFavicon} alt="Mirrorfly Video Call" />
              <span className="call_details">Join video meeting</span> 
            </div>
            {!!isTranslated() && <Translate tMessage={msgBody?.translatedMessage} />}
            <div className="company_detais">
            </div>
          </button>
        </div>
      ) : (
        <div className="message-text">
          <span>{renderMessageBody()}</span>
          {!!isTranslated() && <Translate tMessage={msgBody?.translatedMessage} />}
        </div>
      )}
    </Fragment>
    </div>
  );
};

const mapStateToProps = (state, props) => {
  return {
    vCardData:state.vCardData,
    groupsMemberListData: state.groupsMemberListData
  }
}
export default connect(mapStateToProps, null)(MeetComponent);
