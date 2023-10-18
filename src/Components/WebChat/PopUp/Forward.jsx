import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Close2, Info, loaderSVG, SendMessage } from "../../../assets/images";
import Config from "../../../config";
import { NO_SEARCH_CHAT_CONTACT_FOUND, REACT_APP_CONTACT_SYNC, REACT_APP_XMPP_SOCKET_HOST } from "../../processENV";
import SDK from "../../SDK";
import RecentSearch from "../RecentChat/RecentSearch";
import Users from "./Users";
import {
  blockOfflineAction,
  escapeRegex,
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
  getFriendsFromRosters,
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
import InfiniteScroll from "react-infinite-scroll-component";
import userList from "../RecentChat/userList";
import { popupStatus } from "../../../Actions/PopUp";

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
      loaderStatus: !!props?.rosterData?.isFetchingUserList,
      userList: [],
      unBlockedUserName: []
    };
    this.timer = 0;
  }

  componentDidMount() {
    if (!REACT_APP_CONTACT_SYNC) {
      this.setState({
        userList: []
      })
      userList.getUsersListFromSDK(1);
    } else {
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
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  componentDidUpdate(prevProps) {
    if ((prevProps.rosterData && prevProps.rosterData.id !== this.props.rosterData.id) || (prevProps.groupsData && prevProps.groupsData.id !== this.props.groupsData.id)) {
      if (!REACT_APP_CONTACT_SYNC) {
        this.initialLoad(getValidSearchVal(this.state.searchValue), getValidSearchVal(this.state.searchValue));
      } else {
        this.searchFilterList(this.state.searchValue);
      }
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
      if (roster.isDeletedUser) return false;
      const { existGroup } = roster;
      const { leftGroup } = recent;
      if (existGroup || leftGroup) return false;

      const regexList = getUserInfoForSearch(roster);
      return regexList.find((str) => {
        if (REACT_APP_CONTACT_SYNC && !str) {
          return false;
        }
        return str.search(new RegExp(`(${escapeRegex(searchWith)})`, "i")) !== -1;
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
      if (regex.length > 0) {
        return regex.find((str) => {
          if (!item.isFriend || !str) return false;
          if (REACT_APP_CONTACT_SYNC && (!item.isFriend || !str)) {
            return false;
          }
          return str.search(new RegExp(searchTerm, "i")) !== -1;
        });
      } else {
        return true;
      }
    });
  };

  initialLoad = (searchWith = "", searchValue = "") => {
    searchWith = searchWith.replace(/\\/g, "");
    const updatedList = this.recentChatSearchFilter(searchWith).filter(item => (item?.roster?.isAdminBlocked !== true && item?.roster?.isDeletedUser !== true && (item?.recent?.userId !== this.props.vCardData.data.userId && (item?.recent?.profileUpdatedStatus !== "userLeft" || item?.recent?.leftGroup !== true || item?.recent?.profileUpdatedStatus !== "userRemoved"))));
    const filteredContacts = this.contactsSearch(searchWith);
    const { contactsToDisplay, contactsToForward, jidArray, unBlockedUserName } = this.state

    let filteredRecentNames = updatedList.map((item, key) => (
      item?.roster?.name || item?.roster?.groupName
    ))
    let filteredContactNames = filteredContacts.map((item, key) => (
      item?.name
    ))
    let allContactList = [...filteredRecentNames, ...filteredContactNames]
    let adminContactsToDisplay = [];
    let adminContactsToForward = contactsToForward
    let adminJidArray = jidArray
    let adminUnBlockedUserName = unBlockedUserName
    contactsToDisplay.forEach((item, key) => {
      if (allContactList.includes(item)) {
        adminContactsToDisplay.push(item)
      } else {
        adminContactsToForward.splice(key, 1)
      }
    }
    )
    adminUnBlockedUserName.forEach((item, key) => {
      if (allContactList.includes(item) && !adminContactsToDisplay.includes(item)) {
        adminContactsToDisplay.push(item)
        const adminJid = adminJidArray[key].includes('@')? adminJidArray[key] : adminJidArray[key] + "@" + REACT_APP_XMPP_SOCKET_HOST;
        adminContactsToForward.push(adminJid);
      }
    })

    const { rosterData: { data } } = this.props    
    this.setState({
      searchValue: searchValue,
      filteredRecentChat: updatedList,
      filteredContacts: filteredContacts,
      userList: getFriendsFromRosters(handleFilterBlockedContact(data)),
      loaderStatus: this.props?.rosterData?.isFetchingUserList,
      contactsToDisplay: adminContactsToDisplay,
      contactsToForward: adminContactsToForward,
    });
  };

  searchFilterList = (searchValue) => {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      searchValue = getValidSearchVal(searchValue);
      let searchWith = searchValue;
      this.initialLoad(searchWith, searchValue);
      if (!REACT_APP_CONTACT_SYNC) {
        userList.getUsersListFromSDK(1, searchWith);
      }
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

  handleUpdateHistory = (toJid, contactsToForward, originalMsg, newMsgIds, msdIdIndex) => {
    setTimeout(() => {
      const conversationHistory = getChatHistoryMessagesData();
      if (
        Object.keys(conversationHistory).includes(getUserIdFromJid(toJid)) ||
        contactsToForward[contactsToForward.length - 1] === toJid
      ) {
        const dataMsg = getMessageObjForward(originalMsg, toJid, newMsgIds[msdIdIndex]);
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
    Store.dispatch(popupStatus(false));
    const {
      selectedMessageData: { data }
    } = this.props;
    const { contactsToForward } = this.state;
    let msgIds = data.sort((a, b) => (b.timestamp > a.timestamp ? -1 : 1)).map((el) => el.msgId);

    let newMsgIds = [];
    let mentionedUserIds = []
    let totalLength = data.length * contactsToForward.length;
    for (let i = 0; i < totalLength; i++) newMsgIds.push(uuidv4());
    SDK.forwardMessagesToMultipleUsers(contactsToForward, msgIds, true, newMsgIds, mentionedUserIds);
    const chatToOpen = contactsToForward[contactsToForward.length - 1];
    const response = this.findLastChat(chatToOpen);
    const { recent: { chatType } = {} } = response[0];
    if (chatType) {
      response[0].chatType = chatType;
      response[0].chatId = getUserIdFromJid(chatToOpen);
      response[0].chatJid = chatToOpen;
      Store.dispatch(ActiveChatAction(response[0]));
    }

    let msdIdIndex = 0;
    for (const oldMsgId of msgIds) {
      for (const toJid of contactsToForward) {
        const originalMsg = getMessageFromHistoryById(this.props.activeJid, oldMsgId);
        const recentChatObj = await getRecentChatMsgObjForward(originalMsg, toJid, newMsgIds[msdIdIndex]);
        await Store.dispatch(RecentChatUpdateAction(recentChatObj));
        this.handleUpdateHistory(toJid, contactsToForward, originalMsg, newMsgIds, msdIdIndex);
        if (msdIdIndex === 0) {
          handleTempArchivedChats(toJid, originalMsg.chatType);
        }
        
        msdIdIndex++;
      }
    }

    this.props.closeMessageOption(true);
  };

  handleUserListData() {
    let dataArr = [];
    const { searchValue, jidArray, contactsToForward } = this.state;
    const {
      recentChatData: {
        rosterData: { recentChatItems }
      }
    } = this.props;   
    let filteredRecentUserIds = []; 
    recentChatItems.forEach(element => {
      if (element?.recent?.chatType === "chat") filteredRecentUserIds.push(element?.roster?.userId)
    });
    if (this.state.userList.length > 0) {
      this.state.userList.forEach((contact) => {
        const { username, userId } = contact;
        const contactName = getContactNameFromRoster(contact);
        const updateJid = userId || username;
        const isChanged = jidArray.findIndex((jid) => jid === updateJid);
        const blockedContactArr = this.props.blockedContact.data;
        const isBlockedUser =
          blockedContactArr.indexOf(
            updateJid.includes("@") ? updateJid : updateJid + "@" + REACT_APP_XMPP_SOCKET_HOST
          ) > -1;
        if (!filteredRecentUserIds.includes(updateJid)) {
          dataArr.push(
            <li key={updateJid} className={`chat-list-li ${isBlockedUser ? "Blocked" : ""}`}>
              <Users
                key={updateJid}
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
          )
        }
      });
    }    
    return dataArr;
  }

  fetchMoreData = () => {
    let userListArr = this.state.userList;
    let searchWith = getValidSearchVal(this.state.searchValue);
    userList.getUsersListFromSDK(Math.ceil((userListArr.length / 20) + 1), searchWith);
  }

  handleFilteredRecentChat = (filteredRecentChat,searchValue, contactsToForward, jidArray) => {
    const contacts = filteredRecentChat.map((contact) => {
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
      })
      return (
        <>
        {contacts.length > 0 && <li className="list-heading">Recent Chat</li>}
          {contacts}
        </>
      );
  }

  render() {
    const { filteredContacts, filteredRecentChat, isLoading, searchValue, contactsToForward, jidArray } = this.state;
    const { closePopup } = this.props;
    const usersName = this.state.contactsToDisplay.join(", ");
    const messageLength =
      (this.props.selectedMessageData &&
        Array.isArray(this.props.selectedMessageData.data) &&
        this.props.selectedMessageData.data.length) ||
      0;
    const userListArr = this.state.userList;
    const userListResults = this.handleUserListData();
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
                  { REACT_APP_CONTACT_SYNC && 
                    <div className="popup-body">
                      <div className="contactList">
                        {isLoading && <div className="response_loader style-2">
                          <img src={loaderSVG} alt="loader" />
                        </div>
                        } 
                        { !isLoading && <>
                          <ul className="chat-list-ul">
                          {this.handleFilteredRecentChat(filteredRecentChat,searchValue, contactsToForward, jidArray )}
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
                        </>
                        }
                      </div>
                    </div>
                  }
                  { !REACT_APP_CONTACT_SYNC &&
                    <div className="popup-body" style={{ overflow: "hidden" }}>
                      <div className="contactList" style={{ height: "100%" }}>
                        <ul className="chat-list-ul" style={{ height: "100%" }} id="scrollableUl-forward">
                        {this.state.loaderStatus && <div className="response_loader style-2">
                          <img src={loaderSVG} alt="loader" />
                        </div>
                        }
                        
                        {userListArr.length === 0 && filteredRecentChat.length === 0 && searchValue && 
                          <span className="searchErrorMsg"><Info />
                            {NO_SEARCH_CHAT_CONTACT_FOUND}
                          </span>}
                        {this.props.isAppOnline ?(userListArr.length > 0 || filteredRecentChat.length > 0) &&
                          <InfiniteScroll
                            dataLength={userListArr.length}
                            next={this.fetchMoreData}
                            hasMore={true}
                            scrollableTarget="scrollableUl-forward"
                          >
                            {this.handleFilteredRecentChat(filteredRecentChat,searchValue, contactsToForward, jidArray )}
                            {userListResults.length > 0 && 
                            <li className="list-heading">Contacts</li>
                            }
                            {this.handleUserListData()}
                          </InfiniteScroll>
                          : this.handleUserListData()
                        }
                      </ul>
                      </div>
                    </div>
                  }
                  
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
    groupsData: state.groupsData,
    vCardData: state.vCardData,
    isAppOnline: state?.appOnlineStatus?.isOnline,

  };
};

export default connect(mapStateToProps, null)(ForwardPopUp);
