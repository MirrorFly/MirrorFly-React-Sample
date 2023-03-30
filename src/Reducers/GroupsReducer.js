import { GROUPS_DATA, GROUPS_UPDATE_DATA, GROUPS_MEMBER_DATA, CURRENT_CALL_GROUP_MEMBERS, GROUPS_MEMBER_PARTICIPANTS_LIST_DATA } from "../Actions/Constants";
import { GROUP_PROFILE_INFO_UPDATED } from '../Helpers/Chat/Constant';
const initialState = {
  groupParticipants: {}
};


const updateGroupDetails = (currentData, groupData = []) => {
  let index = groupData.findIndex((obj) => currentData.groupJid.indexOf(obj.groupId) > -1);
  if (index > -1) {
    groupData[index].groupName = currentData.groupName || currentData.groupProfile?.nickName || groupData[index].groupName;
    groupData[index].isAdminBlocked = currentData.isAdminBlocked;
    if (currentData.msgType === GROUP_PROFILE_INFO_UPDATED) {
      // Should not update the image from 'groupData[index].groupImage', because If user removed
      // the image of group, then the existing image will set from 'groupData'.
      // So when msgType is 'profileUpdated', use below condition to set updated/removed image
      groupData[index].groupImage = currentData.groupImage || currentData.groupProfile?.image || '';
      groupData[index].thumbImage = currentData.thumbImage || currentData.groupProfile?.thumbImage || "";
    }
  }
  return groupData;
};

export function GroupsReducer(state = [], action = {}) {
  const { id, data } = action.payload || {};
  switch (action.type) {
    case GROUPS_DATA:
      return action.payload;
    case GROUPS_UPDATE_DATA:
      return {
        ...state,
        id: id,
        data: updateGroupDetails(data, state.data)
      };
    default:
      return state;
  }
}

export function GroupsMemberListReducer(state = [], action = {}) {
  if (action.type === GROUPS_MEMBER_DATA) {
    return action.payload;
  }
  return state;
}

export function currentCallGroupMembersReducer(state = {}, action = {}) {
  if (action.type === CURRENT_CALL_GROUP_MEMBERS) {
    return action.payload;
  }
  return state;
}

export function GroupsMemberParticipantsListReducer(state = initialState, action = {}) {
  if (action.type === GROUPS_MEMBER_PARTICIPANTS_LIST_DATA) {
    let data = action.payload.data;
    let groupId = data.groupId;
    let participantsList = data.participantsList;
    let currentParticipantsList = initialState.groupParticipants;
    currentParticipantsList[groupId] = participantsList;
    return {
      ...state,
      groupParticipants: currentParticipantsList
    };
  } else {
    return state;
  }
}
