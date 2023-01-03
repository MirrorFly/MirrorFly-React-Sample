import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { ArrowBack, CreateGroup, Info, EventWaiting, FloatingCallVideo, FloatingCallAudio, loaderSVG } from '../../../assets/images';
import { NO_SEARCH_CHAT_CONTACT_FOUND, REACT_APP_XMPP_SOCKET_HOST } from '../../processENV';
import SDK from '../../SDK';
import Contact from '../ContactInfo/Contact';
import RecentSearch from '../RecentChat/RecentSearch';
import Badge from './Badge';
import { getValidSearchVal, handleFilterBlockedContact, isAppOnline } from '../../../Helpers/Utility';
import { getContactNameFromRoster, getUserInfoForSearch, formatUserIdToJid } from '../../../Helpers/Chat/User';
import { toast } from 'react-toastify';
import { NO_INTERNET } from '../../../Helpers/Constants';
import { getMaxUsersInCall } from '../../../Helpers/Call/Call';
import { getFromLocalStorageAndDecrypt } from '../WebChatEncryptDecrypt';
import userList from '../RecentChat/userList';
import InfiniteScroll from 'react-infinite-scroll-component';

class NewParticipants extends Component {

    constructor(props) {
        super(props)
        this.state = {
            searchValue: '',
            groupMembers: [],
            errorMesage: '',
            inProgress: false,
            participantToAdd: [],
            filteredContacts: [],
            displayUserNames: [],
            loaderStatus: !!props?.rosterData?.isFetchingUserList,
            userList: [],
        }
    }

    componentDidMount() {
        userList.getUsersListFromSDK(1);
    }

    errorMessageListner = (errorMesage) => {
        this.setState({
            errorMesage: errorMesage
        })
    }

    removeParticipant = (userName) => {
        this.setState({
            errorMesage: '',
            participantToAdd: this.state.participantToAdd.filter(function (user) {
                return user.userId !== userName
            })
        });
    }

    addParticipant = (userName, userInfo) => {
        const { participantToAdd } = this.state
        this.setState({
            errorMesage: '',
            participantToAdd: participantToAdd.concat({
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

    prepareContactToRemove = (userName, userInfo) => {
        const exists = this.state.participantToAdd.find(user => user.userId === userName)
        if (exists) {
            return this.removeParticipant(userName);
        }
        return false;
    }

    contactsSearch = (searchTerm) => {
        const { groupMembers } = this.state
        const { rosterData: { data } } = this.props
        if (!data) return [];
        return handleFilterBlockedContact(data).filter((item) => {
            const rosterJid = (item.username) ? item.username : item.jid;
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

    searchFilterList = (searchValue) => {
        searchValue = getValidSearchVal(searchValue);
        let searchWith = searchValue;
        const filteredContacts = this.contactsSearch(searchWith)
        this.setState({
            searchValue: searchValue,
            errorMesage: '',
            filteredContacts: filteredContacts,
            userList: filteredContacts
        });
        userList.getUsersListFromSDK(1, searchWith);
    }

    getBlobfromUrl = () => {
        const { groupProfileImage } = this.props
        if (!groupProfileImage) {
            return Promise.resolve()
        }
        return fetch(groupProfileImage).then(r => r.blob())
    }

    componentDidUpdate(prevProps) {
        if (prevProps.messageData?.id !== this.props.messageData?.id &&
            (!this.props?.messageData?.data?.MessageType &&
                this.props?.messageData?.data?.messageType === "receiveMessage")) {
            const { handleBackToRecentChat, typingMessage,
                messageData: { data: { sendfrom, from: groupId, msgbody: messageBody } } } = this.props
            const fromUser = this.props?.vCardData?.data?.fromuser;
            if (sendfrom.indexOf(fromUser) > -1 && messageBody === '2') {
                this.getBlobfromUrl().then(groupProfileImage => {
                    if (groupProfileImage === "" || groupProfileImage === null || groupProfileImage === undefined) {
                        groupProfileImage = "";
                    }
                    SDK.setGroupInfo(groupId, typingMessage, groupProfileImage, () => {
                        const { participantToAdd } = this.state
                        participantToAdd.forEach(({ userId }) => {
                            const jid = userId + "@" + REACT_APP_XMPP_SOCKET_HOST;
                            SDK.groupAddMember(groupId, typingMessage, jid)
                        })
                        this.setState({
                            inProgress: false
                        }, () => {
                            handleBackToRecentChat()
                        })
                    })
                }).catch(err => {
                    console.log(err, 'error in groupcreation')
                })
            }
        }

        if (prevProps.rosterData && prevProps.rosterData.id !== this.props.rosterData.id) {
            let newSelectedParticipant = this.state.participantToAdd.map(ele => {
                let foundRoster = this.props.rosterData?.data?.find(el => el.userId === ele.userId);
                if (!foundRoster?.isAdminBlocked && !foundRoster?.isDeletedUser) return ele;
            });
            newSelectedParticipant = newSelectedParticipant.filter(function (element) {
                return element !== undefined;
            });
            const filteredContacts = this.contactsSearch(this.state.searchValue)
            this.setState({
                participantToAdd: newSelectedParticipant,
                loaderStatus: this.props?.rosterData?.isFetchingUserList,
                filteredContacts: filteredContacts,
                userList: filteredContacts
            });
        }
    }

    addUsersInGroup = () => {

        const { participantToAdd, inProgress } = this.state
        if (inProgress) {
            return
        }
        if (participantToAdd.length < 2) {
            this.setState({
                errorMesage: 'Select minimum of two contacts'
            })
            return
        }
        if (!isAppOnline()) {
            toast.error(NO_INTERNET);
            return
        }

        this.setState({
            inProgress: true
        }, async () => {
            const { typingMessage } = this.props
            const participantJid = [];
            participantToAdd.map(el => participantJid.push(el.userJid));

            const groupImgBlob = await this.getBlobfromUrl();
            const result = await SDK.createGroup(typingMessage, participantJid, groupImgBlob || "");
            console.log('createGroup result :>> ', result);

            if (result.statusCode === 200) {
                this.setState({
                    inProgress: false
                }, () => {
                    this.props.handleBackToRecentChat();
                })
            } else {
                // Throw Error
            }
        })
    }

    handleMakeNewCall = () => {
        const roomName = getFromLocalStorageAndDecrypt('roomName');
        if (roomName) {
            toast.info("Can't place a new call while you're already in a call.");
            return;
        }
        this.props.handleMakeNewCall(this.props.newCallType, this.state.participantToAdd);
    }

    handleUserListData() {
        let dataArr = [];
        const { searchValue, participantToAdd } = this.state
        const { newCall = false } = this.props
        const maxMemberReached = Boolean(participantToAdd.length >= (getMaxUsersInCall() - 1));
        if (this.state.userList.length > 0) {
            this.state.userList.map((contact) => {
                const { username, userId } = contact
                const contactName = getContactNameFromRoster(contact);
                const updateJid = username || userId
                const isChanged = participantToAdd.findIndex(participant => participant.userId === updateJid)
                let blockedContactArr = this.props.blockedContact.data;
                const jid = formatUserIdToJid(updateJid);
                const isBlocked = blockedContactArr.indexOf(jid) > -1;
                dataArr.push(
                    <Contact
                        isBlocked={isBlocked}
                        searchValue={searchValue}
                        contactName={contactName}
                        isChanged={isChanged}
                        maxMemberReached={newCall ? maxMemberReached : ""}
                        errorMessageListner={this.errorMessageListner}
                        prepareContactToAdd={this.prepareContactToAdd}
                        prepareContactToRemove={this.prepareContactToRemove}
                        key={updateJid}
                        roster={contact}
                        {...contact}
                    />
                )
            });
        }
        return dataArr;
    }

    fetchMoreData = () => {
        let userListArr = this.state.userList;
        let searchWith = getValidSearchVal(this.state.searchValue);
        userList.getUsersListFromSDK(Math.ceil((userListArr.length / 20) + 1), searchWith);
    }

    render() {
        const { participantToAdd, inProgress, filteredContacts, searchValue, errorMesage } = this.state
        const { handleBackToGroup, newCall = false, handleBackToCallLog } = this.props
        const userListArr = this.handleUserListData();
        return (
            <Fragment>
                <div>
                    <div className="contactlist">
                        <div className="recent-chatlist-header">
                            <div className="profile-img-name">
                                {
                                    !inProgress && <i className="newchat-icon" onClick={newCall ? handleBackToCallLog : handleBackToGroup} title="Back">
                                        <ArrowBack />
                                    </i>
                                }
                                <span>{newCall ? "Contacts" : "Add Group Participants"}</span>
                                {!newCall &&
                                    <i onClick={this.addUsersInGroup} className={inProgress ? 'createGroup-loader' : 'createGroup-icon'} title="Create group">
                                        {inProgress ? <EventWaiting /> : <CreateGroup />}
                                    </i>}
                            </div>
                        </div>

                        <RecentSearch search={this.searchFilterList} />
                        {filteredContacts.length === 0 && searchValue &&
                            <span className="searchErrorMsg"><Info /> {NO_SEARCH_CHAT_CONTACT_FOUND}</span>
                        }
                        {errorMesage && <div className="errorMesage"><Info /><span>{errorMesage}</span></div>}
                        {userListArr.length > 0 &&
                            <ul className={`chat-list-ul newGroup ${(newCall && participantToAdd.length > 0) ? "adjustHeight" : "" }`} id="scrollableUl-group">
                                <li className="chat-list-li BadgeContainer">
                                    <div className="selectedBadge">
                                        <ul>
                                            {participantToAdd.map(participant => {
                                                const { userId } = participant
                                                let blockedContactArr = this.props.blockedContact.data;
                                                const jid = formatUserIdToJid(userId);
                                                const isBlocked = blockedContactArr.indexOf(jid) > -1;
                                                return <Badge
                                                    key={userId}
                                                    {...participant}
                                                    isBlocked={isBlocked}
                                                    removeParticipant={this.removeParticipant}
                                                />
                                            })}
                                        </ul>
                                    </div>
                                </li>
                                <InfiniteScroll
                                    dataLength={userListArr.length}
                                    next={this.fetchMoreData}
                                    hasMore={true}
                                    scrollableTarget="scrollableUl-group"
                                >
                                    {this.handleUserListData()}
                                </InfiniteScroll>
                            </ul>
                        }
                        {this.state.loaderStatus && <div className="loader-container style-2">
                            <img src={loaderSVG} alt="loader" />
                        </div>}
                        {newCall && participantToAdd.length > 0 &&
                            <div onClick={this.handleMakeNewCall} className="callButton">
                                <i> {this.props.newCallType === "video" ? <FloatingCallVideo /> : <FloatingCallAudio />}</i> Call now ({participantToAdd.length})
                            </div>
                        }
                    </div>
                </div>
            </Fragment>
        )
    }
}

const mapStateToProps = (state, props) => {
    return {
        rosterData: state.rosterData,
        popUpData: state.popUpData,
        messageData: state.messageData,
        contactsWhoBlockedMe: state.contactsWhoBlockedMe,
        blockedContact: state.blockedContact
    }
}

export default connect(mapStateToProps, null)(NewParticipants);
