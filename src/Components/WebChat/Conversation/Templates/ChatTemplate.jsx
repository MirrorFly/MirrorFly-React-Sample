import React, { Component, Fragment } from "react";
import { convertDateFormat, groupBy, groupByTime } from "../../../../Helpers/Chat/ChatHelper";
import { groupstatus } from "../../../../Helpers/Chat/RecentChat";
import DeletedMessage from "./Common/DeletedMessage";
import CreateTemplate from "./index";
import autoscroll from "./Scroll";
import { GROUP_CHAT_PROFILE_UPDATED_NOTIFY } from "../../../../Helpers/Chat/Constant";
import { convertUTCDateToLocalDate } from "../../WebChatTimeStamp";

class ChatTemplate extends Component {
  iterateArrayOfTemplate = (chatmessages) => {
    if (!chatmessages) return null;

    const {
      rosterData: { data: rosterArray },
      groupMemberDetails,
      viewOriginalMessage,
      vCardData: { data } = {},
      jid,
      chatType,
      requestReplyMessage,
      messageAction,
      addionalnfo,
      deliveredType,
      handleTranslateLanguage
    } = this.props;

    return chatmessages.map((msg) => {
      const {
        deleteStatus,
        msgId,
        msgBody,
        msgType,
        msgBody: { message_type = "" } = {}
      } = msg;

      if (msgType === GROUP_CHAT_PROFILE_UPDATED_NOTIFY) {
        const { publisherId, userId, profileUpdatedStatus } = msg;
        const notification = groupstatus(publisherId, userId, profileUpdatedStatus, rosterArray) || "";
        return (
          <div key={msgId} id={msgId} className="chatStatusBar">
            <span>{notification}</span>
          </div>
        );
      }
      return deleteStatus === 0 ? (
        <CreateTemplate
          message_type={message_type}
          key={msgId}
          groupMemberDetails={groupMemberDetails}
          requestReplyMessage={requestReplyMessage}
          deliveredType={deliveredType}
          messageContent={msgBody}
          messageAction={messageAction}
          closeMessageOption={this.props.closeMessageOption}
          viewOriginalMessage={viewOriginalMessage}
          vCardData={data}
          messageObject={msg}
          jid={jid}
          addionalnfo={addionalnfo}
          messageInfoOptions={true}
          chatType={chatType}
          pageType={"conversation"}
          handleTranslateLanguage = {handleTranslateLanguage}
          handleShowCallScreen={this.props.handleShowCallScreen}
        />
      ) : (
        <DeletedMessage
          closeMessageOption={this.props.closeMessageOption}
          messageInfoOptions={true}
          addionalnfo={addionalnfo}
          key={msgId}
          vCardData={data}
          messageObject={msg}
          messageAction={messageAction}
          chatType={chatType}
        />
      );
    });
  };

  messageToDisplay = (groupedMessages) =>
    groupedMessages.map((splitedMessage) => this.iterateArrayOfTemplate(splitedMessage));

  dateBlock = (messageInDate, date) => {
    const groupedMessages = groupByTime(messageInDate, (singleImage) => new Date(singleImage.dateString).getTime());
    return (
      <Fragment key={date}>
        <div className="chatDate">
          <span>{date && convertDateFormat(date)}</span>
        </div>
        {this.messageToDisplay(groupedMessages)}
      </Fragment>
    );
  };

  constructMessageTemplate = () => {
    const { chatmessages } = this.props;
    const updatedMessage = groupBy(chatmessages, (date) => (convertUTCDateToLocalDate(date.createdAt) || "").split(" ")[0]);
    return Object.keys(updatedMessage).map((messageInDate) => {
      const { [messageInDate]: splitBlockByDate } = updatedMessage;
      return this.dateBlock(splitBlockByDate, messageInDate);
    });
  };

  render() {
    const templates = this.constructMessageTemplate();
    return <Fragment>{templates || null}</Fragment>;
  }
}

export default autoscroll(ChatTemplate, { isScrolledDownThreshold: 100 });
