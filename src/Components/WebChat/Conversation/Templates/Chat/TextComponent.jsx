import React, { Fragment } from "react";
import { useSelector } from "react-redux";
import renderHTML from "react-render-html";
import { callIntermediateScreen } from "../../../../../Actions/CallAction";
import { showModal } from "../../../../../Actions/PopUp";
import { IconMeetingVideo, ImgFavicon } from "../../../../../assets/images";
import { CALL_STATUS_CONNECTED } from "../../../../../Helpers/Call/Constant";
import {
  blockOfflineAction,
  convertTextToURL,
  getFormattedText,
  getSiteDomain,
  isCallLink
} from "../../../../../Helpers/Utility";
import Store from "../../../../../Store";
import Translate from "./Translate";

const TextComponent = (props = {}) => {
  const { messageObject = {}, isSender = false, pageType } = props;
  const { msgBody = {} } = messageObject;
  const messageLink = convertTextToURL(msgBody.message);
  const { data: conferenceData = {} } = useSelector((state) => state.showConfrenceData || {});
  const { data: callData = {} } = useSelector((state) => state.callIntermediateScreen || {});

  const isTranslated = () =>
    !isSender &&
    pageType === "conversation" &&
    msgBody?.translatedMessage &&
    Object.keys(msgBody.translatedMessage).length;

  const renderMessageBody = () => (msgBody ? renderHTML(getFormattedText(messageLink)) : null);

  const subscribeToCall = () => {
    if (blockOfflineAction()) return "";

    const callLink = msgBody.message?.split(`${getSiteDomain()}/`)[1];
    if (callData && conferenceData.callStatusText === CALL_STATUS_CONNECTED) {
      if (msgBody.message.includes(callData.link)) {
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

  return (
    <Fragment>
      {isCallLink(msgBody.message) ? (
        <div className="message_meeting_link">
          <button type="button" className="meetingL_link_share" onClick={() => subscribeToCall()}>
            <div className="meeting_link_detail">
              <span className="meeting_ink">{msgBody.message}</span>
            </div>
            <div className="meeting_desc">
              <img src={ImgFavicon} alt="Mirrorfly Video Call" />
              <span className="call_details">Join video call</span>
              <span className="call_icon">
                <IconMeetingVideo />
              </span>
            </div>
            {isTranslated() && <Translate tMessage={msgBody?.translatedMessage} />}
            <div className="company_detais">
              {/* <img src={ImgFavicon} alt="Mirrorfly Video Call" /> <span>Join video call</span> */}
            </div>
          </button>
        </div>
      ) : (
        <div className="message-text">
          <span>{renderMessageBody()}</span>
          {isTranslated() && <Translate tMessage={msgBody?.translatedMessage} />}
        </div>
      )}
    </Fragment>
  );
};

export default TextComponent;
