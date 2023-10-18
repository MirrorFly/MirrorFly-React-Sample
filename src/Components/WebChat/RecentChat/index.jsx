import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import {
  RecentChatRoster,
  RecentChatUpdateAction,
  RecentChatUpdateNotification,
  RecentChatAction
} from "../../../Actions/RecentChatActions";
import { loaderSVG, Rechatchatimage, Nochat, EmptySearch, IconEmptyArchive } from "../../../assets/images";
import { isRenderMessageType, sortBydate } from "../../../Helpers/Chat/RecentChat";
import {
  NO_RECENT_CHAT_INFO,
  NO_RECENT_CLICK_ON_INFO,
  NO_RECENT_SEARCH_CONTACTS_INFO,
  NO_RESULTS_FOUND
} from "../../processENV";
import SDK from "../../SDK";
import Title from "../Common/BrowserTitle";
import RecentChat from "./RecentChat";
import RosterContacts from "./RosterContacts";
import RecentSearch from "./RecentSearch";
import Store from "../../../Store";
import {
  getValidSearchVal,
  capitalizeFirstLetter,
  isConnStateEqualTo,
  getArchiveSetting
} from "../../../Helpers/Utility";
import {
  getUserInfoForSearch,
  getDataFromRoster
} from "../../../Helpers/Chat/User";
import { isSingleChat } from "../../../Helpers/Chat/ChatHelper";
import {
  CONNECTION_STATE_CONNECTING,
  CONNECTION_STATE_CONN_FAILED,
  CONNECTION_STATE_ERROR_OCCURED
} from "../../../Helpers/Chat/Constant";
import { Archived } from "../Setting/images";

class RecentChatSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      searchEnable: false,
      searchValue: "",
      recentChatNames: [],
      recentChatItems: [],
      filteredContacts: []
    };
    this.timer = 0;
    this.chatExist = false;
  }

  filterUserNameFromRecent = (recentChatArray) => recentChatArray.map((chat) => chat.fromUserId);

  filterRosterByUserNames = (recentChatArray, rosterDataArray) => {
    const recentChatNames = this.filterUserNameFromRecent(recentChatArray);
    return rosterDataArray.filter((profile) => {
      const rosterJid = profile.username ? profile.username : profile.userId;
      return recentChatNames.indexOf(rosterJid) > -1;
    });
  };

  filterProfileFromRoster = (filteredRoaster, messageFrom) => {
    return getDataFromRoster(messageFrom);
  };

  filterProfileFromGroup = (messageFrom) => {
    const { groupsData: { data: groupsDataArray = [] } = {} } = this.props;
    return groupsDataArray && groupsDataArray.find((groups) => messageFrom === groups.groupId);
  };

  filterProfileFromBroadcast = (messageFrom) => {
    const { broadCastData: { data: { broadcastList: broadcastListArray = [] } = {} } = {} } = this.props;
    return broadcastListArray.find((broadcast) => messageFrom === broadcast.jid);
  };

  getRoaster = (chatType = "groupchat", messageFrom = "") => {
    const messageType = {
      groupchat: this.filterProfileFromGroup,
      broadcast: this.filterProfileFromBroadcast
    };
    return messageType[chatType] && messageType[chatType](messageFrom);
  };

  constructRecentChatItems = (recentChatArray, filteredRoaster) => {
    let recent = [];
    sortBydate([...recentChatArray])
      .map(async(chat) => {
        let data = {};
        if (isSingleChat(chat.chatType)) {
          data = this.filterProfileFromRoster(filteredRoaster, chat.fromUserId);          
        } else {
          data = this.getRoaster(chat.chatType, chat.fromUserId);
        }
        recent.push({
          recent: chat,
          roster: data || {}
        });
      })
      return recent.filter((eachmessage) => eachmessage);
  };

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  getRecentChatsItems() {
    const {
      rosterData: { id: rosterId, data: rosterDataArray = [] } = {},
      recentChatData: { id: recentchatId, data: recentChatArray = [] } = {}
    } = this.props;
    const filteredRoaster = this.filterRosterByUserNames(recentChatArray, rosterDataArray);
    let recentChatItems = this.constructRecentChatItems(recentChatArray, filteredRoaster);
    let recentChatNames = this.filterUserNameFromRecent(recentChatArray);
    return { recentChatItems, recentChatNames, rosterId, recentchatId };
  }

  componentDidMount() {
    let {recentChatItems, recentChatNames, rosterId, recentchatId} = this.getRecentChatsItems();
    if (rosterId && recentchatId) {
      if(recentChatItems.length > 0){
        this.setState({
          recentChatItems: recentChatItems,
          recentChatNames: recentChatNames,
          loader: false
        })
      }
      else{
        this.setState({loader: false})
      }
    }
  }

  async componentDidUpdate(prevProps) {
    const {
      rosterData: { id: rosterId } = {},
      recentChatData: { id: recentchatId, refreshUnreadCount } = {},
      commonData: {
        data: { isArchived = false }
      }
    } = this.props;

    const isRefreshed = isArchived !== prevProps?.commonData?.data?.isArchived;

    if (prevProps.rosterData.id !== rosterId || prevProps.recentChatData.id !== recentchatId || isRefreshed) {
      if (!rosterId || !recentchatId) return;
      let { recentChatItems,recentChatNames } = this.getRecentChatsItems();
      this.setState(
        {
          recentChatItems: recentChatItems,
          recentChatNames: recentChatNames,
          loader: false,
          refreshUnreadCount: this.state.searchValue ? false : refreshUnreadCount // when search value exist, set the refreshUnreadCount from search result, that's why we set here false
        },
        () => {
          recentChatNames = this.state.recentChatNames;
          recentChatItems = this.state.recentChatItems;
          this.props.updateRoster({ recentChatNames, recentChatItems });
          this.state.searchValue && this.searchFilterList(this.state.searchValue, refreshUnreadCount);
        }
      );
      return;
    }

    if (
      prevProps?.broadCastData?.id &&
      this.props.broadCastData &&
      prevProps.broadCastData.id !== this.props.broadCastData.id &&
      this.props.broadCastData?.data?.broadcastList?.length !== prevProps.broadCastData?.data?.broadcastList?.length
    ) {
      const recentChatsRes = await SDK.getRecentChats();
      if (recentChatsRes && recentChatsRes.statusCode === 200) {
        Store.dispatch(RecentChatAction(recentChatsRes.data));
      }
      return;
    }

    if (prevProps.groupsData && this.props.groupsData && prevProps.groupsData.id !== this.props.groupsData.id) {
      this.updateGroupInfo();
    }    
  }

  /**
   * handleGroupData() method to handle name and image of groups in realtime
   */
  updateGroupInfo = () => {
    let { recentChatItems } = this.state;

    if (recentChatItems.length === 0) return;
    const updateRecentChat = recentChatItems.map((chat) => {
      const { recent, roster } = chat;
      if (recent.chatType !== "groupchat") {
        return chat;
      }
      const groupId = roster.groupId || recent.fromUserId;
      const data = this.filterProfileFromGroup(groupId);
      return {
        recent: recent,
        roster: data || {}
      };
    });
    this.setState(
      {
        recentChatItems: updateRecentChat
      },
      () => {
        let recentChatNames = this.state.recentChatNames;
        recentChatItems = this.state.recentChatItems;
        this.props.updateRoster({ recentChatNames, recentChatItems });
      }
    );
  };

  recentChatSearchFilter = (searchWith) => {
    const { recentChatItems } = this.state;
    this.chatExist = false;
    return recentChatItems.map((item) => {
      const { roster } = item;
      const regexList = getUserInfoForSearch(roster);
      const updateSearch = regexList.find((str) => {
        if (!str) return false;
        return str.search(new RegExp(searchWith, "i")) !== -1;
      });
      if (updateSearch) {
        item.hidden = false;
        this.chatExist = true;
        return item;
      }
      item.hidden = true;
      return item;
    });
  };

  contactsSearch = (searchTerm) => {
    const { recentChatNames } = this.state;
    const {
      rosterData: { data }
    } = this.props;
    if (!data) return [];
    return data.filter((item) => {
      const rosterJid = item.username ? item.username : item.userId;
      if (recentChatNames.indexOf(rosterJid) > -1) {
        return false;
      }

      const regexList = getUserInfoForSearch(item);
      return regexList.find((str) => {
        if (!item.isFriend || !str) return false;
        return str.search(new RegExp(searchTerm, "i")) !== -1;
      });
    });
  };

  searchFilterList = (searchValue, refreshUnreadCount) => {
    let searchWith = getValidSearchVal(searchValue);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      const updatedList = this.recentChatSearchFilter(searchWith);
      const filteredContacts = this.contactsSearch(searchWith);
      this.setState({
        searchEnable: searchValue === "" ? false : true,
        searchValue: searchValue,
        filteredRecentChat: updatedList,
        filteredContacts: filteredContacts,
        refreshUnreadCount
      });
    }, 0);
  };

  shouldComponentUpdate(nextProps) {
    const { callUserJID, messageData: { id, data: { messageType } = {} } = {} } = this.props;
    if (callUserJID !== nextProps.callUserJID) {
      return true;
    }
    const nextPropsMsgId = nextProps?.messageData?.id;
    const nextPropsMsgType = nextProps?.messageData?.data?.messageType;
    const checkExist = isRenderMessageType(nextPropsMsgType);
    return !(messageType && nextPropsMsgId !== id && checkExist);    
  }

  render() {
    const { recentChatItems, filteredRecentChat, searchEnable, searchValue, filteredContacts, loader } = this.state;
    const {
      handleConversationSectionDisplay,
      callUserJID,
      handleShowCallScreen,
      callType,
      messageData,
      newChatStatus,
      callMode,
      pageType,
      unreadCountData: { unreadDataObj = {} } = {},
      featureStateData
    } = this.props;
    const { isRecentChatSearchEnabled = false } = featureStateData;
    const updatedRecentChat = searchEnable ? filteredRecentChat : recentChatItems;
    const loaderStyle = {
      width: 80,
      height: 80
    };
    let archivedChats = [],
      archiveUnreadCount = 0;
    updatedRecentChat.map((el) => {
      const { recent: { archiveStatus = 0, fromUserId = "", unreadCount = 0 } = {} } = el;
      if (archiveStatus === 1) {
        if (unreadDataObj[fromUserId]) {
          unreadDataObj[fromUserId]?.count > 0 && (archiveUnreadCount += 1);
        } else {
          unreadCount > 0 && (archiveUnreadCount += 1);
        }
        archivedChats.push(fromUserId);
      }
    });
    const isPermanentArchvie = getArchiveSetting();

    if (loader) {
      return (
        <div className="loader-container">
          <img src={loaderSVG} alt="loader" style={loaderStyle} />
        </div>
      );
    }

    return (
      <Fragment>
        <div style={{ display: !newChatStatus ? "none" : "" }}>
          {pageType === "recent" && isRecentChatSearchEnabled && <RecentSearch search={this.searchFilterList} />}
          {(!this.props.isAppOnline ||
            isConnStateEqualTo([
              CONNECTION_STATE_CONNECTING,
              CONNECTION_STATE_CONN_FAILED,
              CONNECTION_STATE_ERROR_OCCURED
            ])) && (
              <div className="networkoffline">
                {!this.props.isAppOnline
                  ? "Please check your Internet connection"
                  : capitalizeFirstLetter(CONNECTION_STATE_CONNECTING.toLocaleLowerCase())}
              </div>
            )}
          {
            <div
              className={`chat-list ${!this.props.isAppOnline ||
                  isConnStateEqualTo([
                    CONNECTION_STATE_CONNECTING,
                    CONNECTION_STATE_CONN_FAILED,
                    CONNECTION_STATE_ERROR_OCCURED
                  ])
                  ? "offline"
                  : ""
                } ${pageType === "archive" ? "archive" : ""} ${pageType === "archive" && updatedRecentChat.length === 0 && !searchValue ? " no-chat-archive " : ""
                } ${(pageType != "archive") && updatedRecentChat.length === 0 && !searchValue ? " no-chat " : ""}`}
            >
              {isPermanentArchvie && pageType === "recent" && archivedChats.length > 0 && (
                <div className="archivedWrapper" onClick={this.props.handleArchivedChatList}>
                  <div className="archivedInner">
                    <i>
                      <Archived style={{ color: "#6a92c5", fill: "#6a92c5" }} />
                    </i>
                    <span>Archived</span>
                  </div>
                  {archiveUnreadCount > 0 && <span className="count">{archiveUnreadCount}</span>}
                </div>
              )}
              <RecentChat
                pageType={pageType}
                searchTerm={searchValue}
                handleConversationSectionDisplay={handleConversationSectionDisplay}
                recentChatItems={updatedRecentChat}
                callUserJID={callUserJID}
                callStatus={this.props.callStatus}
                handleShowCallScreen={handleShowCallScreen}
                messageData={messageData}
                callType={callType}
                callMode={callMode}
                recentChatExist={this.chatExist}
                refreshUnreadCount={this.state.refreshUnreadCount}
                handlePopupState={this.props.handlePopupState}
                archiveLength={archivedChats.length}
              />

              <RosterContacts searchTerm={searchValue} filteredContacts={filteredContacts} />

              {!this.chatExist && filteredContacts.length === 0 && searchValue && (
                <div
                  className={`no-search-record-found ${pageType === "recent" && archivedChats.length ? "has-archive" : ""
                    }`}
                >
                  <div className={`norecent-chat`}>
                    <i className="norecent-chat-img">
                      <EmptySearch />
                    </i>
                    <h4>{NO_RESULTS_FOUND}</h4>
                  </div>
                </div>
              )}
              {((archivedChats.length === 0 && pageType === "archive") ||
                (pageType === "recent" && updatedRecentChat.length - archivedChats.length === 0)) &&
                !searchValue && (
                  <Fragment>
                    <div
                      className={`norecent-chat ${pageType === "recent" && archivedChats.length ? "has-archive" : ""}`}
                    >
                      {pageType === "archive" ? (
                        <Fragment>
                          <i className="norecent-chat-img">
                            <IconEmptyArchive />
                          </i>
                          <h4>{"No archived chats"}</h4>
                        </Fragment>
                      ) : (
                        <Fragment>
                          <i className="norecent-chat-img">
                            {" "}
                            <Rechatchatimage />{" "}
                          </i>
                          <h4>{NO_RECENT_CHAT_INFO}</h4>
                          <h4>
                            {NO_RECENT_CLICK_ON_INFO}
                            <i>
                              <Nochat />
                            </i>{" "}
                            {NO_RECENT_SEARCH_CONTACTS_INFO}
                          </h4>
                        </Fragment>
                      )}
                    </div>
                  </Fragment>
                )}
            </div>
          }
          <Title />
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    featureStateData: state.featureStateData,
    rosterData: state.rosterData,
    recentChatData: state.recentChatData,
    singleChatMsgHistoryData: state.singleChatMsgHistoryData,
    groupsData: state.groupsData,
    messageData: state.messageData,
    broadCastData: state.broadCastData,
    isAppOnline: state?.appOnlineStatus?.isOnline,
    connectionState: state.ConnectionStateData.data,
    isEnableArchived: state?.webLocalStorageSetting?.isEnableArchived,
    commonData: state?.commonData,
    unreadCountData: state.unreadCountData
  };
};

const mapDispatchToProps = {
  updateRecentChat: RecentChatUpdateAction,
  updateNotification: RecentChatUpdateNotification,
  updateRoster: RecentChatRoster
};

export default connect(mapStateToProps, mapDispatchToProps)(RecentChatSection);
