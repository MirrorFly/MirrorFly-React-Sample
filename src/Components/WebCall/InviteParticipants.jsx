import React from 'react';
import { connect } from 'react-redux';
import { showModal } from '../../Actions/PopUp';
import { handleSplitUserId } from '../../Helpers/Chat/RecentChat';
import SDK from '../SDK';
import callLogs from './CallLogs/callLog';
import toastr from 'toastr';
import { handleParticipantList } from '../../Helpers/Chat/ChatHelper';
import { startCallingTimer } from '../../Helpers/Call/Call';
import { toast } from 'react-toastify';
import Store from '../../Store';
import { showConfrence } from '../../Actions/CallAction';
import { getRemoteStream } from '../callbacks';
import {getFromLocalStorageAndDecrypt} from '../WebChat/WebChatEncryptDecrypt';

class InviteParticipants extends React.Component {
    constructor(props){
        super(props);
        this.callConnectionData = {};
        this.currentCallUsers = [];
        this.groupId = '';
    }

    componentDidUpdate(prevProps){
        this.openInvitePopup(prevProps);
    }

    getGroupMembers = (participants) => {
        const { rosterData: { data: totalContactList = [] } = {} } = this.props
        return participants && (handleParticipantList(participants, totalContactList) || [])
    }

    openInvitePopup = async(prevProps) => {
        const prevPropsInvite = prevProps.invite;
        const currPropsInvite = this.props.invite;
        const { groupsMemberParticipantsListData } = this.props || {}
        if((!currPropsInvite) || ((currPropsInvite === prevPropsInvite)
        && (prevProps.rosterData && prevProps.rosterData.id === this.props.rosterData.id)
        && groupsMemberParticipantsListData === prevProps.groupsMemberParticipantsListData)){
            return;
        }
        this.callConnectionData = JSON.parse(getFromLocalStorageAndDecrypt('call_connection_status'));
        this.currentCallUsers = [];
        this.currentCallUsersArray = [];
        this.groupId = '';
        let groupName = null;
        let groupDetails = null;
        const callMode = this.callConnectionData.callMode;
        let groupMemberDetails = [];
        let emptyMembersMsg = '';

        const {
            rosterData: { data: totalContactList = [] } = {},   
        } = this.props;

        this.currentCallUsers = this.props.remoteStream.filter((user) => {
            let id = handleSplitUserId(user.fromJid);
            if(this.props?.vCardData?.data?.fromUser !== id){
                return id;
            }
        });
        this.currentCallUsersArray = this.props.remoteStream.map((user) => handleSplitUserId(user.fromJid));        

        if(callMode === 'onetomany' && this.callConnectionData.groupId && this.callConnectionData.groupId !== null && this.callConnectionData.groupId !== ""){
            emptyMembersMsg = 'All members of the group are already in the call.'
            this.groupId = this.callConnectionData.groupId || this.callConnectionData.to;
            const { groupsMemberParticipantsListData: { groupParticipants = {} } = {} } = this.props || {}
            const participants = groupParticipants[this.groupId];
            if(participants && participants.length > 0){
                groupMemberDetails = this.getGroupMembers(participants);
            }
            groupDetails = this.getGroupDetails(this.groupId.includes("@") ? this.groupId.split('@')[0] : this.groupId);
            groupName = groupDetails.displayName;            
        }
        else{
            groupMemberDetails = totalContactList;
            emptyMembersMsg = 'All the users of your contacts already in call.'
        }

        let groupMembers = [];
        let requiredGroupMemberDetails = [];
        if(groupMemberDetails !== null){
            groupMemberDetails.map( member => {
                let rosterData = {};
                let user = member.userJid || member.GroupUser || member.username;
                const userId = user.includes("@") ? user.split('@')[0] : user;
                if(userId !== this.props?.vCardData?.data?.fromUser  && this.currentCallUsersArray.indexOf(userId) === -1 && (member.isFriend || this.groupId)){
                    rosterData = {
                        userJid: user
                    }
                    groupMembers.push(user);
                    requiredGroupMemberDetails.push(rosterData);
                }  
            });
        }

        const disableParticipantPopup = false;
        if(groupMembers.length === 0 && disableParticipantPopup){
            toastr.info(emptyMembersMsg)
            return;
        }

        this.props.invitePopup({
            open:true,
            modelType:'inviteParticipants',
            groupName: groupName,
            groupMembers: groupMembers,
            groupuniqueId: this.groupId,
            groupMemberDetails: requiredGroupMemberDetails,
            makeGroupCall: this.invite,
            callType:this.callConnectionData.callType,
            currentCallUsersLength: this.currentCallUsers.length,
            closePopup: this.props.closePopup
        });
    }

    getGroupDetails(groupId){
        let rosterData = {};
        let groupList = this.props.groupsData?.data;
        groupList.map((group) => {
            let groupJid = group.groupId;
            if(groupJid === groupId){
                rosterData.displayName = group.groupName;
                rosterData.image = group.groupImage;
                rosterData.jid = groupJid;
                rosterData.chatType = "groupchat";
                return rosterData;
            }
            return false;     
        })
        return rosterData;
    }

    invite = async (callType, inviteCallMemberDetails) => {
        let connectionStatus = getFromLocalStorageAndDecrypt("connection_status")
        if(connectionStatus === "CONNECTED"){
            const users = inviteCallMemberDetails;
            if(users.length > 0){
                let call = await SDK.inviteUsers(users)
                if(call.statusCode === 200) {
                    const showConfrenceData = Store.getState().showConfrenceData;
                    const { data } = showConfrenceData;
                    Store.dispatch(showConfrence({
                        ...(data || {}),
                        status: "REMOTESTREAM",
                        remoteStream: getRemoteStream()
                    }));
                    startCallingTimer();
                    callLogs.update(this.callConnectionData.roomId, {
                        "userList": users.join(',')
                    });
                } else {
                    toast.error(call.message);
                }
            }
        }
    }

    render(){
        return null;
    }

}
const mapStateToProps = state => {
    return {
        rosterData: state.rosterData,
        vCardData: state.vCardData,
        groupsData: state.groupsData,
        groupsMemberParticipantsListData: state.groupsMemberParticipantsListData        
    }
}

const mapDispatchToProps = {
    invitePopup: showModal
}

export default connect(mapStateToProps, mapDispatchToProps)(InviteParticipants);
