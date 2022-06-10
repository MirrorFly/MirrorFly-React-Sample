import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Close2, Info, SendMessage } from "../../../assets/images";
import Config from "../../../config";
import { NO_SEARCH_CHAT_CONTACT_FOUND, REACT_APP_XMPP_SOCKET_HOST } from "../../processENV";
import SDK from "../../SDK";
import RecentSearch from "../RecentChat/RecentSearch";
import Users from "./Users";
import {
  blockOfflineAction,
  getMessageObjForward,
  getRecentChatMsgObjForward,
  getUserIdFromJid,
  getValidSearchVal,
  handleFilterBlockedContact,
  isAppOnline
} from "../../../Helpers/Utility";
import {
  getContactNameFromRoster,
  getDataFromRoster,
  getUserInfoForSearch,
  isSingleChatJID
} from "../../../Helpers/Chat/User";
import uuidv4 from "uuid/v4";
import {
  getChatHistoryMessagesData,
  getMessageFromHistoryById,
  handleTempArchivedChats
} from "../../../Helpers/Chat/ChatHelper";
import Store from "../../../Store";
import { ChatMessageHistoryDataAction } from "../../../Actions/ChatHistory";
import { ActiveChatAction, RecentChatUpdateAction } from "../../../Actions/RecentChatActions";
import _get from "lodash/get";
import { CHAT_TYPE_SINGLE } from "../../../Helpers/Chat/Constant";

const { maximumCharForwardPopUp } = Config;
class ForwardPopUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: "",
      isLoading: true,
      jidArray: [],
      contactsToForward: [],
      contactsToDisplay: [],
      filteredContacts: [],
      filteredRecentChat: [],
      unBlockedUserName:[]
    };
    this.timer = 0;
  }

  componentDidMount() {
    this.timer = setTimeout(() => {
      this.setState(
        {
          isLoading: false
        },
        () => {
          this.initialLoad("");
        }
      );
    }, 100);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  componentDidUpdate(prevProps) {
    if ((prevProps.rosterData && prevProps.rosterData.id !== this.props.rosterData.id) || (prevProps.groupsData && prevProps.groupsData.id !== this.props.groupsData.id)) {
      this.searchFilterList(this.state.searchValue);
    }
  }

  addContact = (jid, userName, updateJid) => {
    this.setState({
      contactsToForward: this.state.contactsToForward.concat(jid),
      contactsToDisplay: this.state.contactsToDisplay.concat(userName),
      jidArray: this.state.jidArray.concat(updateJid),
      unBlockedUserName: this.state.unBlockedUserName.concat(userName)
    });
  };

  removeContact = (jid, userName, updateJid) => {
    this.setState({
      contactsToForward: this.state.contactsToForward.filter((user) => user !== jid),
      contactsToDisplay: this.state.contactsToDisplay.filter((user) => user !== userName),
      jidArray: this.state.jidArray.filter((user) => user !== updateJid),
      unBlockedUserName: this.state.unBlockedUserName.filter((user) => user !== userName)
    });
  };

  recentChatSearchFilter = (searchWith) => {
    const {
      recentChatData: {
        rosterData: { recentChatItems }
      }
    } = this.props;
    return recentChatItems.filter((item) => {
      const { roster, recent } = item;
      if(roster.isDeletedUser) return false;
      const { existGroup } = roster;
      const { leftGroup } = recent;
      if (existGroup || leftGroup) return false;

      const regexList = getUserInfoForSearch(roster);
      return regexList.find((str) => {
        if (!str) return false;
        return str.search(new RegExp(searchWith, "i")) !== -1;
      });
    });
  };

  contactsSearch = (searchTerm) => {
    const {
      recentChatData: {
        rosterData: { recentChatNames: recentNames }
      },
      rosterData: { data: contactData }
    } = this.props;
    
    if (!contactData) return [];
    return handleFilterBlockedContact(contactData).filter((item) => {
      const userJid = item.username ? item.username : item.userId;
      if (recentNames.indexOf(userJid) > -1) {
        return false;
      }

      const regex = getUserInfoForSearch(item);
      return regex.find((str) => {
        if (!item.isFriend || !str) return false;
        return str.search(new RegExp(searchTerm, "i")) !== -1;
      });
    });
  };

  initialLoad = (searchWith = "", searchValue = "") => {

    const updatedList = this.recentChatSearchFilter(searchWith).filter(item=>(item?.roster?.isAdminBlocked !== true && item?.roster?.isDeletedUser !== true && item?.recent?.profileUpdatedStatus !== "userLeft"));
    const filteredContacts = this.contactsSearch(searchWith);
    const { contactsToDisplay,contactsToForward,jidArray,unBlockedUserName } = this.state
    
    let filteredRecentNames=updatedList.map((item,key)=>(
      item?.roster?.name || item?.roster?.groupName
    ))
    let filteredContactNames = filteredContacts.map((item,key)=>(
      item?.name
    ))
    let allContactList = [...filteredRecentNames,...filteredContactNames]
    let adminContactsToDisplay = [];
    let adminContactsToForward = contactsToForward
    let adminJidArray = jidArray
    let adminUnBlockedUserName = unBlockedUserName
    

     contactsToDisplay.map((item,key)=>{
       if(allContactList.includes(item)){
        adminContactsToDisplay.push(item)
       }else{
        adminContactsToForward.splice(key,1)
       }
    }
    )
    adminUnBlockedUserName.map((item,key)=>{
      if(allContactList.includes(item) && !adminContactsToDisplay.includes(item)){
        adminContactsToDisplay.push(item)
        adminContactsToForward.push(adminJidArray[key])
      }
    })
    
    this.setState({
      searchValue: searchValue,
      filteredRecentChat: updatedList,
      filteredContacts: filteredContacts,
      contactsToDisplay: adminContactsToDisplay,
      contactsToForward: adminContactsToForward,
    });
  };

  searchFilterList = (searchValue) => {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      let searchWith = getValidSearchVal(searchValue);
      this.initialLoad(searchWith, searchValue);
    }, 0);
  };

  findLastChat = (contactsToForward = "") => {
    const { recentChatData: { rosterData: { recentChatItems = [] } = {} } = {} } = this.props || {};
    const findUser = recentChatItems.filter((ele) => _get(ele, "roster.userJid") === contactsToForward);
    const findGrp = recentChatItems.filter((ele) => _get(ele, "roster.groupId") === contactsToForward.split("@")[0]);
    if (findUser.length === 0 && findGrp.length === 0) {
      const newRoster = getDataFromRoster(getUserIdFromJid(contactsToForward));
      return [{ roster: newRoster, recent: { chatType: CHAT_TYPE_SINGLE } }];
    }
    return [...findUser, ...findGrp];
  };

  handleUpdateHistory = (toJid, contactsToForward, originalMsg, newMsgIds, i, j) => {
    setTimeout(() => {
      const conversationHistory = getChatHistoryMessagesData();
      if (
        Object.keys(conversationHistory).includes(getUserIdFromJid(toJid)) ||
        contactsToForward[contactsToForward.length - 1] === toJid
      ) {
        const dataMsg = getMessageObjForward(originalMsg, toJid, newMsgIds[i + j]);
        const dispatchData = {
          data: [JSON.parse(JSON.stringify(dataMsg))],
          ...(isSingleChatJID(toJid) ? { userJid: toJid } : { groupJid: toJid })
        };
        Store.dispatch(ChatMessageHistoryDataAction(dispatchData));
      }
    }, 100);
  };

  sendForwardMessage = async () => {
    if (!isAppOnline()) {
      blockOfflineAction();
      return;
    }
    const {
      selectedMessageData: { data }
    } = this.props;
    const { contactsToForward } = this.state;
    let msgIds = data.sort((a, b) => (b.timestamp > a.timestamp ? -1 : 1)).map((el) => el.msgId);

    let newMsgIds = [];
    let totalLength = data.length + contactsToForward.length;
    for (let i = 0; i < totalLength; i++) newMsgIds.push(uuidv4());
    SDK.forwardMessagesToMultipleUsers(contactsToForward, msgIds, true, newMsgIds);

    const chatToOpen = contactsToForward[contactsToForward.length - 1];
    const response = this.findLastChat(chatToOpen);
    const { recent: { chatType } = {} } = response[0];
    if (chatType) {
      response[0].chatType = chatType;
      response[0].chatId = getUserIdFromJid(chatToOpen);
      response[0].chatJid = chatToOpen;
      Store.dispatch(ActiveChatAction(response[0]));
    }

    for (let i = 0; i < msgIds.length; i++) {
      const oldMsgId = msgIds[i];
      const originalMsg = getMessageFromHistoryById(this.props.activeJid, oldMsgId);
      for (let j = 0; j < contactsToForward.length; j++) {
        const toJid = contactsToForward[j];
        const recentChatObj = getRecentChatMsgObjForward(originalMsg, toJid, newMsgIds[i + j]);
        Store.dispatch(RecentChatUpdateAction(recentChatObj));
        this.handleUpdateHistory(toJid, contactsToForward, originalMsg, newMsgIds, i, j);
        if (i === 0) handleTempArchivedChats(toJid, originalMsg.chatType);
      }
    }
    this.props.closeMessageOption(true);
  };

  render() {
    const { filteredContacts, filteredRecentChat, isLoading, searchValue, contactsToForward, jidArray } = this.state;
    const { closePopup } = this.props;
    const usersName = this.state.contactsToDisplay.join(", ");
    const messageLength =
      (this.props.selectedMessageData &&
        Array.isArray(this.props.selectedMessageData.data) &&
        this.props.selectedMessageData.data.length) ||
      0;
    return (
      <Fragment>
        <div className="popup-wrapper">
          <div className="popup-container add-participant forward">
            <div className="popup-container-inner">
              <div className="popup-container-header">
                <i onClick={closePopup} className="closePopup">
                  <Close2 />
                </i>
                <h5>Forward message{messageLength > 1 ? "s" : ""} to</h5>
              </div>
              <RecentSearch search={this.searchFilterList} />
              <div className="popup-body">
                {isLoading && <div className="loader"></div>}
                {!isLoading && (
                  <div className="contactList">
                    <ul className="chat-list-ul">
                      <li className="list-heading">Recent Chat</li>
                      {filteredRecentChat.map((contact) => {
                        const { roster, recent } = contact;
                        const { fromUserId: recentChatMesasge } = recent;
                        const chatType = contact?.recent?.chatType;
                        const { userId } = roster;
                        const contactName = getContactNameFromRoster(roster) || recentChatMesasge;
                        const updateJid = userId || recentChatMesasge;
                        const isChanged = jidArray.findIndex((jid) => jid === updateJid);
                        const blockedContactArr = this.props.blockedContact.data;
                        const isBlockedUser =
                          blockedContactArr.indexOf(
                            updateJid.includes("@") ? updateJid : updateJid + "@" + REACT_APP_XMPP_SOCKET_HOST
                          ) > -1;
                        return (
                          <li key={updateJid} className={`chat-list-li ${isBlockedUser ? "Blocked" : ""}`}>
                            <Users
                              isBlockedUser={isBlockedUser}
                              searchValue={searchValue}
                              contactName={contactName}
                              temporary={false}
                              addContact={this.addContact}
                              updateJid={updateJid}
                              chatType={chatType}
                              isChanged={isChanged}
                              selectedContact={contactsToForward.length}
                              removeContact={this.removeContact}
                              roster={roster}
                              {...roster}
                            />
                          </li>
                        );
                      })}
                    </ul>
                    <ul className="chat-list-ul">
                      <li className="list-heading">Contacts</li>
                      {filteredContacts.map((contact) => {
                        const { username, userId } = contact;
                        const contactName = getContactNameFromRoster(contact);
                        const updateJid = userId || username;
                        const isChanged = jidArray.findIndex((jid) => jid === updateJid);
                        const blockedContactArr = this.props.blockedContact.data;
                        const isBlockedUser =
                          blockedContactArr.indexOf(
                            updateJid.includes("@") ? updateJid : updateJid + "@" + REACT_APP_XMPP_SOCKET_HOST
                          ) > -1;
                        return (
                          <li key={updateJid} className={`chat-list-li ${isBlockedUser ? "Blocked" : ""}`}>
                            <Users
                              isBlockedUser={isBlockedUser}
                              searchValue={searchValue}
                              contactName={contactName}
                              addContact={this.addContact}
                              updateJid={updateJid}
                              temporary={false}
                              isChanged={isChanged}
                              selectedContact={contactsToForward.length}
                              chatType={"chat"}
                              removeContact={this.removeContact}
                              roster={contact}
                              {...contact}
                            />
                          </li>
                        );
                      })}
                      {filteredContacts.length === 0 && filteredRecentChat.length === 0 && searchValue && (
                        <span className="searchErrorMsg">
                          <Info /> {NO_SEARCH_CHAT_CONTACT_FOUND}
                        </span>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              <div className="popup-footer">
                {/*
                 * When user select forward person will show send button
                 * Otherwise hide send button
                 */}
                {usersName.length !== 0 ? (
                  <>
                    <i title="send" onClick={this.sendForwardMessage} className="SendMessage">
                      <SendMessage />
                    </i>
                  </>
                ) : null}

                <div className="selectedList">
                  <span title={usersName} className="">
                    {
                      // usersName.length > maximumCharForwardPopUp ? usersName.substring(0, maximumCharForwardPopUp).concat('...') : usersName
                      usersName
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    rosterData: state.rosterData,
    popUpData: state.popUpData,
    recentChatData: state.recentChatData,
    selectedMessageData: state.selectedMessageData,
    blockedContact: state.blockedContact,
    groupsData: state.groupsData
  };
};

export default connect(mapStateToProps, null)(ForwardPopUp);
