import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux';
import RecentSearch from '../WebChat/RecentChat/RecentSearch';
import { ReactComponent as Close2 } from '../../assets/images/close2.svg';
import { ReactComponent as Info } from '../../assets/images/errorinfo.svg';
import Contact from '../WebChat/ContactInfo/Contact'
import { NO_SEARCH_CHAT_CONTACT_FOUND, REACT_APP_XMPP_SOCKET_HOST } from '../processENV';
import { getLocalUserDetails, getUserDetails, getUserInfoForSearch } from "../../Helpers/Chat/User";
import ParticipantsBadge from './ParticipantsBadge';
import { toast } from 'react-toastify';
import { getMaxUsersInCall } from '../../Helpers/Call/Call';
import { FloatingCallAudio, FloatingCallVideo, IconCopy, IconLink } from '../../assets/images';
import SDK from '../SDK';
import { getCallFullLink } from '../../Helpers/Utility';
import Store from '../../Store';
import { callIntermediateScreen } from '../../Actions/CallAction';

let rosterDatas = [];

class ParticipantPopUp extends Component {

    constructor(props) {
        super(props)
        const { popUpData: { modalProps: { groupMembers, modelType } } } = props;
        this.isInviteModelType = modelType === 'inviteParticipants';
        this.isCallLogModelType = modelType === 'calllogparticipants';

        this.state = {
            searchValue: '',
            groupMembers: [],
            participantToAdd: this.isCallLogModelType ? groupMembers : [],
            errorMesage: '',
            isLoading: true,
            filteredContacts: [],
            copyToast:false,
            callLink: ""
        }
        this.timer = 0;

    }

    removeParticipant = (userName) => {
        let participants = this.state.participantToAdd;
        participants = participants.filter(item => item !== userName)
        this.setState({ participantToAdd: participants });
    }

    errorMessageListner = (errorMesage) => {
        this.setState({
            errorMesage: errorMesage
        })
    }

    componentDidUpdate(prevProps) {
        if (prevProps.rosterData.id !== this.props.rosterData.id) {
            this.renderParticpantPopup();
        }
    }

    componentWillMount() {
        this.renderParticpantPopup();
    }

    getCallInfoDetails = async () => {
        if (this.isInviteModelType) {
            const { callIntermediateScreen: { data: { link = "" } = {} } = {} } = this.props;
            let callLink;
            if (!link) {
                const roomLink = await SDK.getCallLink();
                console.log('roomLink :>> ', roomLink);
                if (roomLink && roomLink.statusCode === 200) {
                    callLink = roomLink.data
                }
            } else {
                callLink = link;
            }
            this.setState({ callLink });
            Store.dispatch(callIntermediateScreen({ link: callLink }));
        }
    }

    componentDidMount() {
        this.getCallInfoDetails();
        this.setState({ isLoading: false })
    }

    componentWillUnmount() {
        clearTimeout(this.timer)
    }

    renderParticpantPopup = () => {
        const { popUpData: { modalProps: { groupMembers, groupMemberDetails, selectDefault } } } = this.props
        let { searchValue, participantToAdd } = this.state;
        let data = [];
        const vcardData = getLocalUserDetails();
        groupMemberDetails.map(member => {
            let rosterData = {};
            let user = member.userJid || member.GroupUser || member.username;
            const userId = user.includes("@") ? user.split('@')[0] : user;
            if (userId !== vcardData.fromUser) {
                rosterData = getUserDetails(userId);
                data.push(rosterData)
            }
        });

        if(selectDefault && data.length <= 7){
            data.forEach((user) => {
                this.prepareContactToAdd(user.userJid);
            });
        }

        rosterDatas = data;
        let filteredContacts = data.filter((item) => {
            let rosterJid = (item.username) ? item.username : item.userJid;
            if (groupMembers.indexOf(rosterJid) === -1) {
                return false
            }
            const { emailId = null, name = null, displayName = null, nickName = null, msgfrom = null, userJid = null } = item;
            const regexList = Object.values({ emailId, name, displayName, nickName, msgfrom, userJid })
            return regexList.find((str) => {
                if (str) {
                    return (str.search(new RegExp(searchValue ? searchValue : "", "i")) !== -1)
                }
                return false;
            });
        });
        this.setState({ participantToAdd: participantToAdd, filteredContacts: filteredContacts, groupMembers: rosterDatas });
    }

    addParticipant = (userName, userInfo) => {
        let participants = this.state.participantToAdd;
        participants.push(userName);
        this.setState({ participantToAdd: participants });
    }

    prepareContactToAdd = (userName, userInfo) => {
        const exists = this.state.participantToAdd.includes(userName);
        if (!exists) {
            return this.addParticipant(userName, userInfo);
        }
        return true;
    }

    prepareContactToRemove = (userName, userInfo) => {
        const exists = this.state.participantToAdd.includes(userName);
        if (exists) {
            return this.removeParticipant(userName);
        }
        return "";
    }

    contactsSearch = (searchTerm) => {
        let participantToAdd = this.state.participantToAdd;
        const { groupMembers } = this.state;
        if (groupMembers) {
            return groupMembers.filter((item) => {
                const rosterJid = item.username || item.userJid;
                if (searchTerm === "") {
                    if (participantToAdd.indexOf(rosterJid) === -1) {
                        return false
                    }
                }
                const regexList = getUserInfoForSearch(item);
                return regexList.find((str) => {
                    if (!item.isFriend || !str) return false
                    return (str.search(new RegExp(searchTerm, "i")) !== -1)
                });
            });
        }
        return "";
    }

    searchFilterList = (searchValue) => {
        searchValue = searchValue.trim();
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
            let searchWith = searchValue.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            if (!searchValue) {
                let data = rosterDatas;
                this.setState({
                    searchValue: '',
                    errorMesage: '',
                    filteredContacts: data
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

    addUsersInCall = () => {
        const { participantToAdd } = this.state
        const { popUpData: { modalProps: { makeGroupCall, callType, groupuniqueId, currentCallUsersLength } } } = this.props
        let membersCount = participantToAdd.length;
        if (membersCount < 1) {
            toast.error("Select minimum of one contacts");
            return
        }
        membersCount = membersCount + (currentCallUsersLength || 0);
        if (membersCount > (getMaxUsersInCall() - 1)) {
            toast.error("Maximum " + getMaxUsersInCall() + " members allowed in a call");
            return
        }
        if (membersCount <= (getMaxUsersInCall() - 1)) {
            this.setState({
                errorMesage: ''
            }, () => {
                makeGroupCall(callType, participantToAdd, groupuniqueId);
                this.props.popUpData.modalProps.closePopup();
            });
        }
    }

    selectedBadge = () => {
        let { participantToAdd } = this.state;
        let token = localStorage.getItem('token');
        return rosterDatas.map((contact, key) => {
            const { displayName, name, username, userJid, image } = contact
            const contactName = displayName || name || username
            const updateJid = username || userJid
            if (!participantToAdd.includes(updateJid)) {
                return false
            }
            return (
                <ParticipantsBadge removeParticipant={this.removeParticipant} key={key} jid={updateJid} userToken={token} image={image} contactName={contactName} />
            )
        })
    }

    invideModeFun = () => {
        return this.isInviteModelType ? 'Invite Participants' : "Group Call"
    };

    handleCopyLink = () => {
        navigator.clipboard.writeText(getCallFullLink(this.state.callLink));
        this.setState({
            copyToast:true
        })
        setTimeout(() => {
            this.setState({
                copyToast:false
            })
        }, 3000);
    }

    render() {
        const { filteredContacts, searchValue, participantToAdd, errorMesage,copyToast } = this.state
        const { isLoading } = this.props;
        const { popUpData: { modalProps: { groupName, currentCallUsersLength,callType, closePopup } } } = this.props;
        let BadgeList = this.selectedBadge();
        
        const title = this.isCallLogModelType ? 'Participants' : this.invideModeFun();
        const hideSerachBox = this.isCallLogModelType;
        const hideCheckbox = this.isCallLogModelType;
        const hideBadgeList = this.isCallLogModelType;
        const maxMemberReached = Boolean((participantToAdd.length + (currentCallUsersLength || 0)) >= (getMaxUsersInCall() - 1));
        const hideCallNow = Boolean((participantToAdd.length + (currentCallUsersLength || 0)) >= (getMaxUsersInCall()));
        const blockedContactArr = this.props.blockedContact.data;
        const isAllUsersExists = filteredContacts.length === 0 && !searchValue;

        return (
            <Fragment>
                <div className="popup-wrapper">
                    <div className="popup-container add-participant webcall">
                        <div className="popup-container-inner">
                            <div className="popup-container-header">
                                <i onClick={closePopup} className="closePopup"><Close2 /></i>
                                <h5>
                                    <span className="calltype">{title}</span>
                                    {groupName && <span className="groupName">({groupName}) </span>}
                                </h5>
                                {/* <span className="webcallConnet" onClick={ this.addUsersInCall }>Connect</span> */}
                            </div>
                            {this.state.callLink && <div className={`meetingLinkCopy`}>
                                <h3 className='meeting_heading'>Call Link</h3>
                                <div className='meeting_body'>
                                    <i className='linkIcon'><IconLink/></i>
                                    <div className='link_desc'>
                                        <strong className='link_details'>{this.state.callLink}</strong>
                                    </div>
                                    <i className='linkCopyIcon' onClick={() => this.handleCopyLink()}>
                                        <IconCopy/>
                                    </i>
                                </div>
                            </div>}

                            {!hideSerachBox && <RecentSearch search={this.searchFilterList} />}

                            <div className="popup-body">
                                {isLoading && <div className="loader"></div>
                                }
                                {!isLoading &&
                                    <div className="contactList">
                                        <ul className="chat-list-ul">
                                            {!hideBadgeList &&
                                                <li className="chat-list-li BadgeContainer">
                                                    <div className="selectedBadge">
                                                        <ul>
                                                            {BadgeList}
                                                        </ul>
                                                    </div>
                                                </li>
                                            }
                                            {filteredContacts.length === 0 && searchValue &&
                                                <span className="searchErrorMsg"><Info /> {NO_SEARCH_CHAT_CONTACT_FOUND}</span>
                                            }
                                            {isAllUsersExists &&
                                                <span className="searchErrorMsg"><Info /> All members of your contacts are already in the call.</span>
                                            }
                                            <li>{errorMesage && <div className="errorMesage"><Info /><span>{errorMesage}</span></div>}</li>
                                            {filteredContacts.map(contact => {
                                                const { displayName, name, username, userJid, status , initialName } = contact
                                                const contactName = displayName || name || username
                                                let updateJid = username || userJid
                                                let isChanged = participantToAdd.includes(updateJid) ? 1 : -1;
                                                const isBlocked = blockedContactArr.indexOf(updateJid.includes("@") ? updateJid : updateJid + "@" + REACT_APP_XMPP_SOCKET_HOST) > -1;
                                                return (
                                                    <Contact
                                                        initialName = {initialName}
                                                        isBlocked={isBlocked}
                                                        searchValue={searchValue}
                                                        contactName={contactName}
                                                        isChanged={isChanged}
                                                        statusMsg={status}
                                                        image={contact.image}
                                                        emailId={contact.emailId}
                                                        membersCount={filteredContacts.length + participantToAdd.length}
                                                        errorMessageListner={this.errorMessageListner}
                                                        prepareContactToAdd={this.prepareContactToAdd}
                                                        prepareContactToRemove={this.prepareContactToRemove}
                                                        userJid={userJid}
                                                        userId={userJid}
                                                        key={updateJid}
                                                        hideCheckbox={hideCheckbox}
                                                        maxMemberReached={maxMemberReached}
                                                        roster={contact}
                                                    />
                                                )
                                            })}
                                        </ul>
                                    </div>
                                }
                            </div>
                            <div className={`webcallConnet ${(isAllUsersExists || hideCallNow) ? "disabled": ""}`} onClick={this.state.participantToAdd.length >= 1 ? this.addUsersInCall : ()=>{toast.info("Please select any Participant");}}>
                               <span className="callBtn"><i>{callType === "audio" ? <FloatingCallAudio /> : <FloatingCallVideo/> }</i>
                               <span>Call now {this.state.participantToAdd.length ? `(${this.state.participantToAdd.length})` : null}</span></span>
                            </div>
                        </div>
                         {copyToast &&
                            <div className='copy_toast'>
                                <span>Call Link Copied</span>
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
        blockedContact: state.blockedContact,
        callIntermediateScreen: state.callIntermediateScreen
    }
}

export default connect(mapStateToProps, null)(ParticipantPopUp);
