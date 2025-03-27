import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { chatResetMessage } from '../../Actions/GroupChatMessageActions';
import { ActiveChatAction, updateMuteStatusRecentChat } from '../../Actions/RecentChatActions';
import { ArrowBack, loaderSVG, MailIcon, EmptySearch, EmptyContact, BlockedIcon } from '../../assets/images';
import "../../assets/scss/minEmoji.scss";
import { getHighlightedText, getValidSearchVal, handleFilterBlockedContact, updateMuteNotification } from '../../Helpers/Utility';
import Store from '../../Store';
import ImageComponent from '../WebChat/Common/ImageComponent';
import WebChatSearch from "./WebChatSearch";
import { isUserWhoBlockedMe } from '../../Helpers/Chat/BlockContact';
import UserStatus from '../WebChat/Common/UserStatus';
import { formatUserIdToJid, getContactNameFromRoster } from '../../Helpers/Chat/User';
import { NO_SEARCH_CONTACT_FOUND, REACT_APP_CONTACT_SYNC } from '../processENV';
import {getFromLocalStorageAndDecrypt} from './WebChatEncryptDecrypt';
import InfiniteScroll from "react-infinite-scroll-component";
import userList from './RecentChat/userList';

class WebChatRoster extends React.Component {

    /**
     * Following the states used in WebChatRoster Component.
     *
     * @param {boolean} loaderStatus Display the loader based on the loaderStatus state.
     * @param {array} filterItem Manage the search items in this state.
     */
    constructor(props) {
        super(props);
        if (!REACT_APP_CONTACT_SYNC) {
            this.state = {
                loaderStatus: !!props?.rosterData?.isFetchingUserList,
                filterItem: [],
                userList: [],
                searchIn: "contacts",
                searchWith: ""
            }
        } else {
            this.state = {
                loaderStatus: true,
                filterItem: [],
                userList: [],
                searchIn: "contacts",
                searchWith: ""
            }
        }
        this.handleRosterData = this.handleRosterData.bind(this);
        this.handleEmailContacts = this.handleEmailContacts.bind(this);
        this.handleMobileContacts = this.handleMobileContacts.bind(this);
        this.handleNewChatStatus = this.handleNewChatStatus.bind(this);
        this.handleOnBack = this.handleOnBack.bind(this);
        this.handleFilterContactsList = this.handleFilterContactsList.bind(this);
    }

    /**
     * componentDidMount() is one of the react lifecycle method. <br />
     * In this method, get the roster data from localstorage and set the data into state.
     */
    componentDidMount() {
        let data = (this.props.rosterData && this.props.rosterData.data) || []
        if (!REACT_APP_CONTACT_SYNC) {
            data =  []
            this.handleUpdateRoster(data, this.props?.rosterData?.isFetchingUserList);
        } else {
            this.setState({ loaderStatus: false });
            this.handleUpdateRoster(data);
        }
    }

    /**
     * handleNewChatStatus() method to manage the new chat icon click status.
     */
    handleNewChatStatus() {
        this.setState({ newChatStatus: true });
    }

    /**
     * handleOnBack() method to manage the back to recent chat icon click status.
     */
    handleOnBack() {
        this.props.handleBackStatus(true);
    }

    handleRoster = (event, response) => {
        const recordingStatus = getFromLocalStorageAndDecrypt('recordingStatus')
        if (recordingStatus === 'false') return;
        let data = {
            roster: response,
            recent: {
                chatType: "chat"
            }
        }
        Store.dispatch(chatResetMessage()).then(() => {
            data.chatType = "chat";
            data.chatId = response.userId;
            data.chatJid = formatUserIdToJid(response.userId);
            Store.dispatch(ActiveChatAction(data));
            if (response.isMuted) {
              const dispatchData = {
                fromUserId: response.userId,
                isMuted: response.isMuted
              };
              updateMuteNotification(dispatchData);
              Store.dispatch(updateMuteStatusRecentChat(dispatchData));
            }
            this.props.handleBackStatus(true);
        })
    }

    /**
     * handleMobileContacts() to display the mobile contacts in new chat.
     *
     * @param {object} roster
     */
    handleMobileContacts(roster) {
        let blockedContactArr = this.props.blockedContact.data;
        const jid = roster.userJid;
        const isBlockedUser = blockedContactArr.indexOf(jid) > -1;
        let isBlocked = isUserWhoBlockedMe(roster.userId);
        let displayContactName = getContactNameFromRoster(roster);
        return (
            <li className={`chat-list-li ${isBlockedUser ? "Blocked" : ""}`} key={roster.userId} onClick={(e) => this.handleRoster(e, roster)}>
                <div className="profile-image">
                    <div className="image">
                        <ImageComponent
                            chatType={'chat'}
                            blocked={isBlocked}
                            temporary={false}
                            imageToken={(roster.thumbImage && roster.thumbImage !== "") ? roster.thumbImage : roster.image}
                            name={displayContactName}
                        />
                    </div>
                </div>
                <div className="recentchats">
                    <div className="recent-username-block">
                        <div className="recent-username">
                            <div className="username">
                                <h3 title={displayContactName}>
                                    <span>
                                        {this.state.searchWith !== "" ?
                                            getHighlightedText(displayContactName, this.state.searchWith) :
                                            displayContactName
                                        }
                                    </span>
                                    {isBlockedUser && <div className="blocked-info">
                                        <i><BlockedIcon /></i><span>Blocked</span>
                                    </div>
                                    }
                                </h3>
                            </div>
                        </div>
                    </div>
                    <div className="recent-message-block">
                        <UserStatus status={roster.status} blocked={isBlocked} userId={roster.userId} />
                    </div>
                </div>
            </li>
        )
    }

    /**
     * handleEmailContacts() method to display the email contacts in new chat.
     * @param {object} roster
     */
    handleEmailContacts(roster) {
        let isBlocked = isUserWhoBlockedMe(roster.userId);
        let displayContactName = getContactNameFromRoster(roster);

        return <li className={`chat-list-li ${isBlocked ? "Blocked" : ""}`} key={roster.userId} onClick={(e) => this.handleRoster(e, roster)}>
            <div className="profile-image">
                <div className="image">
                    <ImageComponent
                        chatType={'chat'}
                        blocked={isBlocked}
                        temporary={false}
                        imageToken={(roster.thumbImage && roster.thumbImage !== "") ? roster.thumbImage : roster.image}
                        name={displayContactName}
                    />
                </div>
                <i>
                    <MailIcon />
                </i>
            </div>
            <div className="recentchats">
                <div className="recent-username-block">
                    <div className="recent-username">
                        <div className="username">
                            <h3 title={displayContactName}>
                                {this.state.searchWith !== "" ?
                                    getHighlightedText(displayContactName, this.state.searchWith) :
                                    displayContactName
                                }
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="recent-message-block">
                    <UserStatus status={roster.status} blocked={isBlocked} userId={roster.userId} />
                </div>
            </div>
        </li>
    }

    /**
     * handleUpdateRoster() method handles if roster dynamic update in search result.
     */
    handleUpdateRoster = (rosterData, isFetchingUserList = false) => {
        let searchWith = this.state.searchWith;
        let data = handleFilterBlockedContact(rosterData).filter(function (item) {
            let filterVariable = getContactNameFromRoster(item) || item.userId;
            return (item.isFriend) && filterVariable.toLowerCase().search(searchWith.toLowerCase()) !== -1;
        });
        if (!REACT_APP_CONTACT_SYNC) {
            this.setState({ filterItem: data, userList: data, loaderStatus: isFetchingUserList });
        } else {
            this.setState({ filterItem: data });
        }
    }

    /**
     * componentDidUpdate() is one of the react lifecycle method. <br />
     * In this method, to updated the upcoming rosters into state.
     *
     * @param {object} prevProps
     * @param {object} prevState
     */
    componentDidUpdate(prevProps, prevState) {
        if (!REACT_APP_CONTACT_SYNC) {
            const isInviteStatus = JSON.parse(getFromLocalStorageAndDecrypt('inviteStatus'));
            const { popUpData: { modalProps: { status = false, open = false } = {} } } = this.props;
            if (prevProps.rosterData && ( prevProps.rosterData.id !== this.props.rosterData.id || 
                prevProps?.rosterData?.isFetchingUserList !== this.props?.rosterData?.isFetchingUserList) &&
                 (isInviteStatus === null && !status && !open))
            {
                this.handleUpdateRoster(this.props.rosterData.data, this.props?.rosterData?.isFetchingUserList);
            }
        } else {
            if (prevProps.rosterData && prevProps.rosterData.id !== this.props.rosterData.id) {
                this.handleUpdateRoster(this.props.rosterData.data);
            }
        }
    }

    /**
     * handleRosterData() method is perform to separate the email and mobile contacts.
     */
    handleRosterData() {
        if (this.state.filterItem.length > 0) {
            return this.state.filterItem.map((roster, index) => {
                let key = index;
                return (
                    <React.Fragment key={key}>
                        {roster.emailId ? this.handleEmailContacts(roster) : this.handleMobileContacts(roster)}
                    </React.Fragment>
                )
            });
        } else if (this.state.filterItem.length === 0 && this.state.searchWith !== "") {
            return <div className="no-search-record-found">
                <div className="norecent-chat">
                    <i className="norecent-chat-img">
                        <EmptySearch />
                    </i>
                    <h4>{NO_SEARCH_CONTACT_FOUND} </h4>
                </div>
            </div>
        } else {
            return <>
                <div className="norecent-chat">
                    <i className="norecent-chat-img">
                        <EmptyContact />
                    </i>
                    <h4>{"It seems like there are no contacts"}</h4>
                </div>
            </>
        }
    }

    /**
     * handleFilterContactsList() method is to handle the searched contacts from list
     * @param {object} filterData
     * @param {string} searchWith
     */
    handleFilterContactsList(filterData, searchWith) {
        if (!REACT_APP_CONTACT_SYNC) {
            this.setState({ searchWith: searchWith });
        } else {
            this.setState({ filterItem: filterData, searchWith: searchWith });
        }
    }

    fetchMoreData = () => {
        let userListArr = this.state.userList;
        userList.getUsersListFromSDK(Math.ceil((userListArr.length / 20) + 1), getValidSearchVal(this.state.searchWith));
    }

    handleUserListData() {
        let dataArr = [];
        if (this.state.filterItem.length > 0 && this.state.userList.length > 0) {
            this.state.userList.forEach((roster, index) => {
              dataArr.push(
                <React.Fragment key={`user_${index + 1}`}>
                  {roster.emailId ? this.handleEmailContacts(roster) : this.handleMobileContacts(roster)}
                </React.Fragment>
              );
            });
        } else if (this.state.filterItem.length === 0 && this.state.searchWith !== "") {
            dataArr.push(
                <div key ="0" className="no-search-record-found">
                    <div className="norecent-chat">
                        <i className="norecent-chat-img">
                            <EmptySearch />
                        </i>
                        <h4>{NO_SEARCH_CONTACT_FOUND} </h4>
                    </div>
                </div>
                );
        }
        return dataArr;
    }

    render() {
        const loaderStyle = {
            width: 50,
            height: 50
        }
        const { newChatStatus } = this.props
        const userListArr = this.handleUserListData();
        return (
            <Fragment>
                <div style={{ display: newChatStatus ? 'none' : '' }} className="contactlist">
                    <div className="recent-chatlist-header">
                        <div className="profile-img-name">
                            <i className="newchat-icon" onClick={this.handleOnBack} title="Back">
                                <ArrowBack />
                            </i>
                            <span>{"New chat"}</span>
                        </div>
                    </div>
                    <WebChatSearch searchIn={this.state.searchIn} handleSearchFilterList={this.handleFilterContactsList} />
                    { REACT_APP_CONTACT_SYNC &&
                    <ul className="chat-list-ul">
                        {
                            this.state.loaderStatus &&
                            <div className="response_loader style-2">
                                <img src={loaderSVG} alt="loader" style={loaderStyle} />
                            </div>
                        }
                        {this.handleRosterData()}
                    </ul>
                    } 
                    { !REACT_APP_CONTACT_SYNC &&  
                        <ul className="chat-list-ul" id="scrollableUl">
                        {this.state.loaderStatus && <div className="loader-container style-2">
                            <img src={loaderSVG} alt="loader"  />
                        </div>}
                        { this.props.isAppOnline ?
                            <InfiniteScroll 
                                dataLength={userListArr.length}
                                next={this.fetchMoreData}
                                hasMore={true}
                                scrollableTarget="scrollableUl"
                            >
                                {this.handleUserListData()}
                            </InfiniteScroll>
                            : this.handleUserListData()
                        }
                        </ul>
                    }
                </div>
            </Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    return ({
        rosterData: state.rosterData,
        vCardData: state.vCardData.data,
        VCardContactData: state.VCardContactData,
        messageData: state.messageData,
        contactsWhoBlockedMe: state.contactsWhoBlockedMe,
        blockedContact: state.blockedContact,
        isAppOnline: state?.appOnlineStatus?.isOnline,
        popUpData: state.popUpData
    });
};

export default connect(mapStateToProps, null)(WebChatRoster);
