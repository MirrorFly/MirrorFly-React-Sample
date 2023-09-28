import React, { Component, Fragment } from 'react';
import SDK from '../../SDK';
import Contact from './Contact';
import { get as _get } from "lodash";
import Badge from '../NewGroup/Badge';
import { connect } from 'react-redux';
import { hideModal } from '../../../Actions/PopUp';
import RecentSearch from '../RecentChat/RecentSearch';
import { fetchMoreParticipantsData, getValidSearchVal, handleFilterBlockedContact } from '../../../Helpers/Utility';
import { Close2, Info, Tick2, loaderSVG } from '../../../assets/images';
import { NO_SEARCH_CHAT_CONTACT_FOUND, REACT_APP_CONTACT_SYNC, REACT_APP_XMPP_SOCKET_HOST } from '../../processENV';
import { getContactNameFromRoster, getUserInfoForSearch, getFriendsFromRosters, formatUserIdToJid } from '../../../Helpers/Chat/User';
import InfiniteScroll from 'react-infinite-scroll-component';
import userList from '../RecentChat/userList';

class ParticipantPopUp extends Component {

    constructor(props = {}) {
        super(props)
        this.state = {
            searchValue: '',
            groupMembers: [],
            participantToAdd: [],
            errorMesage: '',
            isLoading: true,
            filteredContacts: [],
            loaderStatus: !!props?.rosterData?.isFetchingUserList,
            userList: [],
        }
        this.timer = 0
    }

    removeParticipant = (userName) => {
        this.setState({
            participantToAdd: this.state.participantToAdd.filter(function (user) {
                return user.userId !== userName
            })
        });
    }

    errorMessageListner = (errorMesage) => {
        this.setState({
            errorMesage: errorMesage
        })
    }

    componentDidMount() {
        if (!REACT_APP_CONTACT_SYNC) {
            this.setState({
                userList : [],
                loaderStatus: this.props?.rosterData?.isFetchingUserList,
                isLoading: this.props?.rosterData?.isFetchingUserList
            })
        } else {
            this.timer = setTimeout(() => {
                this.setState({ isLoading: false, filteredContacts: this.contactsSearch('') })
            }, 500);
        }
    }

    componentWillUnmount() {
        clearTimeout(this.timer)
    }

    componentDidUpdate(prevProps) {
        if (prevProps.rosterData && prevProps.rosterData.id !== this.props.rosterData.id) {
            let selectedContactId = this.state.participantToAdd.map(ele => {
                let foundRoster = this.props.rosterData?.data?.find(el => el.userId === ele?.roster?.userId);
                if (!foundRoster.isAdminBlocked && !foundRoster.isDeletedUser) return ele;
            });

            selectedContactId = selectedContactId.filter(function( element ) {
                return element !== undefined;
             });
            const { rosterData: { data } } = this.props
            if (!REACT_APP_CONTACT_SYNC) {
                this.setState({
                    participantToAdd: selectedContactId,
                    loaderStatus: this.props?.rosterData?.isFetchingUserList,
                    filteredContacts: getFriendsFromRosters(handleFilterBlockedContact(data)),
                    userList: getFriendsFromRosters(handleFilterBlockedContact(data))
                });
            } else {
                const searchValue = getValidSearchVal(this.state.searchValue);
                const filteredContacts = this.contactsSearch(searchValue);
                this.setState({
                    participantToAdd: selectedContactId,
                    filteredContacts: filteredContacts
                });
            }
        }
    }

    addParticipant = (userName, userInfo) => {
        this.setState({
            participantToAdd: this.state.participantToAdd.concat({
                userId: userName,
                ...userInfo
            })
        });
    }

    prepareContactToAdd = (userName, userInfo) => {
        const exists = this.state.participantToAdd.find(user => user.userId === userName)
        if (!exists) {
            return this.addParticipant(userName, userInfo);
        }
        return false;
    }

    prepareContactToRemove = (userName) => {
        const exists = this.state.participantToAdd.find(user => user.userId === userName)
        if (exists) {
            return this.removeParticipant(userName)
        }
        return false;
    };

    contactsSearch = (searchTerm) => {
        const { popUpData: { modalProps: { groupMembers } } } = this.props
        const { rosterData: { data } } = this.props
        if (!data) {
            return [];
        }
        return handleFilterBlockedContact(data).filter((item) => {
            const rosterJid = (item.username) ? item.username : item.userId;
            if (groupMembers.indexOf(rosterJid) > -1) {
                return false
            }
            const regexList = getUserInfoForSearch(item);
            return regexList.find((str) => {
                if (!item.isFriend || !str) return false
                return (str.search(new RegExp(searchTerm, "i")) !== -1)
            });
        });
    }

    searchFilterList = (searchValue = "") => {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
            searchValue = getValidSearchVal(searchValue);
            let searchWith = searchValue;
            if (!searchValue) {
                const { rosterData: { data } } = this.props
                if (!REACT_APP_CONTACT_SYNC) {
                    this.setState({
                        searchValue: '',
                        errorMesage: '',
                        filteredContacts: getFriendsFromRosters(handleFilterBlockedContact(data)),
                        userList: getFriendsFromRosters(handleFilterBlockedContact(data))
                    })
                    userList.getUsersListFromSDK(1, searchWith);
                } else {
                    this.setState({
                        searchValue: '',
                        errorMesage: '',
                        filteredContacts: getFriendsFromRosters(handleFilterBlockedContact(data))
                    })
                }
                return;
            }
            const filteredContacts = this.contactsSearch(searchWith)
            if (!REACT_APP_CONTACT_SYNC) {
                this.setState({
                    searchValue: searchValue,
                    filteredContacts: filteredContacts,
                    userList: filteredContacts
                })
                userList.getUsersListFromSDK(1, searchWith);
            } else {
                this.setState({
                    searchValue: searchValue,
                    filteredContacts: filteredContacts
                })
            }
        }, 0);
    }

    addUsersInGroup = () => {
        const { participantToAdd = [] } = this.state
        const { popUpData: { modalProps: { groupMembers = [], groupName = "", groupuniqueId = "" } = {} } = {} } = this.props
        const membersCount = _get(groupMembers, "length", 0) + _get(participantToAdd, "length", 0);
        if (membersCount < 2) {
            this.setState({
                errorMesage: 'Select minimum of two contacts'
            });
            return
        }
        if (membersCount < 239) {
            this.setState({
                errorMesage: ''
            }, () => {
                participantToAdd.forEach(({ userId }) => {
                    const jid = userId + "@" + REACT_APP_XMPP_SOCKET_HOST;
                    SDK.addParticipants(groupuniqueId, groupName, [jid]);
                })
                this.props.closePopup()
            })
        }
    }

    handleUserListData() {
        let dataArr = [];
        const { searchValue, participantToAdd } = this.state;
        const { popUpData: { modalProps: { groupMembers } = {} } = {} } = this.props;
        let usersList = this.state.userList;
        usersList = usersList.filter(contact => !groupMembers.includes(contact.userId));
        if (usersList.length > 0) {
            usersList.forEach((contact) => {
              const { username, userId } = contact;
              const contactName = getContactNameFromRoster(contact);
              const updateJid = username || userId;
              const isChanged = participantToAdd.findIndex((participant) => participant.userId === updateJid);
              let blockedContactArr = this.props.blockedContact.data;
              const jid = formatUserIdToJid(updateJid);
              const isBlocked = blockedContactArr.indexOf(jid) > -1;
              dataArr.push(
                <Contact
                  isBlocked={isBlocked}
                  searchValue={searchValue}
                  contactName={contactName}
                  isChanged={isChanged}
                  membersCount={groupMembers.length + participantToAdd.length}
                  errorMessageListner={this.errorMessageListner}
                  prepareContactToAdd={this.prepareContactToAdd}
                  prepareContactToRemove={this.prepareContactToRemove}
                  key={updateJid}
                  roster={contact}
                  {...contact}
                />
              );
            });
          }          
        return dataArr;
    }
    fetchMoreData = () => {
        fetchMoreParticipantsData(this.state.userList, this.state.searchValue);
    }

    render() {
        let { filteredContacts, searchValue, participantToAdd, errorMesage, isLoading, loaderStatus } = this.state;
        const { closePopup } = this.props;
        const { popUpData: { modalProps: { groupMembers } = {} } = {} } = this.props;
        filteredContacts = filteredContacts.filter(contact => !groupMembers.includes(contact.userId));
        const userListArr = this.handleUserListData();
        return (
            <Fragment>
                <div className="popup-wrapper">
                    <div className="popup-container add-participant audio">
                        <div className="popup-container-inner">
                            <div className="popup-container-header">
                                <i onClick={closePopup} className="closePopup"><Close2 /></i>
                                <h5>Add group participants</h5>
                                <i
                                    className="addPopup"
                                    onClick={this.addUsersInGroup}
                                    data-jest-id={"jestaddUsersInGroup"}
                                >
                                    <Tick2 />
                                </i>
                            </div>
                            <RecentSearch search={this.searchFilterList} />
                            <div className="popup-body">
                                <div className="contactList">
                                    { REACT_APP_CONTACT_SYNC &&
                                    <ul className="chat-list-ul">
                                        {isLoading && <div className="response_loader style-2">
                                            <img src={loaderSVG} alt="loader"  />
                                        </div> }
                                        {filteredContacts.length === 0 && searchValue &&
                                            <span className="searchErrorMsg"><Info />
                                                {NO_SEARCH_CHAT_CONTACT_FOUND}
                                            </span>}
                                        <li className="chat-list-li BadgeContainer">
                                            <div className="selectedBadge">
                                                <ul>
                                                    {participantToAdd.map(participant => {
                                                        const { userId } = participant
                                                        return <Badge
                                                            key={userId}
                                                            {...participant}
                                                            removeParticipant={this.removeParticipant}
                                                        />
                                                    })}
                                                </ul>
                                            </div>
                                        </li>
                                        <li>{errorMesage &&
                                            <div className="errorMesage"><Info /><span>
                                                {errorMesage}</span></div>}
                                        </li>
                                        {filteredContacts.map(contact => {
                                            const { username, userId } = contact
                                            const contactName = getContactNameFromRoster(contact);
                                            const updateJid = username || userId
                                            const isChanged = participantToAdd.findIndex(participant => participant.userId === updateJid);
                                            let blockedContactArr = this.props.blockedContact.data;
                                            const jid = formatUserIdToJid(updateJid);
                                            const isBlocked = blockedContactArr.indexOf(jid) > -1;
                                            return (
                                                <Contact
                                                    isBlocked={isBlocked}
                                                    searchValue={searchValue}
                                                    contactName={contactName}
                                                    isChanged={isChanged}
                                                    membersCount={groupMembers.length + participantToAdd.length}
                                                    errorMessageListner={this.errorMessageListner}
                                                    prepareContactToAdd={this.prepareContactToAdd}
                                                    prepareContactToRemove={this.prepareContactToRemove}
                                                    key={updateJid}
                                                    roster={contact}
                                                    {...contact}
                                                />
                                            )
                                        })}
                                    </ul> }
                                    { !REACT_APP_CONTACT_SYNC && 
                                        <ul style={{height:"100%"}} className="chat-list-ul" id="scrollableUl-addparticipant">
                                            {loaderStatus && <div className="response_loader style-2">
                                            <img src={loaderSVG} alt="loader"  />
                                            </div> }
                                            {filteredContacts.length === 0 && searchValue &&
                                            <span className="searchErrorMsg"><Info />
                                                {NO_SEARCH_CHAT_CONTACT_FOUND}
                                            </span>
                                            }
                                            <li className="chat-list-li BadgeContainer">
                                                <div className="selectedBadge">
                                                    <ul>
                                                        {participantToAdd.map(participant => {
                                                            const { userId } = participant
                                                            return <Badge
                                                                key={userId}
                                                                {...participant}
                                                                removeParticipant={this.removeParticipant}
                                                            />
                                                        })}
                                                    </ul>
                                                </div>
                                            </li>
                                            { this.props.isAppOnline ?
                                            <InfiniteScroll
                                                dataLength={userListArr.length}
                                                next={this.fetchMoreData}
                                                hasMore={true}
                                                scrollableTarget="scrollableUl-addparticipant"
                                            >
                                                {this.handleUserListData()}
                                            </InfiniteScroll>
                                                : this.handleUserListData()
                                            }
                                        </ul>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Fragment>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        rosterData: state.rosterData,
        popUpData: state.popUpData,
        contactsWhoBlockedMe: state.contactsWhoBlockedMe,
        blockedContact: state.blockedContact,
        isAppOnline: state?.appOnlineStatus?.isOnline,

    }
}
const mapDispatchToProps = {
    closePopup: hideModal,
}


export default connect(mapStateToProps, mapDispatchToProps)(ParticipantPopUp);
