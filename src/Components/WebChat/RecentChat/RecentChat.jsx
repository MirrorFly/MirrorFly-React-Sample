import React, { Component, Fragment } from "react";
import RecentChatItem from "./RecentChatItem";

export default class RecentChat extends Component {
  getMessageInfo = (recentChatItem) => {
    const { recent: { msgId, fromUserId } = {} } = recentChatItem;
    return {
      msgId,
      fromUserId
    };
  };

  render() {
    const {
      recentChatItems,
      handleConversationSectionDisplay,
      searchTerm,
      callUserJID,
      handleShowCallScreen,
      callType,
      callMode,
      messageData,
      recentChatExist,
    } = this.props;

    if (recentChatItems.length === 0) return null;

    const searchLen = searchTerm && searchTerm.trim().length;
    const isArchivePage = this.props.pageType === "recent" ? 0 : 1;
    const filteredItems = !searchLen
      ? recentChatItems.filter((item) => item?.recent?.archiveStatus === isArchivePage)
      : recentChatItems;
    return (
      <Fragment>
        {searchLen > 0 && recentChatExist && <div className="search-head">Chats</div>}
        <ul className="chat-list-ul"
          style={{ display: `${this.props.archiveLength === 0 && this.props.pageType === "archive" ? "none" : ""}` }}>
          {filteredItems.map((recentChatItem, key) => {
            const { msgId, fromUserId } = this.getMessageInfo(recentChatItem);
            const { hidden = false } = recentChatItem;
            const {roster:{ isAdminBlocked = ""}} = recentChatItem
            return (
              <RecentChatItem
                pageType={this.props.pageType}
                enableDropDown={true}
                key={fromUserId}
                hidden={hidden}
                activeClass={false}
                messageId={msgId}
                searchTerm={searchTerm}
                messageData={messageData}
                handleOnclick={handleConversationSectionDisplay}
                item={recentChatItem}
                callUserJID={callUserJID}
                callStatus={this.props.callStatus}
                handleShowCallScreen={handleShowCallScreen}
                callType={callType}
                callMode={callMode}
                refreshUnreadCount={this.props.refreshUnreadCount}
                handlePopupState={this.props.handlePopupState}
                isAdminBlocked = {isAdminBlocked}
              />
            );
          })}
        </ul>
      </Fragment>
    );
  }
}
