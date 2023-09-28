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
  isCallLink
} from "../../../../../Helpers/Utility";
import {  handleMentionedUser } from '../../../../../Helpers/Chat/User';

const HtmlToReactParser = require('html-to-react').Parser;
const htmlToReactParser = new HtmlToReactParser();

const TextComponent = (props = {}) => {
  const { messageObject = {}, isSender = false, pageType, vCardData = {}} = props;
  const { msgBody = {} } = messageObject;
  const { data = {} } = vCardData;
  const messageLink = convertTextToURL(msgBody.message);
  const { data: conferenceData = {} } = useSelector((state) => state.showConfrenceData || {});
  const { data: callData = {} } = useSelector((state) => state.callIntermediateScreen || {});
  const [callLinkMessageBody, setCallLinkMessageBody] = useState({
    prevMeetText:null,
    meetLink:null,
    endMeetText:null,
    prevtextMentionuser:null,
    endtextMentionuser:null
  })
  const isTranslated = () =>
    !isSender &&
    pageType === "conversation" &&
    msgBody?.translatedMessage &&
    Object.keys(msgBody.translatedMessage).length;

  const renderMessageBody = (inputData, mentionedLst) => {
    let mentionedUsers;
    const textData = inputData ? inputData : messageLink;
    if (msgBody && msgBody.mentionedUsersIds) {
      mentionedUsers = mentionedLst ? mentionedLst : msgBody.mentionedUsersIds;
    } else {
      mentionedUsers = [];
    }
    const formattedText = htmlToReactParser.parse(handleMentionedUser(getFormattedText(textData), mentionedUsers, !isSender && data.userId));
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
      const ArrayOfLinkSplit = msgBody.message && msgBody.message?.split(urlRegex) || [];
      const meetLinkUrl =  msgBody.message && msgBody.message?.match(urlRegex) || [];
      if(meetLinkUrl[0] && isCallLink(meetLinkUrl[0])){
        const prevMeetTextMentionsLgn = ArrayOfLinkSplit[0]?.match(/@\[\?]/g)?.length;
        const prevMeetTextMentionsFLgn = prevMeetTextMentionsLgn ? prevMeetTextMentionsLgn : 0;
        const endMeetTextMentionsLgn = ArrayOfLinkSplit[1]?.match(/@\[\?]/g)?.length;
        const prevMeetTextMentionsLst = msgBody.mentionedUsersIds && msgBody.mentionedUsersIds.slice(0 , prevMeetTextMentionsFLgn)
        const endMeetTextMentionsLst = msgBody.mentionedUsersIds && msgBody.mentionedUsersIds.slice(prevMeetTextMentionsFLgn , (prevMeetTextMentionsFLgn + endMeetTextMentionsLgn))
        setCallLinkMessageBody({
          prevMeetText:ArrayOfLinkSplit[0],
          meetLink:meetLinkUrl[0],
          endMeetText:ArrayOfLinkSplit[1],
          prevtextMentionuser:prevMeetTextMentionsLst,
          endtextMentionuser:endMeetTextMentionsLst,

        })
      }
  },[])

  return (
    <div className='meetinglink'>
    <Fragment> 
      {callLinkMessageBody.meetLink != null && isCallLink(callLinkMessageBody.meetLink) ? (
        <div className="message_meeting_link">
          <button type="button" className="meetingL_link_share" onClick={() => subscribeToCall(callLinkMessageBody.meetLink)}>
            <div className="meeting_link_detail">
              <div>
                <span className='textmessages'>{callLinkMessageBody.prevMeetText && renderMessageBody(callLinkMessageBody.prevMeetText,callLinkMessageBody.prevtextMentionuser)}</span> 
                <span  className="meeting_ink">{callLinkMessageBody.meetLink}</span>
                <span className='textmessages'>{callLinkMessageBody.endMeetText && renderMessageBody(callLinkMessageBody.endMeetText, callLinkMessageBody.endtextMentionuser)}</span>
              </div>
            </div>
            <div className='meeting_center_description'> 
                  <span>Mirrorfly video Call link</span>
                  <span className="call_icon">
                      <IconMeetingVideo />
                    </span> 
                      
            </div>
            <div className="meeting_desc">
              <img className="mirrorfly_meeting_logo" src={ImgFavicon} alt="Mirrorfly Video Call" />
              <span className="call_details">Join video call</span> 
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
    groupsMemberListData: state.groupsMemberListData,
    vCardData:state.vCardData,

  }
}
export default connect(mapStateToProps, null)(TextComponent);
