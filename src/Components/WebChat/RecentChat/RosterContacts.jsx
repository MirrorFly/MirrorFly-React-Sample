import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { ActiveChatAction } from '../../../Actions/RecentChatActions';
import { getHighlightedText } from '../../../Helpers/Utility';
import Store from '../../../Store';
import ProfileImage from '../Common/ProfileImage';
import { formatUserIdToJid, getContactNameFromRoster } from '../../../Helpers/Chat/User';
import UserStatus from '../Common/UserStatus';
import { getFromLocalStorageAndDecrypt } from '../WebChatEncryptDecrypt';
const token = getFromLocalStorageAndDecrypt('token');
class RosterContacts extends React.Component {
    /**
     * handleContacts() method to display the email contacts in new chat.
     * @param {object} roster
     */
    handleContacts(roster, index) {
        const { image, status, statusMsg, emailId, chatType, userId } = roster
        const contactName = getContactNameFromRoster(roster);
        const { searchTerm } = this.props
        const hightlightText = getHighlightedText(contactName, searchTerm)
        const statusMessage = status || statusMsg
        return <li className="chat-list-li" key={`${contactName}-${index}`} onClick={(e) => this.handleRoster(e, roster)}>
            <ProfileImage
                chatType={chatType || 'chat'}
                userToken={token}
                imageToken={image}
                emailId={emailId}
                userId={userId}
                name={contactName}
            />
            <div className="recentchats">
                <div className="recent-username-block">
                    <div className="recent-username">
                        <div className="username">
                            <h3 title={contactName}>
                                {hightlightText}
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="recent-message-block">
                    <UserStatus status={statusMessage} userId={userId} />
                </div>
            </div>
        </li>
    }

    handleRoster = (event, response) => {
        const data = {
            roster: response,
            recent: { chatType: "chat" }
        }
        data.chatType = "chat";
        data.chatId = response.userId;
        data.chatJid = formatUserIdToJid(response.userId);
        Store.dispatch(ActiveChatAction(data));
    }

    /**
     * handleRosterData() method is perform to separate the email and mobile contacts.
     */
    handleRosterData() {
        const { filteredContacts } = this.props
        return filteredContacts.map((roster, index) => this.handleContacts(roster, index));
    }

    render() {
        const { searchTerm } = this.props
        if (!searchTerm) return null;
        const contacts = this.handleRosterData()
        return (
            <Fragment>
                {contacts.length > 0 &&
                    <span className="unknown-chat-roster">
                        <div className="search-head">{"Contacts"}</div>
                        <ul className="chat-list-ul">
                            {contacts}
                        </ul>
                    </span>
                }
            </Fragment>
        );
    }
}

const mapStateToProps = (state, props) => {
    return ({
        rosterData: state.rosterData,
        contactsWhoBlockedMe: state.contactsWhoBlockedMe
    });
};

export default connect(mapStateToProps, null)(RosterContacts);
