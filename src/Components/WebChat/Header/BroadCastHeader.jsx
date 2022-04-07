import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowBack } from '../../../assets/images';
import { displayNameFromRencentChat } from '../../../Helpers/Chat/ChatHelper';
import { ls } from '../../../Helpers/LocalStorage';
import { getFormatPhoneNumber } from '../../../Helpers/Utility';
import ProfileImage from '../Common/ProfileImage';
class BroadCastHeader extends React.Component {

    constructor(props = {}) {
        super(props)
        this.state = {
            viewContactStatus: false
        }
    }

    displayBroadCastMemberNames = () => {
        const { groupMemberDetails = [] } = this.props
        return groupMemberDetails && groupMemberDetails.map(member => {
            const { displayName, name, username, jid } = member
            return displayName || name || username || getFormatPhoneNumber(jid)
        }).join(',')
    }

    handlePopUp = () => {

    }

    render() {
        const { userData: { data: { recent: { msgfrom = "" } = {}, roster = {} } = {} } = {} } = this.props
        const { emailId, image } = roster
        const displayName = displayNameFromRencentChat(roster) || getFormatPhoneNumber(msgfrom)
        const token = ls.getItem('token');
        return (
            <Fragment>
                <div className="conversation-header">
                    <ToastContainer />
                    <div className="user-profile-name">
                        <i className="arrow-icon" onClick={this.handlePopUp} >
                            <ArrowBack />
                        </i>
                        <div className="user-profile-name" onClick={this.handlePopUp}>
                            <ProfileImage
                                chattype={'broadcast'}
                                userToken={token}
                                imageToken={image}
                                emailId={emailId}
                            />
                            <div className="profile-name">
                                <h4>{displayName}</h4>
                                <h6>{this.displayBroadCastMemberNames()}</h6>
                            </div>
                        </div>
                    </div>
                </div>
            </Fragment>
        )
    }
}


const mapStateToProps = state => {
    return {
        popUpData: state.popUpData,
        messageData: state.messageData
    }
}

export default connect(mapStateToProps, null)(BroadCastHeader);
