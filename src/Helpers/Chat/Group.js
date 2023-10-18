import Store from '../../Store';
import IndexedDb from '../IndexedDb';
import { GroupsMemberListAction, GroupsMemberParticipantsListAction } from '../../Actions/GroupsAction';
import { getUserIdFromJid } from '../Utility';
const indexedDb = new IndexedDb()

export const setGroupParticipants = (res) => {
    Store.dispatch(GroupsMemberListAction(res));
}

export const setGroupParticipantsByGroupId = (groupId, participantsList) => {
    const uniqueUserJids = {};
        const uniqueParticipantsList = participantsList.filter(item => {
            if (item.userType != "" && !uniqueUserJids[item.userJid]) {
                uniqueUserJids[item.userJid] = true;
                return true;
            }
            return false;
        });
    Store.dispatch(GroupsMemberParticipantsListAction({
        "groupId": groupId,
        "participantsList": uniqueParticipantsList,
    }));
}

/**
 * Get the group data from groups list
 * @param {*} groupId
 */
export const getGroupData = (groupId = "") => {
    const { data: groupData } = Store.getState().groupsData;
    return groupData && groupData.find((obj) => groupId.indexOf(obj.groupId) > -1);
}

/**
 * Check Given user exist in group or not
 */
export const isUserExistInGroup = (userId, groupUsers) => {
    if(!userId || (groupUsers && !Array.isArray(groupUsers))) return false;

    if(!groupUsers){
        const { groupsMemberListData: { data: { participants } = {} } = {} } = Store.getState();
        if(!participants) return false;
        groupUsers = participants;
    }
    return groupUsers.some(user => user.userId === userId);
}

/**
 * Check Given user exist in group or not
 */
 export const getUserFromGroup = (userId, groupUsers) => {
    if (!userId || (groupUsers && !Array.isArray(groupUsers))) return false;
    userId = getUserIdFromJid(userId);
    if (!groupUsers) {
      const { groupsMemberListData: { data: { participants } = {} } = {} } = Store.getState();
      if (!participants) return false;
      groupUsers = participants;
    }
    return groupUsers.find((user) => user.userId === userId);
  };

