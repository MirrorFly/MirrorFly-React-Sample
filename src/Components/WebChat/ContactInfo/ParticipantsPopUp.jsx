import React, { Component, Fragment } from 'react';
import SDK from '../../SDK';
import Contact from './Contact';
import { get as _get } from "lodash";
import Badge from '../NewGroup/Badge';
import { connect } from 'react-redux';
import { hideModal } from '../../../Actions/PopUp';
import RecentSearch from '../RecentChat/RecentSearch';
import { getValidSearchVal } from '../../../Helpers/Utility';
import { Close2, Info, Tick2 } from '../../../assets/images';
import { NO_SEARCH_CHAT_CONTACT_FOUND, REACT_APP_XMPP_SOCKET_HOST } from '../../processENV';
import { getContactNameFromRoster, getUserInfoForSearch, getFriendsFromRosters, formatUserIdToJid } from '../../../Helpers/Chat/User';

class ParticipantPopUp extends Component {

    constructor(props = {}) {
        super(props)
        this.state = {
            searchValue: '',
            groupMembers: [],
            participantToAdd: [],
            errorMesage: '',
            isLoading: true,
            filteredContacts: []
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
        this.timer = setTimeout(() => {
            this.setState({ isLoading: false, filteredContacts: this.contactsSearch('') })
        }, 500);
    }

    componentWillUnmount() {
        clearTimeout(this.timer)
    }

    componentDidUpdate(prevProps) {
        if (prevProps.rosterData && prevProps.rosterData.id !== this.props.rosterData.id) {
            this.searchFilterList(this.state.searchValue);
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
        return data.filter((item) => {
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
            let searchWith = getValidSearchVal(searchValue);
            if (!searchValue) {
                const { rosterData: { data } } = this.props
                this.setState({
                    searchValue: '',
                    errorMesage: '',
                    filteredContacts: getFriendsFromRosters(data)
                })
                return;
            }
            const filteredContacts = this.contactsSearch(searchWith)
            this.setState({
                searchValue: searchValue,
                filteredContacts: filteredContacts
            })
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
            return;
        }
    }

    render() {
        var { filteredContacts, searchValue, participantToAdd, errorMesage } = this.state;
        const { closePopup, isLoading } = this.props;
        const { popUpData: { modalProps: { groupMembers } = {} } = {} } = this.props;
        filteredContacts = filteredContacts.filter(contact => !groupMembers.includes(contact.userId));
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
                                {isLoading && <div className="loader"></div>}
                                {!isLoading &&
                                    <div className="contactList">
                                        <ul className="chat-list-ul">
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
                                        </ul>
                                    </div>
                                }
                            </div>
                        </div>
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
        contactsWhoBlockedMe: state.contactsWhoBlockedMe,
        blockedContact: state.blockedContact
    }
}
const mapDispatchToProps = {
    closePopup: hideModal,
}


export default connect(mapStateToProps, mapDispatchToProps)(ParticipantPopUp);
