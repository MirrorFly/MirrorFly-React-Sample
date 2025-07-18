import React from 'react';
import { DateTime } from 'luxon';
import * as moment from 'moment';
import { get as _get, groupBy as _groupBy } from "lodash";
import { REACT_APP_XMPP_SOCKET_HOST } from '../../Components/processENV';
import { blockOfflineAction, capitalizeFirstLetter, capitalizeTxt, fileToBlob, getArchiveSetting, getDbInstanceName, getFormatPhoneNumber, getLocalWebsettings, getMessageType, getUserIdFromJid, sendNotification, setLocalWebsettings } from '../Utility';
import Store from '../../Store';
import {
    CHAT_TYPE_SINGLE, MSG_SENT_ACKNOWLEDGE_STATUS_ID, MSG_SENT_ACKNOWLEDGE_STATUS, MSG_DELIVERED_STATUS_ID,
    MSG_DELIVERED_STATUS, MSG_DELIVERED_STATUS_CARBON, MSG_SEEN_STATUS_ID, MSG_SEEN_STATUS,
    MSG_SEEN_STATUS_CARBON, MSG_PROCESSING_STATUS_ID, MSG_PROCESSING_STATUS, CHAT_TYPE_GROUP, GROUP_CHAT_PROFILE_UPDATED_NOTIFY, CHAT_TYPE_BROADCAST, BRAND_NAME,REPORT_FROM_CONTACT_INFO
} from './Constant';
import { formatGroupIdToJid, formatUserIdToJid, getContactNameFromRoster, getSenderIdFromMsgObj, isLocalUser, getDataFromRoster, getUserDetails } from './User';
import { changeTimeFormat, msgStatusOrder } from './RecentChat';
import { IconUploading } from "../../assets/images";
import { resetRecentChat, ActiveChatResetAction, updateArchiveStatusRecentChat } from '../../Actions/RecentChatActions';
import { ResetUnreadCount } from '../../Actions/UnreadCount';
import { MEDIA_MESSAGE_TYPES } from '../Constants';
import { DELETE_MESSAGE_FOR_EVERYONE, DELETE_MESSAGE_FOR_ME } from '../../Actions/Constants';
import IndexedDb from "../../Helpers/IndexedDb";
import { CancelMediaUpload, UpdateMediaUploadStatus } from '../../Actions/ChatHistory';
import { ReplyMessageAction } from '../../Actions/MessageActions';
import SDK from "../../Components/SDK"
import { getExtension } from '../../Components/WebChat/Common/FileUploadValidation';
import { getFromLocalStorageAndDecrypt, encryptAndStoreInLocalStorage, getFromSessionStorageAndDecrypt, encryptAndStoreInSessionStorage} from '../../Components/WebChat/WebChatEncryptDecrypt';
import { getGroupData } from './Group';
import { getAvatarImage, groupAvatar } from '../../Components/WebChat/Common/Avatarbase64';
import { webSettingLocalAction } from '../../Actions/BrowserAction';
import Config from "../../config";
import { DownloadingChatMedia, MediaDownloadDataAction, MediaUploadDataAction } from '../../Actions/Media';
 
const indexedDb = new IndexedDb();

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const {reportMembers} = Config

let uploadingFile = [];
export const notificationMessageType = ["1", "2", "3", "4", "5"];
export function formatBytes(a, b = 2) { 
    if (0 === a) 
    {return "0 Bytes"}
    const c = 0 > b ? 0 : b, d = Math.floor(Math.log(a) / Math.log(1024));
    return parseFloat((a / Math.pow(1024, d)).toFixed(c)) + " " + ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
}
export function convertTime(sec) {
    let hours = Math.floor(sec / 3600);
    if (hours >= 1) sec = sec - (hours * 3600) 
    else hours = 0;
    let min = Math.floor(sec / 60);
    if (min >= 1) sec = sec - (min * 60)
    else min = '00';
    if (sec < 1) sec = '00' 
    else void 0;

    if (min.toString().length === 1) min = '0' + min
    else void 0;
    if (sec.toString().length === 1) sec = '0' + sec 
    else void 0;
    return hours ? hours + ':' + min + ':' + sec : min + ':' + sec
}
export const getJidFromRencentChat = (chatConversation) => {
    const { roster, recent } = chatConversation
    const { jid, username, msgfrom } = roster || recent || {}
    const updateJid = jid || username || msgfrom;
    return updateJid + "@" + REACT_APP_XMPP_SOCKET_HOST;
}

export const displayNameFromRencentChat = (roster = {}) => {
    const { displayName, name, nickName, jid, groupName } = roster || {};
    return displayName || groupName || name || nickName || jid;
}

export const displayNameFromRoster = (roster, msgFrom) => {
    return getContactNameFromRoster(roster)
}

export const getNameFromGroup = (group) => {
    const { displayName } = group || {}
    return displayName || getContactNameFromRoster(group);
}

export const getDisplayNameFromGroup = (messageFrom = '', groupMemberDetails = []) => {

    const userId = messageFrom?.split('@')[0]
    const rosterObject = getDataFromRoster(userId);
    if (!rosterObject) {
        const userDetails = getUserDetails(userId);
        if (userDetails && userDetails.nickName) {
            return {
                nameToDisplay: userDetails.nickName,
                userColor: 'black'
            };
        }
        return {
            nameToDisplay: getFormatPhoneNumber(userId),
            userColor: 'black'
        };
    }
    const { displayName, name, nickName, jid, userColor } = rosterObject || {}
    let nameToDisplay = displayName || name || nickName || jid || getFormatPhoneNumber(messageFrom?.split('@')[0]);
    
    return {
        nameToDisplay,
        userColor
    }
}

export const formatPhoneNumber = (jid) => {
    return getFormatPhoneNumber(jid)
}

export const getNamefromRoster = (rosterObject) => {
    const { displayName, name, nickName, jid } = rosterObject || {}
    return displayName || name || nickName || getFormatPhoneNumber(jid);
}

export const getNameAndStatus = (jid = '', roster = []) => {
    const userJid = jid.split('@')[0]
    return roster.find(profile => {
        const rosterJid = (profile.username) ? profile.username : profile.userId;
        return rosterJid === userJid
    })
}

export const getBroadCastUser = (participants = [], totalContactList = []) => {
    const rosterContacts = totalContactList.filter(singleContact => {
        const rosterJid = singleContact.jid || singleContact.username;
        return participants.indexOf(rosterJid) !== -1
    })

    return participants.map(groupMember => ({
        ...rosterContacts.find((singleContact) => {
            const rosterJid = singleContact.jid || singleContact.username;
            if (rosterJid === groupMember) {
                return singleContact
            }
        }),
        jid: groupMember
    }));

}

export const handleParticipantList = (participants = [], totalContactList = []) => {
    return participants.map(groupMember => ({
        ...(getDataFromRoster(groupMember.userId) || {}),
        ...groupMember
    }));

}

export const classNames = (classes) => {
    return Object.entries(classes)
        .filter(([key, value]) => value)
        .map(([key, value]) => key)
        .join(' ');
}

export const groupBy = (messageToGroup, callback) => {
    return messageToGroup.reduce((groups, message) => {
        const date = callback(message)
        groups[date] = [...groups[date] || [], message];
        return groups;
    }, {});
}

export const groupByTime = (message, callback) => {
    const { res } = message
        .reduce((messageGroup, singleImage, currentIndex, messageArray) => {
            const time = callback(singleImage)
            if (!messageGroup.currentTime || (messageGroup.currentTime - time > 60000 || (singleImage.msgtype !== messageGroup.messageType || singleImage.fromUser !== messageGroup.fromUser))) {
                let newArray = [];
                messageGroup.res = [
                ...messageGroup.res,
                newArray
                ];
                messageGroup.currentArray = newArray;

                messageGroup.fromUser = singleImage.fromUser
                messageGroup.messageType = singleImage.msgtype
                messageGroup.currentTime = time
            }
            const previousObject = messageArray[currentIndex - 1]
            messageGroup.previousMessageUser = previousObject && previousObject.msgType !== GROUP_CHAT_PROFILE_UPDATED_NOTIFY ? getSenderIdFromMsgObj(previousObject) : null
            messageGroup.currentArray.push({
                ...singleImage,
                previousMessageUser: messageGroup.previousMessageUser,
                ...(singleImage?.chatType === "groupchat" && !singleImage.publisherId && { publisherId: singleImage.fromUserId })
            })
            return messageGroup
        }, { res: [] })
    return res;
}

export const getCurrentTime = () => {
    return moment.utc(new Date()).format('YYYY-MM-DD HH:mm:ss');
}


const getlabel = (current_datetime) => {
    const today = moment();
    const dateObject = new Date(current_datetime.replace(/ /g, "T"))
    const diffenceDay = today.diff(current_datetime, 'days')
    if (diffenceDay === 0) {
        return 'Today'
    } else if (diffenceDay === 1) {
        return 'Yesterday'
    } else if (diffenceDay > 1 && diffenceDay <= 6) {
        return DateTime.fromJSDate(dateObject).toFormat('cccc')
    } else if (dateObject.getFullYear() === new Date().getFullYear()) {
        return `${dateObject.getDate()} ${months[dateObject.getMonth()]}`
    }
    return `${dateObject.getDate()} ${months[dateObject.getMonth()]} ${dateObject.getFullYear()}`
}

export const convertDateFormat = (dateString) => {
    return getlabel(dateString);
}

export const deliveryStatus = {
    [MSG_SENT_ACKNOWLEDGE_STATUS_ID]: "offline",
    [MSG_DELIVERED_STATUS_ID]: "notsent",
    [MSG_SEEN_STATUS_ID]: "sent",
    [MSG_PROCESSING_STATUS_ID]: "processing"
};

export const isValidDeleteEveryOne = (msgdate) => {
    const date = new Date(msgdate.replace(/ /g, "T"));
    const newDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    const now = new Date();
    const validTime = 30 * 1000;
    return ((now - newDate) <= validTime);
  };
  
export const getUniqueListBy = (arr, key) => {
    return [...new Map(arr.map(item => [item[key], item])).values()]
}

export const concatMedia = (activeData, stateData) => {
    const updateMedia = [
        ...[...activeData].reverse(),
        ...stateData
    ]
    return getUniqueListBy(updateMedia, 'msgId')
}

export const concatMessageArray = (activeData, stateData, uniqueId, sortId) => {
    const updateMessage = [
        ...stateData,
        ...activeData,
    ]
    return getUniqueListBy(updateMessage, uniqueId).sort((a, b) => 
    {
         if (a[sortId] > b[sortId]) { return 1 } 
         else if (a[sortId] < b[sortId]) { return -1 }
         else { return 0 }
    });
}

export const isSingleChat = (chatType) => chatType === CHAT_TYPE_SINGLE;
export const isGroupChat = (chatType) => chatType === CHAT_TYPE_GROUP;
export const isBroadcastChat = (chatType) => chatType === CHAT_TYPE_BROADCAST;
export const isSingleOrBroadcastChat = (chatType) => chatType === CHAT_TYPE_SINGLE || chatType === CHAT_TYPE_BROADCAST;
export const isSingleOrGroupChat = (chatType) => chatType === CHAT_TYPE_SINGLE || chatType === CHAT_TYPE_GROUP;

export const convertMsgStatusToStatusId = (statusStr) => {
    const msgStatusMap = {
        [MSG_DELIVERED_STATUS_CARBON]: MSG_DELIVERED_STATUS_ID,
        [MSG_DELIVERED_STATUS]: MSG_DELIVERED_STATUS_ID,
        [MSG_SEEN_STATUS]: MSG_SEEN_STATUS_ID,
        [MSG_SEEN_STATUS_CARBON]: MSG_SEEN_STATUS_ID,
        [MSG_SENT_ACKNOWLEDGE_STATUS]: MSG_SENT_ACKNOWLEDGE_STATUS_ID,
        [MSG_PROCESSING_STATUS]: MSG_PROCESSING_STATUS_ID
    };
    return msgStatusMap[statusStr];
}

/**
 * Could check here active conversation screen chat type by giving the chat type as argument
 * @param {Boolean} chatType 
 */
export const activeConversationChatType = (chatType) => {
    const { activeChatData: { data: { recent } = {} } = {} } = Store.getState();
    if (!chatType || !recent) return false;
    return recent.chatType === chatType;
}

/**
 * Get the active conversation user ID
 */
export const getActiveConversationChatId = () => {
    const { activeChatData: { data: { chatId } = {} } = {} } = Store.getState();
    return chatId;
}

/**
 * Get the active conversation user ID
 */
export const getActiveConversationChatJid = () => {
    const { activeChatData: { data: { chatJid } = {} } = {} } = Store.getState();
    return chatJid;
}

/**
 * Get the active conversation user Jid
 */
export const getActiveConversationUserJid = () => {
    const { activeChatData: { data: { chatId, chatType } = {} } = {} } = Store.getState();
    return formatUserIdToJid(chatId, chatType);
}

/**
 * Get the active conversation group ID
 */
export const getActiveConversationGroupId = () => {
    const { activeChatData: { data: { roster, recent } = {} } = {} } = Store.getState();
    let data = roster && Object.keys(roster).length > 0 ? roster : recent;
    return (data && data.groupId) || (recent && recent.fromUserId);
}

/**
 * Get the active conversation group Jid
 */
export const getActiveConversationGroupJid = () => {
    const groupId = getActiveConversationGroupId();
    return formatGroupIdToJid(groupId);
}

/**
 * Check the give USER or GROUP ID is in the active conversation screen
 * @param {string} userOrGroupId 
 * @param {string} chatType 
 */
export const isActiveConversationUserOrGroup = (userOrGroupId, chatType = CHAT_TYPE_SINGLE) => {
    if (!userOrGroupId) return false;
    const conversationUserOrGroupId = isSingleChat(chatType) ? getActiveConversationChatId() : getActiveConversationGroupId();
    userOrGroupId = getUserIdFromJid(userOrGroupId);
    return conversationUserOrGroupId === userOrGroupId;
}

/**
 * Return the user or group id based on active conversation
 */
export const getActiveConversationUserOrGroupId = () => {
    const isSingleChatActive = activeConversationChatType(CHAT_TYPE_SINGLE);
    if (isSingleChatActive) {
        return getActiveConversationChatId();
    }
    const isGroupChatActive = activeConversationChatType(CHAT_TYPE_GROUP);
    if (isGroupChatActive) {
        return getActiveConversationGroupId();
    }
    return undefined;
}

/**
 * Return the user or group JID based on active conversation
 */
export const getActiveConversationUserOrGroupJid = () => {
    const isSingleChatActive = activeConversationChatType(CHAT_TYPE_SINGLE);
    if (isSingleChatActive) {
        return getActiveConversationUserJid();
    }
    const isGroupChatActive = activeConversationChatType(CHAT_TYPE_GROUP);
    if (isGroupChatActive) {
        return getActiveConversationGroupJid();
    }
    return undefined;
}

/**
 * Return message details from active conversation array for given message Id
 */
export const getActiveConversationMessageByMsgId = (msgId, chatType) => {
    let message = undefined;
    let chatHistory = [];
    if (isSingleChat(chatType) || activeConversationChatType(CHAT_TYPE_SINGLE)) {
        chatHistory = Store.getState().singleChatMsgHistoryData?.data;
    }

    if (isGroupChat(chatType) || activeConversationChatType(CHAT_TYPE_GROUP)) {
        chatHistory = Store.getState().groupChatMessage?.data;
    }
    chatHistory = (chatHistory && Array.isArray(chatHistory) && chatHistory) || [];
    // Loop through from the recent messages that's why we loop through in backward
    // couldn't use reverse method, it's affected across the app
    for (let i = (chatHistory.length - 1); i >= 0; i--) {
        if (chatHistory[i] && chatHistory[i].msgId === msgId) {
            message = chatHistory[i];
            break;
        }
    }
    return message;
}

/**
 * Check the message status in order by comparing the current & new status order index, then return the proper status
 * suppose If receive sent acknowledge after delivered status, then we sent delivered status.
 * 
 * @param {*} currentStatus 
 * @param {*} newStatus 
 */
export const getMsgStatusInOrder = (currentStatus, newStatus) => {
    const currentStatusIndex = msgStatusOrder.indexOf(currentStatus);
    const newStatusIndex = msgStatusOrder.indexOf(newStatus);
    if (newStatusIndex > currentStatusIndex) {
        return newStatus;
    }
    return currentStatus;
}

/**
 * Chat conversation message status element
 * @param {*} status 
 * @param {*} publisherId 
 */
export const getMsgStatusEle = (status, publisherId) => {
    if (isLocalUser(publisherId)) {
        const updatedStatus = deliveryStatus[status];
        return (
            <span className={`status ${updatedStatus}`}>
                {status === MSG_PROCESSING_STATUS_ID && (
                    <i className="uploading">
                        <IconUploading />
                    </i>
                )}
            </span>
        );
    }
    return null;
}

/**
 * Reseting Store Data
 */
export const resetStoreData = () => {
    Store.dispatch(ActiveChatResetAction());
    Store.dispatch(ResetUnreadCount());
    Store.dispatch(resetRecentChat());
}

export const updateSessionIdInLocalStorage = () => {
    let currentTabId = getFromSessionStorageAndDecrypt("sessionId");
    currentTabId != null && encryptAndStoreInLocalStorage("sessionId", currentTabId);
}

export const isCurrentSessionActive = () =>
    getFromSessionStorageAndDecrypt("sessionId") === null ||
    getFromLocalStorageAndDecrypt("sessionId") == null ||
    getFromLocalStorageAndDecrypt("sessionId") === getFromSessionStorageAndDecrypt("sessionId")

export const updateSessionId = (tabId) => {
    if (getFromSessionStorageAndDecrypt("sessionId") === null) {
        encryptAndStoreInSessionStorage("sessionId", tabId);
        encryptAndStoreInLocalStorage("sessionId", tabId);
    }
}

export const isTextMessage = (msgType) => {
    if (!msgType) return false;
    return ["text", "auto_text"].indexOf(msgType) > -1;
}

export const isMeetMessage = (msgType) => {
    if (!msgType) return false;
    return ["meet"].indexOf(msgType) > -1;
}

/**
 * Return the reply message format object from given message
 * @param {*} message 
 */
export const getReplyMessageFormat = (message) => {
    if (!message) return {};
    return {
        chatType: message.chatType,
        deletedBy: message.deleteStatus,
        deletedStatus: message.deleteStatus,
        fromUserId: isSingleChat(message.chatType) ? message.fromUserId : message.publisherId,
        groupId: isGroupChat(message.chatType) ? message.fromUserId : undefined,
        oldMsgId: "",
        replyMsgContent: message.msgBody,
        replyMsgId: message.msgId
    }
}

export const isSameSession = () => {
    return getFromLocalStorageAndDecrypt("sessionId") === getFromSessionStorageAndDecrypt("sessionId")
}

export const updateFavicon = (type) => {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = type === "error" ? '../../favicon-error.png' : '../../favicon.png';
}

export const isMediaMessage = (msgBody = {}) => MEDIA_MESSAGE_TYPES.includes(msgBody.message_type);

export const arrayToObject = (arr, key) => {
    return arr.reduce((obj, item) => {
        obj[item[key]] = item;
        return obj;
    }, {});
};

export const setTempMute = (name, stateData) => {
  const tempMuteUser = getFromLocalStorageAndDecrypt("tempMuteUser");
  const parserLocalStorage = tempMuteUser ? JSON.parse(tempMuteUser) : {};
  const constructObject = {
    ...parserLocalStorage,
    [name]: { fromUserId: name, isMuted: stateData }
  };
  encryptAndStoreInLocalStorage("tempMuteUser", JSON.stringify(constructObject));
};

export const removeTempMute = (name) => {
  const tempMuteUser = getFromLocalStorageAndDecrypt("tempMuteUser");
  if (tempMuteUser) {
    let parserLocalStorage = JSON.parse(tempMuteUser);
    delete parserLocalStorage[name];
    encryptAndStoreInLocalStorage("tempMuteUser", JSON.stringify(parserLocalStorage));
  }
};


export const getChatHistoryData = (data, stateData) => {
    // To Avoid Unnecessary Looping, We are Using Key Value Pair for Chat and Messages
    // Eg: userId: {} or groupId: {} or msgId: {}
    const chatId = getUserIdFromJid(data.userJid || data.groupJid);
    const state = Object.keys(stateData).length > 0 && (data.data.historyEnabledUser != 1 && data.data.reconnectFetch != 1 ) ? stateData[chatId]?.messages || {} : {};
    const sortedData = concatMessageArray(data.data, Object.values(state), "msgId", "timestamp");
    const lastMessage = sortedData[sortedData.length - 1];
    let newSortedData;
    const localUserJid = getFromLocalStorageAndDecrypt('loggedInUserJidWithResource');
    const userId = localUserJid ? getUserIdFromJid(localUserJid) : "";
    if (userId === lastMessage?.publisherId) {
        newSortedData = sortedData.map((msg => {
            const currentMessage = data?.data[data?.data.length - 1];
            if (currentMessage?.editedStatus === 1 && currentMessage?.msgId === msg?.msgId) {
                msg.msgStatus = getMsgStatusInOrder(msg.msgStatus, currentMessage?.msgStatus);
            } else {
                msg.msgStatus = getMsgStatusInOrder(msg.msgStatus, lastMessage?.msgStatus);
            }
            return msg;
        }));
    } else {
        newSortedData = sortedData;
    }

    let isScrollNeeded = true;
    if (data.fetchLimit) {
        isScrollNeeded = data.data.length === data.fetchLimit; // To Check If this is the Last Message in the Chat, So no Scroll Fetch is Needed
    }
    const finalData = { isScrollNeeded, messages: arrayToObject(newSortedData, "msgId") };

    return {
        ...stateData,
        [chatId]: finalData
    };
};

export const clearChatHistoryOffline = (data, stateData) => {
    let chatData = stateData; 
    const chatIds = Object.keys(chatData);
    const userId = data.fromUserId;
    const lastMessageId = data.lastMsgId;

    if (chatIds.includes(userId)) {
        let userOrGroupId = "";
        for (const chatId in chatData) {
            if(chatId === userId){
                userOrGroupId = chatId;
            }
        }
        const chatMessages = chatData[userOrGroupId]?.messages;
        if (chatMessages[lastMessageId] !== undefined || "") {
            const timestamp = chatMessages[lastMessageId].timestamp;
            for (let msg in chatMessages) {
                if (data.favourite === "1") {
                    if (chatMessages[msg].timestamp <= timestamp) {
                        if (chatMessages[msg].favouriteStatus === 0 ) {
                            delete chatMessages[msg]
                        }
                    }
                } else {
                    if (chatMessages[msg].timestamp <= timestamp) {
                        delete chatMessages[msg]
                    }
                }
                
            }
            return chatMessages;  
        }
    }
}

export const getChatHistoryMessagesData = () => {
    const { chatConversationHistory: { data } = {} } = Store.getState();
    return data;
};

export const getRecentChatMessagesData = () => {
    const { recentChatData: { data } = {} } = Store.getState();
    return data;
};

export const getChatMessageHistoryById = (id) => {
    const { chatConversationHistory: { data } = {} } = Store.getState();
    if (data[id]?.messages) return Object.values(data[id]?.messages);
    return [];
};

export const getUpdatedHistoryData = (data, stateData) => {
    // Here Get the Current Active Chat History and Active Message
    const currentChatData = stateData[data.fromUserId];
    const msgIds = currentChatData?.messages ? Object.keys(currentChatData?.messages) : {};
    
    if (msgIds.length > 0) {
        const currentMessage = currentChatData.messages[data.msgId];
        if (currentMessage) {
            const msgStatus = getMsgStatusInOrder(currentMessage.msgStatus, data.msgStatus);
            currentMessage.msgStatus = msgStatus;
            currentMessage.msgType = data.msgType;
            if (currentMessage?.msgBody?.media && data.msgType === "acknowledge") {
                currentMessage.msgBody.media.is_uploading = 2
            }
            
            // Updating Old Msg Statuses to Current Status
            const currentMessageIndex = msgIds.indexOf(data.msgId);
            for (let i = 0; i < msgIds.length && i <= currentMessageIndex; i++) {
                const  message = currentChatData?.messages[msgIds[i]];
                currentChatData.messages[msgIds[i]] = {
                    ...message, 
                    ...(message.msgStatus !== 3 && message.msgStatus !== 0 && {
                        msgStatus : getMsgStatusInOrder(message.msgStatus, msgStatus)
                    })
                };
            }

            return {
                ...stateData,
                [data.fromUserId]: {
                    ...currentChatData,
                    [data.msgId]: currentMessage
                }
            };
        }
    }
    return {
        ...stateData
    };
};

export const getUpdatedHistoryDataUpload = (data, stateData) => {
   // Here Get the Current Active Chat History and Active Message
    const currentChatData = stateData[data.fromUserId];
    if (currentChatData?.messages && Object.keys(currentChatData?.messages).length > 0) {
        const currentMessage = currentChatData.messages[data.msgId];

        if (currentMessage) {
            currentMessage.msgBody.media.is_uploading = data.uploadStatus;
            if (data.statusCode === 200) {
                currentMessage.msgBody.media.file_url = data.fileToken || "";
                currentMessage.msgBody.media.thumb_image = data.thumbImage || "";
                currentMessage.msgBody.media.file_key = data.fileKey || "";
            }
            return {
                ...stateData,
                [data.fromUserId]: {
                    ...currentChatData,
                    [data.msgId]: currentMessage
                }
            };
        }
    }
    return {
        ...stateData
    };
};

export const updateDeletedMessageInHistory = (actionType, data, stateData) => {
    // Here Get the Current Active Chat History and Active Message
    const currentChatData = stateData[data.fromUserId];

    if (currentChatData) {
        if (actionType === DELETE_MESSAGE_FOR_ME) {
            data.msgIds.forEach((msgId) => delete currentChatData.messages[msgId]);
        } else if (actionType === DELETE_MESSAGE_FOR_EVERYONE) {
            const messageIds = data.msgId.split(",");
            for (const msgId of messageIds) {
                if (currentChatData.messages[msgId]) {
                  currentChatData.messages[msgId].deleteStatus = 2;
                }
              }              
        }

        return {
            ...stateData,
            [data.fromUserId]: {
                ...currentChatData
            }
        };
    }
    return {
        ...stateData
    };
};

export const getActiveChatMessages = () => {
    const chatId = getActiveConversationChatId();
    const { chatConversationHistory: { data } = {} } = Store.getState();
    if (data[chatId]?.messages) return Object.values(data[chatId]?.messages);
    return [];
};

export const getLastMsgFromHistoryById = (chatId) => {
    const chatMessages = getChatMessageHistoryById(chatId);
    return chatMessages.length > 0 ? chatMessages[chatMessages.length - 1] : "";
};

export const getMessageFromHistoryById = (chatId, msgId) => {
    const { chatConversationHistory: { data } = {} } = Store.getState();
    if (data[chatId]?.messages && Object.keys(data[chatId]?.messages).length > 0) {
        return data[chatId]?.messages[msgId] || {};
    }
    return {};
};

export const getActiveChatUserRoster = () => {
    const { activeChatData: { data: { roster } = {} } = {} } = Store.getState();
    return roster;
};

export const updateMediaUploadStatus = (data, stateData) => {
    return stateData.map((el) => {
        if (el.msgId === data.msgId) {
            return {
                ...el,
                uploadStatus: 1
            };
        }
        return el;
    });
};

export const uploadFileSuccess = (msgId, jid, response) => {
    let updateObj = {
        msgId,
        statusCode: 200,
        fromUserId: getUserIdFromJid(jid)
    };
    updateObj.fileToken = response.msgBody.media.fileToken
    updateObj.thumbImage = response.msgBody.media.thumbImage;
    updateObj.fileKey = response.msgBody.media.file_key;
    Store.dispatch(UpdateMediaUploadStatus(updateObj));
}

export const uploadFileFailure = (msgId, jid) => {
    const cancelObj = {
        msgId,
        fromUserId: getUserIdFromJid(jid),
        uploadStatus: 3,
        mediaUploading: true,
        mediaUploadCanceled: true
    };
    Store.dispatch(CancelMediaUpload(cancelObj));
}

export const uploadFileToSDK = async (file, jid, msgId) => {
    const { caption = "",  mentionedUsersIds =[],fileDetails: { replyTo, audioType = "" } = {} } = file;
    const msgType = getMessageType(file.type, file);
    let fileOptions = {
        file: file,
        msgId: msgId,
        caption: caption
    };
    if (msgType === "file") {
        await SDK.sendMediaFileMessage({
            toJid: jid,
            messageType: "file",
            fileMessageParams: fileOptions,
            mentionedUsersIds: mentionedUsersIds,
            replyMessageId: replyTo
        }, 
        (msgId) => {
            const fileUploadingData =  {msgId,uploading:true}
            Store.dispatch(MediaUploadDataAction(fileUploadingData));
        }, 
        (response) => {
            uploadFileSuccess(response.msgId, jid, response);
        }, 
        (error) => {
            uploadFileFailure(msgId, jid);
        });
    } else if (msgType === "image") {
        uploadingFile.push(fileOptions);
        await SDK.sendMediaFileMessage({
            toJid: jid,
            messageType: "image",
            fileMessageParams: fileOptions,
            mentionedUsersIds: mentionedUsersIds,
            replyMessageId: replyTo,
        }, 
        (msgId) => {
          const imageUploadingData =  {msgId,uploading:true}
          Store.dispatch(MediaUploadDataAction(imageUploadingData));
        }, 
        async(response) => {
            uploadFileSuccess(response.msgId, jid, response);
            const uploadedImage = uploadingFile.find(item => item.msgId === response.msgId);
            const imgFileBlob = await fileToBlob(uploadedImage.file);
            indexedDb.setImage(response.msgBody.media.fileToken, imgFileBlob, getDbInstanceName(msgType));
            uploadingFile = uploadingFile.filter(item => item.msgId !== response.msgId);
        }, 
        (error) => {
            uploadFileFailure(msgId, jid);
        });
    } else if (msgType === "video") {
        await SDK.sendMediaFileMessage({
            toJid: jid,
            messageType: "video",
            fileMessageParams: fileOptions,
            mentionedUsersIds: mentionedUsersIds,
            replyMessageId: replyTo,
        }, 
        (msgId) => {
            const videoUploadingData =  {msgId,uploading:true}
            Store.dispatch(MediaUploadDataAction(videoUploadingData));
        }, 
        (response) => {
            uploadFileSuccess(response.msgId, jid, response);
        }, 
        (error) => {
            uploadFileFailure(msgId, jid);
        });
    } else if (msgType === "audio") {
        uploadingFile.push(fileOptions);
        await SDK.sendMediaFileMessage({
            toJid: jid,
            messageType: audioType === "recording" ? "audio_recorded" : "audio",
            fileMessageParams: fileOptions,
            mentionedUsersIds: mentionedUsersIds,
            replyMessageId: replyTo
        }, 
        (msgId) => {
            const audioUploadingData =  {msgId,uploading:true}
            Store.dispatch(MediaUploadDataAction(audioUploadingData));
        }, 
        async(response) => {
            uploadFileSuccess(response.msgId, jid, response);
            const uploadedAudio = uploadingFile.find(item => item.msgId === response.msgId);
            const audioFileBlob = await fileToBlob(uploadedAudio.file);
            indexedDb.setImage(response.msgBody.media.fileToken, audioFileBlob, getDbInstanceName(msgType));
            uploadingFile = uploadingFile.filter(item => item.msgId !== response.msgId);
        }, 
        (error) => {
            uploadFileFailure(msgId, jid);
        });
    }
};

export const updateMediaUploadStatusHistory = (data, stateData) => {
    
    // Here Get the Current Active Chat History and Active Message
    const currentChatData = stateData[data.fromUserId];
    if (currentChatData?.messages && Object.keys(currentChatData?.messages).length > 0) {
        const currentMessage = currentChatData.messages[data.msgId];
        if (currentMessage) {
            currentMessage.msgBody.media.is_uploading = data.uploadStatus;
            return {
                ...stateData,
                [data.fromUserId]: {
                    ...currentChatData,
                    [data.msgId]: currentMessage
                }
            };
        }
    }
    return {
        ...stateData
    };
};

export const updateFavouriteStatusHistory = (data, stateData) => {
    const currentChatData = stateData[data.fromUserId];
    if (currentChatData) {

        if (data.msgId) {
            const  message = currentChatData?.messages[data.msgId];
            currentChatData.messages[data.msgId] = {...message, favouriteStatus: data.favouriteStatus }; 
        } else if (data.msgIds && data.msgIds.length) {
            for (const msgId of data.msgIds) {
                const message = currentChatData?.messages[msgId];
                currentChatData.messages[msgId] = { ...message, favouriteStatus: data.favouriteStatus };
              }              
        }
        return {
            ...stateData,
            [data.fromUserId]: {
                ...currentChatData
            }
        };
    }
    return {
        ...stateData
    };
};

export const removeFavouriteStatusHistory = (data, stateData) => {
    // Here We are Removing Starred Status in Conversation History of Each Opened Chat
    const duplicateState = JSON.parse(JSON.stringify(stateData));
    const groupByResult = _groupBy(data, "fromUserId");
    const chatIds = Object.keys(groupByResult);
    for (let chatId of chatIds) {
        const currentChat = stateData[chatId];
        if (currentChat) {
            const unStarredMessages = groupByResult[chatId];
            const msgIds = unStarredMessages.map((msg) => msg.msgId);
            for (const msgId of msgIds) {
                const currentMsg = currentChat.messages[msgId];
                if (currentMsg) duplicateState[chatId].messages[msgId] = { ...currentMsg, favouriteStatus: 0 };
            }
        }
    }      
    return {
      ...duplicateState
    };
};

export const offlineReplyHandle = (newObj = {}, replyTo = "") => {
    const dataObj = {
        oldMsgId: "",
        deletedBy: "0",
        replyMsgId: replyTo,
        chatType: _get(newObj, "chatType", ""),
        groupId: _get(newObj, "fromUserId", ""),
        replyMsgContent: _get(newObj, "msgBody", {}),
        deleteStatus: _get(newObj, "deleteStatus", ""),
        fromUserId: _get(newObj, "chatType", "") === "groupchat" ? _get(newObj, "publisherId", "") : _get(newObj, "fromUserId", ""),
    };
    Store.dispatch(ReplyMessageAction(dataObj));
};

export const getDownloadFileName = (file_url, msgType) => {
    const time = `${moment().format("YYYY-MM-DD")} at ${moment().format("hh.mm.ss A")}`;
    const extension = getExtension(file_url);
    const fileType = msgType === "audio" ? "ptt": msgType;
    return `${BRAND_NAME} ${capitalizeFirstLetter(fileType)} ${time}${extension}`;
};

export const downloadMediaFile = async (filemsgId, file_Url, msgType, file_name, fileKey, event) => {
    if (blockOfflineAction()) return;
    Store.dispatch(DownloadingChatMedia({ downloadMediaMsgId: filemsgId, downloadingFile: file_Url, downloading: true, downloadingMediaType: msgType }));
    if (file_Url) {
        const fileName = msgType === "file" ? file_name : getDownloadFileName(file_Url, msgType);
        let fileUrl = file_Url;
        // For Downloading Live File with Original Name
        if (file_Url.search("blob:") === -1) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }            
            await SDK.downloadMedia(filemsgId, (res) => {
                Store.dispatch(MediaDownloadDataAction(res));
            }, 
            (mediaResponse) => {
                Store.dispatch(DownloadingChatMedia({ downloadMediaMsgId: filemsgId, downloadingFile: file_Url, downloading: false, downloadingMediaType: msgType }));
                fileUrl = mediaResponse.blobUrl;
                const anchor = document.createElement("a");
                anchor.style.display = "none";
                anchor.href = fileUrl;
                anchor.setAttribute("download", fileName);
                document.body.appendChild(anchor);
                anchor.click();
                window.URL.revokeObjectURL(anchor.href);
                document.body.removeChild(anchor);
                Store.dispatch(DownloadingChatMedia({ downloadMediaMsgId: filemsgId, downloadingFile: file_Url, downloading: false, downloadingMediaType: msgType }));
                Store.dispatch(MediaDownloadDataAction({ msgId: filemsgId, progress: null })); 
            }, 
            (error) => {
                console.log("error in downloading media file", error);
            });            
        } else {
            const anchor = document.createElement("a");
            anchor.style.display = "none";
            anchor.href = fileUrl;
            anchor.setAttribute("download", fileName);
            document.body.appendChild(anchor);
            anchor.click();
            window.URL.revokeObjectURL(anchor.href);
            document.body.removeChild(anchor);
            Store.dispatch(DownloadingChatMedia({ downloadMediaMsgId: filemsgId, downloadingFile: file_Url, downloading: false, downloadingMediaType: msgType }));
        }
    }
}

export const updateStarredList = (data, stateData = [], originalMsg = {}) => {
    let newState = [...stateData];
    const index = stateData.findIndex(el => el.msgId === data.msgId)
    if (index > -1) {
        if (data.favouriteStatus === 0) newState.splice(index, 1);
        else if (data?.favouriteStatus === 1 && originalMsg?.editedStatus === 1) {
            //Edited content instant update in starred message
            const updatednewStateArr = newState;
            const findedItemIndex = updatednewStateArr?.findIndex((item) => item?.msgId === originalMsg?.msgId);
            const isCaption = newState[findedItemIndex]?.msgBody?.media?.caption || "";
            let constructObj = {};
            if (isCaption !== "") {
                constructObj = {
                    ...newState[findedItemIndex],
                    msgBody: {
                        ...newState[findedItemIndex].msgBody,
                        media: {
                            ...newState[findedItemIndex].msgBody.media,
                            caption: originalMsg?.msgBody?.media?.caption,
                        },
                    },
                    editedStatus: originalMsg?.editedStatus
                }
            } else {
                constructObj = {
                    ...newState[findedItemIndex],
                    msgBody: {
                        ...newState[findedItemIndex].msgBody,
                        message: originalMsg?.msgBody?.message
                    },
                    editedStatus: originalMsg?.editedStatus
                }
            }
            newState[findedItemIndex] = constructObj;
        }
    } else if (data.favouriteStatus === 1) {
        newState.push(originalMsg);
    }

    return newState;
}

export const getFavaouriteMsgObj = (msg, chatId) => {
    const publisherId = Store.getState().vCardData?.data?.fromUser;
    const isValidPublisherJid = publisherId === msg?.fromUserId ? publisherId : msg.publisherId;
    return {
        ...msg,
        favDate: changeTimeFormat(Date.now() * 1000),
        msgType: msg?.msgBody?.message_type,
        ...(isSingleChat(msg.chatType) && {
            publisherId: msg.publisherId || (publisherId === msg?.fromUserId ? publisherId : msg.publisherId),
            publisherJid: formatUserIdToJid(msg?.publisherId ? msg.publisherId : isValidPublisherJid),
            fromUserId: chatId,
            fromUserJid: formatUserIdToJid(chatId)
        }),
        ...(isGroupChat(msg.chatType) && {
            publisherId: msg.publisherId || (publisherId === msg?.fromUserId ? publisherId : msg.publisherId),
            publisherJid: formatUserIdToJid(msg?.publisherId ? msg.publisherId : isValidPublisherJid),
            fromUserId: chatId,
            fromUserJid: formatUserIdToJid(chatId, msg.chatType)
        }),
    }
};

export const getBlobUrlFromToken = (fileToken, dbInstance, fileKey, msgId) => {
    return indexedDb
      .getImageByKey(fileToken, dbInstance, fileKey, msgId)
      .then((blob) =>  window.URL.createObjectURL(blob))
      .catch(() =>  "");
}

export const updateMessageTranslate = (data, stateData) => {
    const currentChatData = stateData[data.fromUserId];
    if (currentChatData?.messages && Object.keys(currentChatData?.messages).length > 0) {
        const currentMessage = currentChatData.messages[data.msgId];
        if (currentMessage) {
            currentMessage.msgBody.translatedMessage = data.translatedMessage;
            return {
                ...stateData,
                [data.fromUserId]: {
                    ...currentChatData,
                    [data.msgId]: currentMessage
                }
            };
        }
    }
    return {
        ...stateData
    };
};

export const getAllStarredMessages = () => {
    const { starredMessages: { data = [] } = {} } = Store.getState();
    return data;
}

export const updatedStarredMessageStatus = (data, stateData = []) => {
    return stateData.map(msg => {
        if (msg.msgId === data.msgId) {
            msg.msgStatus = getMsgStatusInOrder(msg.msgStatus, data.msgStatus)
        }
        return msg;
    });
};

export const getMutedChats = () => {
    const { recentChatData: { data = [] } = {} } = Store.getState();
    const chatIds = [];
    data.forEach(recent => {
        if (recent.muteStatus === 1) chatIds.push(recent.fromUserId);
    });
    return chatIds;
};

export const getArchivedChats = () => {
    const { recentChatData: { data = [] } = {} } = Store.getState();
    const chatIds = [];
    data.forEach(recent => {
        if (recent.archiveStatus === 1) chatIds.push(recent.fromUserId);
    });
    return chatIds;
};

export const getPushNotificationData = async (data) => {
    let title = "", imageToken = "", updateMessage = "";
    const {
      fromUserId = "",
      publisherId = "",
      chatType = "",
      msgBody: { message = "", message_type = "" } = {}
    } = data;

    try {
        updateMessage = isTextMessage(message_type) ? message : `${capitalizeTxt(message_type)}`;
    
        if (isSingleChat(chatType)) {
            const roster = getUserDetails(fromUserId) || {};
            const {displayName, image, thumbImage} = roster;           
            title = displayName || "";
            imageToken = (thumbImage && thumbImage !== "") ? thumbImage : image;
        } else {
            const groupData = getGroupData(fromUserId) || {};
            const {groupName, groupImage, thumbImage } = groupData;
            title = groupName || "";
            imageToken = (thumbImage && thumbImage !== "") ? thumbImage : groupImage;
            const senderName = getContactNameFromRoster(getDataFromRoster(publisherId)) || publisherId;
            updateMessage = `${senderName}: ${updateMessage}`;
        }
    
        const result = await indexedDb.getImageByKey(imageToken, "profileimages");
        return {
            title,
            image: window.URL.createObjectURL(result),
            message: updateMessage
        }
    } catch (error) {
        return {
            title,
            image: isSingleChat(chatType) ? getAvatarImage : groupAvatar,
            message: updateMessage
        }
    }
};
  
export const handleUnarchiveChat = (fromUserId, chatType = CHAT_TYPE_SINGLE) => {
    SDK.updateArchiveChat(formatUserIdToJid(fromUserId, chatType), false);
    const dispatchData = {
      fromUserId,
      isArchived: false
    };
    Store.dispatch(updateArchiveStatusRecentChat(dispatchData));
};

export const handleArchiveActions = async (listenerData = {}) => {
    const { msgType = "", fromUserId = "", chatType = "", msgBody: { replyTo = "" } = {}, editedStatus = 0 } = listenerData;
    if (msgType === "carbonReceiveMessage" || msgType === "receiveMessage") {
      const chatIds = getArchivedChats(),
        isPermanentArchvie = getArchiveSetting();
  
      // UnArchive Chat On Receiving New Message - Only for Temporary Archive
      if (fromUserId && chatIds.includes(fromUserId) && !isPermanentArchvie) {
        handleUnarchiveChat(fromUserId, chatType);
      }
  
      // Send Push If Message is Replied to Current User's Message
      if (replyTo) {
        const mutedChats = getMutedChats();
        if (isGroupChat(chatType) && !isActiveConversationUserOrGroup(fromUserId) && !mutedChats.includes(fromUserId)) {
          const orgMsg = await SDK.getMessageById(replyTo, getActiveConversationUserJid());
          if (orgMsg.statusCode === 200 && orgMsg.data) {
            const { publisherId = "" } = orgMsg.data || {};
            if (isLocalUser(publisherId) && editedStatus !== 1) {
              const { title, image, message } = await getPushNotificationData(listenerData);
              sendNotification(title, image, message, fromUserId);
            }
          }
        }
      }
    }
};
  
export const handleTempArchivedChats = (chatJid, chatType) => {
    const archivedChats = getArchivedChats(),
        isPermanentArchvie = getArchiveSetting(),
        chatId = getUserIdFromJid(chatJid);
    
    if (chatId && archivedChats.includes(chatId) && !isPermanentArchvie) {
        handleUnarchiveChat(chatId, chatType);
    }
};

export const handleUserSettings = async () => {
    const userSettings = await SDK.getUserSettings();
    const webSettings = getLocalWebsettings() || {};
    Store.dispatch(webSettingLocalAction({ 
        "isEnableArchived" : userSettings?.data?.archive === 0 ? false : true,
        "translate": webSettings.translate || false
     }));
    setLocalWebsettings("archive", userSettings?.data?.archive === 0 ? false : true);
}

export const handleArchivedChats = async () => {
    const archivedChats = await SDK.getAllArchivedChats();
    if (archivedChats.statusCode === 200 && archivedChats.data.length) {
        for (let i in archivedChats.data) {
            const element = archivedChats.data[i];
            element.isArchived = true;
            Store.dispatch(updateArchiveStatusRecentChat(element));
        }  
    }
};

export const getRecentChatData = () => {
    const { recentChatData: { data = [] } = {} } = Store.getState();
    return data;
};

export const getMessagesForReport = (chatId, selectedMsgIdType) => {
    const chatMessages = getChatMessageHistoryById(chatId);
    let msgDataArray = [];
    const sortedData = chatMessages.filter((item)=>(Object.keys(item.msgBody).length !==0)).sort((a, b) => (b.timestamp < a.timestamp ? -1 : 1));
    if (sortedData.length) {
        let selectedMsgId = selectedMsgIdType !== REPORT_FROM_CONTACT_INFO ? selectedMsgIdType : sortedData[0]?.msgId
        let count = 0;
        const filteredData = sortedData.filter(msg => {
            if (msg.msgId === selectedMsgId || (count > 0 && count < reportMembers) ) {
                count++;
                return msg;
            }
        });
        filteredData.map((item,key)=>{
            let msgObject = {}
            msgObject["msgId"] = item?.msgId || ""
            if (item?.editedStatus === 1) {
                msgObject["message"] = item?.msgBody?.media?.caption ? "Edited - "+item?.msgBody?.media?.caption : "Edited - "+item?.msgBody?.message;
            } else {
                msgObject["message"] = item?.msgBody?.message || item?.msgBody?.media?.caption || "";
            }
            msgObject["msgType"] = item?.msgBody?.message_type || ""
            msgObject["filename"] = item?.msgBody?.media?.fileName || ""
            msgObject["timestamp"] = item?.timestamp
            msgObject["publisherId"] = item?.publisherId || item?.fromUserId
            msgDataArray.push(msgObject)
        })
    }else if(sortedData.length === 0){
        return msgDataArray
    }
    return msgDataArray
};
