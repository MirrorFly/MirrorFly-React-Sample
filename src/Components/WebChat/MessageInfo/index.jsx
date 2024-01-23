import React, { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { CloseMessageInfo } from "../../../assets/images";
import CreateTemplate from "../Conversation/Templates/index";
import DeliveredMessageWrapper from "./DeliveredMessageWrapper";
import SeenMessageWrapper from "./SeenMessageWrapper";

const MessageInfo = (props) => {
  const {
    closeMessageOption,
    addionalnfo,
    rosterData,
    groupMemberDetails,
    viewOriginalMessage,
    vCardData: { data } = {},
    handleShowMessageinfo,
    jid,
    chatType,
    requestReplyMessage,
    messageAction,
    msg = {},
    pageType
  } = props;
  const { msgBody = {}, msgId = "", msgBody: { message_type = "" } = {} } = msg;
  const updatedMessage = msgBody.message;

  const { messageInfoData = {} } = useSelector((state) => state);
  const [getStyle, setStyle] = useState({});
  const [infoMsg, setInfoMsg] = useState(msg);
  const { data: { participants = [] } = {} } = messageInfoData;

  const getDeliverdMessage = () => participants.filter((ele) => ele.msgStatus >= 1);
  const getSeenMessage = () => participants.filter((ele) => ele.msgStatus === 2);

  const totalMembers = participants.length;
  const deliveredMembers = getDeliverdMessage();
  const seenMembers = getSeenMessage();

  useEffect(() => {
    setInfoMsg(msg);
    const messageContainer = document.getElementById("messageContainer");
    if (!messageContainer) return;
    if (messageContainer.offsetHeight > 240) {
      setStyle({
        overflow: "hidden auto",
        maxHeight: "40%"
      });
      return;
    }
    setStyle({});
  }, [msgId,updatedMessage]);

  useEffect(() => {
    if (totalMembers) {
      let newMsgStatus;
      if (deliveredMembers.length && deliveredMembers.length === totalMembers) newMsgStatus = 1;
      if (seenMembers.length && seenMembers.length === totalMembers) newMsgStatus = 2;
      if (newMsgStatus && infoMsg.msgStatus !== newMsgStatus && messageInfoData.data.msgId === msgId) {
        setInfoMsg({
          ...infoMsg,
          msgStatus: newMsgStatus
        });
      }
    }
  }, [deliveredMembers.length, seenMembers.length]);

  return (
    <Fragment>
      <div className="messageInfoHeader">
        <i onClick={handleShowMessageinfo}>
          <CloseMessageInfo />
        </i>
        <h2>Message info</h2>
      </div>
      <div className="messageInfoContainer">
        <div id="messageContainer" style={getStyle} className="messageContainer">
          <CreateTemplate
            message_type={message_type}
            groupMemberDetails={groupMemberDetails}
            requestReplyMessage={requestReplyMessage}
            messageContent={msgBody}
            messageAction={messageAction}
            viewOriginalMessage={viewOriginalMessage}
            vCardData={data}
            messageInfoOptions={false}
            messageObject={infoMsg}
            addionalnfo={addionalnfo}
            jid={jid}
            chatType={chatType}
            closeMessageOption={closeMessageOption}
            pageType={pageType || "msgInfo"}
          />
        </div>
        <div className="infoContainer">
          <SeenMessageWrapper seenMembers={seenMembers} totalMembers={totalMembers} rosterData={rosterData} />
          <DeliveredMessageWrapper
            deliveredMembers={deliveredMembers}
            totalMembers={totalMembers}
            rosterData={rosterData}
          />
        </div>
      </div>
    </Fragment>
  );
};

export default MessageInfo;
