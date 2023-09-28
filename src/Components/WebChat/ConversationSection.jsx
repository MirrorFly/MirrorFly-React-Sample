import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import ConversationHeader from './Header/ConversationHeader';
import "../../assets/scss/chatBanner.scss";
import { Chat, Video, Call } from '../../assets/images';
import "../../assets/scss/common.scss";
import { getBroadCastUser, handleParticipantList, isBroadcastChat, isGroupChat } from '../../Helpers/Chat/ChatHelper';
import WebChatConversation from './Conversation/WebChatConversationHistory';
import BroadCastHeader from './Header/BroadCastHeader';
import Timer from '../WebCall/Timer';
import { setGroupParticipants } from '../../Helpers/Chat/Group';
import { formatUserIdToJid, getContactNameFromRoster, isLocalUser } from '../../Helpers/Chat/User';
import { CHAT_TYPE_GROUP } from '../../Helpers/Chat/Constant';

class ConversationSection extends Component {

    constructor(props) {
        super(props);
        this.state = {
            groupMemberDetails: [],
            displayNames: '',
            activeChatId: '' // Selected Chat - UserId or GroupId 
        }
    }

    componentDidUpdate(prevProps) {
        const { rosterData: { id: rosterId }, groupsMemberListData: { id: groupId }, activeChatData: { id } = {} } = this.props
        const previousId = prevProps?.activeChatData?.id
        const previousGroupId = prevProps?.groupsMemberListData?.id
        const previousRosterId = prevProps?.rosterData?.id
        const { ConnectionStateData } = this.props
        if (previousId !== id || previousRosterId !== rosterId || (prevProps?.ConnectionStateData?.id && prevProps?.ConnectionStateData?.id !== ConnectionStateData?.id && ConnectionStateData?.data === 'CONNECTED')) {
            this.constructData()
        } else if (groupId !== previousGroupId) {
            this.updateGroup()
        }
    }

    getGroupMembers = (participants) => {
        const { rosterData: { data: totalContactList = [] } = {} } = this.props
        return participants && (handleParticipantList(participants, totalContactList) || [])
    }

    sortUsersDisplayName = (groupMemberDetails) => {
        return groupMemberDetails.map(member => {
            const nameToDisplay = getContactNameFromRoster(member)
            member.displayName = nameToDisplay
            return member
        }).sort((b, c) => isNaN(parseInt(c.displayName)) - isNaN(parseInt(b.displayName)) || String(b.displayName).localeCompare(String(c.displayName)))
    }

    mapUsers = (userType = null) => {
        const { groupsMemberListData: { data: groupMemberList } = {} } = this.props
        const { participants } = groupMemberList || {}
        const groupMemberDetails = this.getGroupMembers(participants)
        if (!userType) {
            return this.sortUsersDisplayName(groupMemberDetails)
        }
        const filterMember = groupMemberDetails.filter(users => users.userType === userType)
        return this.sortUsersDisplayName(filterMember)
    }

    sortUsersByName = (userType = null) => {
        const { vCardData } = this.props
        let response = userType ? this.mapUsers('o').concat(this.mapUsers('n')) : this.mapUsers()

        let index = response.findIndex((o) => isLocalUser(o.userId))

        if (index !== -1) {
            let activeUser = response.splice(index, 1)[0];
            response.push({
                ...activeUser,
                ...vCardData.data,
                displayName: 'You',
            })
        }
        return response
    }

    displayGroupMemberNames = async () => {
        let memberNames = []
        await this.sortUsersByName().map(async (member) => {
            if (member.userType && member.displayName) {
                memberNames.push(member.displayName);
            }
        });
        const { groupsMemberListData: { data: groupMemberList } = {} } = this.props
        const { participants } = groupMemberList || {}
        const groupMemberDetails = this.getGroupMembers(participants).filter(users => users.userType);
        if (groupMemberDetails.length === memberNames.length) {
            return memberNames.join(", ");
        } else {
            return "click here for group info";
        }
    }

    updateGroup = async () => {
        let response = this.sortUsersByName('o')
        let displayNames = await this.displayGroupMemberNames()
        this.setState({
            groupMemberDetails: response,
            displayNames: displayNames
        })

    }

    getBroadCastMembers = (participants) => {
        const { rosterData: { data: totalContactList = [] } = {} } = this.props
        return participants && getBroadCastUser(participants, totalContactList) || []
    }

    updateBroadCast = (roster) => {
        const { participants } = roster
        const updatedGroupMembers = this.getBroadCastMembers(participants)
        this.setState({
            groupMemberDetails: updatedGroupMembers
        })
    }

    constructData = () => {
        const { activeChatData: { data: { chatType, chatId, roster = {} } = {} } } = this.props
        if (!chatType || !chatId) return

        this.setState({
            activeChatId: chatId
        }, async () => {
            if (isGroupChat(chatType)) {
                const groupJid = formatUserIdToJid(chatId, CHAT_TYPE_GROUP);
                const { groupsMemberParticipantsListData: { groupParticipants = {} } = {} } = this.props || {}
                const participants = groupParticipants[groupJid];
                if (participants && participants.length > 0) {
                    setGroupParticipants({
                        "groupJid": groupJid,
                        "participants": participants
                    });
                }
            } else if (isBroadcastChat(chatType)) {
                this.updateBroadCast(roster)
            }
        })
    }

    handlePopUpClassActive = (status) => {
        this.props.handlePopupState(status);
    };

    render() {
        const { activeChatData, vCardData, ConnectionStateData: { id, data } = {}, modalPopUpReducer = {} } = this.props
        const { activeChatData: { data: { chatType } = {} } } = this.props
        const nickname = this.props?.vCardData?.data?.nickName || '';
        if (activeChatData && activeChatData.length === 0) {
            return (<div className={` chat-banner ${this.props.showonGoingcallDuration ? 'showCallDuration' : ''} `}>
                {this.props.showonGoingcallDuration &&
                    <div className="onGoingcallDuration" onClick={this.props.handleShowCallScreen}>
                        <span className="tapToCall">Tap to return to call {this.props.callDurationTimestamp && <> - <Timer callStatus="" callDurationTimestamp={this.props.callDurationTimestamp} /></>}</span>
                    </div>
                }
                <div className="banner-blocks">
                    <div className="mf-section">
                        <div className="start-chart">
                            <div className="content">
                                <h3>Hi {nickname}{nickname && '!'}</h3>
                                <p>Try the wholesome experience of MirrorFly</p>
                                <div className="start-chat">
                                    <span><i className="iconChating"><Chat /></i>Chatting</span>
                                    <span><i className="iconVoice"><Call /></i>Voice</span>
                                    <span><i className="iconVideo"><Video /></i>Video</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>);
        }
        const { activeChatId, groupMemberDetails, displayNames } = this.state
        return (
            <Fragment>
                <div className={`chat-conversion ${this.props.openStatus ? 'popup-open' : ''} ${modalPopUpReducer.modalPopup ? 'modal-open' : ''}
                 ${this.props.showonGoingcallDuration ? 'showCallDuration' : ''}`}>
                    {this.props.showonGoingcallDuration &&
                        <div className="onGoingcallDuration" onClick={this.props.handleShowCallScreen}>
                            <span className="tapToCall">Tap to return to call {this.props.callDurationTimestamp && <> - <Timer callStatus="" callDurationTimestamp={this.props.callDurationTimestamp} /></>} </span>
                        </div>
                    }
                    {
                        chatType && chatType === 'broadcast' ? <BroadCastHeader
                            userData={activeChatData}
                            vCardData={vCardData}
                            activeChatId={activeChatId}
                            groupMemberDetails={groupMemberDetails}
                            handlePopUpClassActive={this.handlePopUpClassActive}
                            handleConversationSectionDisplay={this.props.handleConversationSectionDisplay}
                        /> :
                            <ConversationHeader
                                userData={activeChatData}
                                vCardData={vCardData}
                                showonGoingcallDuration={this.props.showonGoingcallDuration}
                                activeChatId={activeChatId}
                                displayNames={displayNames}
                                groupMemberDetails={groupMemberDetails}
                                handlePopUpClassActive={this.handlePopUpClassActive}
                                handleConversationSectionDisplay={this.props.handleConversationSectionDisplay}
                            />
                    }
                    <WebChatConversation
                        connectionState={id}
                        isConnected={data}
                        activeChatId={activeChatId}
                        groupMemberDetails={groupMemberDetails}
                        showMessageinfo={this.props.showMessageinfo}
                        messageInfoShow={this.props.messageInfoShow}
                        avoidRecord={this.props.showonGoingcallDuration}
                        handleShowCallScreen={this.props.handleShowCallScreen}
                    />
                </div>
            </Fragment>
        )
    }
}

/**
 * mapping redux data into ConversationSection component properties.
 */
const mapStateToProps = state => {
    return {
        modalPopUpReducer: state.modalPopUpReducer,
        activeChatData: state.activeChatData,
        ConnectionStateData: state.ConnectionStateData,
        rosterData: state.rosterData,
        vCardData: state.vCardData,
        groupsMemberListData: state.groupsMemberListData,
        callDurationTimestamp: state.callDurationTimestampData.callDurationTimestamp,
        groupsMemberParticipantsListData: state.groupsMemberParticipantsListData

    }
}

export default connect(mapStateToProps, null)(ConversationSection);
