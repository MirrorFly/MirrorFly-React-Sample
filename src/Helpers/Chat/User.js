import { isSingleChat } from './ChatHelper';
import { REACT_APP_XMPP_SOCKET_HOST } from '../../Components/processENV';
import { CHAT_TYPE_SINGLE, CHAT_TYPE_GROUP } from './Constant';
import { getFormatPhoneNumber } from '../Utility';
import Store from '../../Store';
import { addNewRosterAction } from '../../Actions/RosterActions';
import { get as _get } from "lodash";
import SDK from '../../Components/SDK';
const requestUserids = [];


export const formatUserIdToJid = (userId, chatType = CHAT_TYPE_SINGLE) => {
    if (!userId || userId.includes(`${REACT_APP_XMPP_SOCKET_HOST}`)) return userId;
    return isSingleChat(chatType) ? `${userId}@${REACT_APP_XMPP_SOCKET_HOST}` : `${userId}@mix.${REACT_APP_XMPP_SOCKET_HOST}`;
}

export const formatGroupIdToJid = (groupId) => {
    if (!groupId || groupId.includes(`mix.${REACT_APP_XMPP_SOCKET_HOST}`)) return groupId;
    return formatUserIdToJid(groupId, CHAT_TYPE_GROUP);
}

export const isSingleChatJID = (jid) => {
    if (jid.includes(`mix`)) return false;
    return true;
}

/**
 * Return the ID(userId or groupId) from given jid(userJid or groupdJid)
 * @param {*} jid 
 */
export const getIdFromJid = (jid) => {
    if (!jid) return jid;
    return jid.split('@')[0];
}

/**
 * Return the user Id from given message object based on the chat type
 * Onetoone chat userId will contain by fromUserId
 * Group chat userId will contain by publisherId
 * @param {*} msgObj 
 */
export const getSenderIdFromMsgObj = (msgObj) => {
    if (!msgObj || typeof msgObj != 'object') return "";
    const { fromUserId, publisherId } = msgObj;
    return isSingleChat(msgObj.chatType) ? fromUserId : publisherId;
}

export const getGroupNameFromRoster = (roster) => {
    if (!roster || typeof roster != "object") return roster;
    return roster.groupName || roster.groupId;
}

export const getContactNameFromRoster = (roster) => {
    if (!roster || typeof roster != "object") return roster;
    if (roster.groupId) {
        return getGroupNameFromRoster(roster);
    }
    // if (!roster.isFriend) {
    //     return getFormatPhoneNumber(roster.userId);
    // }
    return roster.nickName || getFormatPhoneNumber(roster.mobileNumber) || roster.name;
}

export const initialNameHandle = (roster = {}, name = "") => {
    if (isLocalUser(roster.fromUser)) return name;
    if (_get(roster, "isFriend", false) !== false || _get(roster, "image", "") !== "") {
        return name;
    }
    return "";
}

export const arrayRoasterinitialNameHandle = (roster = [], name = "") => {
    roster.map((ele) => {
        if (_get(ele, "isFriend", false) !== false || _get(ele, "image", "") !== "") {
            return name;
        }
        return "";
    })
}

export const getUserInfoForSearch = (roster) => {
    if (!roster || typeof roster != "object") return roster;
    const fieldsForSearch = ['nickName', 'groupName'];
    if (!roster.isFriend) {
        fieldsForSearch.push('userId');
    }
    const userInfo = [];
    fieldsForSearch.map(field => roster[field] && userInfo.push(roster[field]))
    return userInfo;
}

/**
 * Check the given user is local or not
 * @param {*} userId 
 */
export const isLocalUser = (userId = "") => {
    if (!userId) return false;
    userId = getIdFromJid(userId);
    const vCardData = Store.getState().vCardData;
    return userId === vCardData?.data?.fromUser;
};

export const getLocalUserDetails = () => {
    const vCardData = Store.getState().vCardData;
    return vCardData?.data;
}

export const getDataFromRoster = (userId) => {
    const currentState = Store.getState()
    const {
        rosterData: {
            rosterNames
        }
    } = currentState
    if (!rosterNames || !rosterNames.has(userId)) {
        if (userId) {
            getDataFromSDK(userId);
        }
        let data = { userId: userId, userJid: formatUserIdToJid(userId) };
        return data;        
    } else {
        return rosterNames.get(userId);
    }
}

export const getDataFromSDK = async(userId) => {
    let data = { userId: userId, userJid: formatUserIdToJid(userId) };
    if(!requestUserids.includes(userId)){
        requestUserids.push(userId);
        const profileDetailsResponse = await SDK.getUserProfile(formatUserIdToJid(userId));
        var index = requestUserids.indexOf(userId);
        if (index !== -1) {
            requestUserids.splice(index, 1);
        }
        if(profileDetailsResponse.statusCode === 200){
            let userProfileDetails = profileDetailsResponse.data;
            userProfileDetails.name = userProfileDetails.nickName;
            data = {
            ...data,
            ...userProfileDetails,
            };
            addVcardDataToRoster(data);
        } else {
            data = {
                ...data,
                isDeletedUser: true,
                email: "",
                image: "",
                isAdminBlocked: false,
                isFriend: false,
                mobileNumber: "",
                name: "Deleted User",
                nickName: "Deleted User",
                displayName: "Deleted User",
                status: ""
            }
            addVcardDataToRoster(data);
        }
        return data;
    }
    return data;
}

export const isUserExistInRoster = (userId) => {
    const currentState = Store.getState()
    const { rosterData: { rosterNames } } = currentState
    return !!(rosterNames && rosterNames.has(userId));
}

export const formatDisplayName = (messageFrom = "") => {
    const userPhoneNumber = messageFrom.split('@')[0]
    const rosterObject = getDataFromRoster(messageFrom)
    if (!rosterObject) {
        return {
            nameToDisplay: getFormatPhoneNumber(userPhoneNumber),
            userColor: 'black'
        };
    }
    const { userColor } = rosterObject || {}
    const nameToDisplay = getContactNameFromRoster(rosterObject);
    return {
        nameToDisplay,
        userColor
    }
}

export const addVcardDataToRoster = (userObj) => {
    if (!userObj || typeof userObj !== 'object') return;
    if (userObj.userId && !userObj.userJid) {
        userObj['userJid'] = formatUserIdToJid(userObj.userId);
    }
    Store.dispatch(addNewRosterAction({ ...userObj, isFriend: false }));
}

export const getUserNickName = (userObj) => {
    return userObj?.nickName || userObj?.userProfile?.nickName;
}

export const isDisplayNickName = (userObj) => {
    return !isLocalUser(userObj.userId) && !userObj.isFriend;
}

export const getFriendsFromRosters = (rosters) => {
    if (!rosters || !Array.isArray(rosters)) return rosters;
    return rosters.filter((user) => user.isFriend);
}

export const getUserDetails = (userJid = "") => {
    let rosterData = {};
    let user = userJid.includes("@") ? userJid.split('@')[0] : userJid;
    let vcardData = getLocalUserDetails() || {};
    if (user === vcardData?.fromUser) {
        rosterData.displayName = "You";
        rosterData.isFriend = true;
        rosterData.image = vcardData.image;
        rosterData.jid = user;
        rosterData.chatType = "chat";
        rosterData.initialName = vcardData.nickName;
    } else {
        let userDetails = getDataFromRoster(user);
        if (Object.keys(userDetails).length > 0) {
            rosterData = userDetails;
            rosterData.displayName = getContactNameFromRoster(userDetails);
            rosterData.image = userDetails.image;
            rosterData.chatType = "chat";
            rosterData.initialName = rosterData.displayName;
            rosterData.isAdminBlocked = userDetails.isAdminBlocked
        } else {
            rosterData.displayName = getFormatPhoneNumber(user);
            rosterData.initialName = "";
            rosterData.image = "";
            rosterData.jid = user;
            rosterData.chatType = "chat";
            rosterData.userColor = "";
            rosterData.userId = user;
            rosterData.userJid = formatUserIdToJid(user);
            rosterData.isAdminBlocked = userDetails.isAdminBlocked
        }
    }
    return rosterData;
}

export const getLocalUserId = () => {
    let vcardData = getLocalUserDetails();
    if (vcardData && Object.keys(vcardData).length) return vcardData.fromUser;
    return "";
}