import SDK from "../../SDK";
import { encryptAndStoreInLocalStorage, getFromLocalStorageAndDecrypt } from "../../WebChat/WebChatEncryptDecrypt";
import Store from "../../../Store";
import { formatToArrayofJid, setContactWhoBleckedMe } from "../../../Helpers/Chat/BlockContact";
import { blockedContactAction } from "../../../Actions/BlockAction";
import { isAppOnline } from "../../../Helpers/Utility";
import { setConnectionStatus } from "../Common/FileUploadValidation";
import { CHAT_TYPE_GROUP, CONNECTION_STATE_CONNECTING } from "../../../Helpers/Chat/Constant";
import { WebChatConnectionState } from "../../../Actions/ConnectionState";
import {
  getAllStarredMessages,
  getLastMsgFromHistoryById,
  getRecentChatData,
  handleArchivedChats,
  handleUserSettings,
  isActiveConversationUserOrGroup,
  isGroupChat,
  arrayToObject
} from "../../../Helpers/Chat/ChatHelper";
import { getIdFromJid, formatUserIdToJid, isLocalUser } from "../../../Helpers/Chat/User";
import { ChatMessageHistoryDataAction, UpdateFavouriteStatus } from "../../../Actions/ChatHistory";
import { StarredMessagesList } from "../../../Actions/StarredAction";
import { chatSeenPendingMsg } from "../../../Actions/SingleChatMessageActions";
import { toast } from 'react-toastify';
import { ActiveChatResetAction, RecentChatAction } from "../../../Actions/RecentChatActions"
import { hideModal } from '../../../Actions/PopUp';
import { messageInfoAction } from "../../../Actions/MessageActions";
import { GroupsDataAction } from "../../../Actions/GroupsAction";
import { setGroupParticipants, setGroupParticipantsByGroupId } from "../../../Helpers/Chat/Group";
import { RosterPermissionAction } from "../../../Actions/RosterActions";
import { FeatureEnableState } from "../../../Actions/FeatureAction";
import { REACT_APP_CONTACT_SYNC } from "../../processENV";

const handleBlockMethods = async () => {
  const userIBlockedRes = await SDK.getUsersIBlocked();
  if (userIBlockedRes && userIBlockedRes.statusCode === 200) {
    const jidArr = formatToArrayofJid(userIBlockedRes.data);
    Store.dispatch(blockedContactAction(jidArr));
  }

  const userBlockedMeRes = await SDK.getUsersWhoBlockedMe();
  if (userBlockedMeRes && userBlockedMeRes.statusCode === 200) {
    const jidArr = formatToArrayofJid(userBlockedMeRes.data);
    setContactWhoBleckedMe(jidArr);
  }
};

const getAndUpdateChatMessages = async (chatId, chatType, rowId) => {
  const chatMessageRes = await SDK.getChatMessages({toJid: formatUserIdToJid(chatId, chatType)});
  if (chatMessageRes && chatMessageRes.statusCode === 200) {
    chatMessageRes.data.reconnectFetch = 1
    chatMessageRes.chatType = chatType;
    delete chatMessageRes.statusCode;
    delete chatMessageRes.message;
    if (chatId === getIdFromJid(chatMessageRes.userJid || chatMessageRes.groupJid)) {
      Store.dispatch(ChatMessageHistoryDataAction(chatMessageRes));
      const groupId = isGroupChat(chatType) ? chatId : "";
      chatMessageRes.data.forEach((el) => {
        if (!isLocalUser(el.publisherId) && el.rowId !== rowId) {
          if (isActiveConversationUserOrGroup(chatId)) {
            SDK.sendSeenStatus(formatUserIdToJid(el.publisherId), el.msgId, groupId);
          } else {
            Store.dispatch(chatSeenPendingMsg(el));
          }
        }
      });
    }
  }
};

const checkIfConversationRefreshNeeded = (newRecent, oldRecent) => {
  const { msgStatus: newMsgStatus } = newRecent;
  const { msgStatus: oldMsgStatus } = oldRecent;
  return newMsgStatus !== oldMsgStatus;
};

const handleChatHistoryUpdate = (recentChatArr, oldRecentChatData) => {
  const { chatConversationHistory: { data } = {} } = Store.getState();
  const chatHistoryIds = Object.keys(data);
  const recentChatArrNew = recentChatArr.reverse();
  const oldRecentChatObj = arrayToObject(oldRecentChatData, "fromUserId");

  for (const newRecentChat of recentChatArrNew) {
    const { fromUserId: chatId, msgId: recentMsgId, chatType } = newRecentChat;
    const oldRecentChat = oldRecentChatObj[chatId];

    if (chatHistoryIds.includes(chatId)) {
      const { msgId: lastMsgId, rowId } = getLastMsgFromHistoryById(chatId);
      const isRefreshNeeded = checkIfConversationRefreshNeeded(newRecentChat, oldRecentChat);

      // If Message Status Changed - Refresh Conversation History
      if (isRefreshNeeded || isAppOnline()) {
        getAndUpdateChatMessages(chatId, chatType);
      }

      if (recentMsgId !== lastMsgId) {
        // When there is no message, the position fetching should be 'UP'
        // Because no message in current conversation screen. So we should
        // get the recent messages only. Otherwise 'DOWN'

        getAndUpdateChatMessages(chatId, chatType, rowId);
      } else {
        break;
      }
    }
  }
};

const handleFavouriteMessages = async () => {
  const favResult = await SDK.getAllFavouriteMessages();

  // Here Updating the Coversation History If there is any new added/removed Favourite Messages are there when offline
  if (favResult.statusCode === 200) {
    const starredMessages = getAllStarredMessages();
    const addedFavs = favResult.data.filter(({ msgId: id1 }) => !starredMessages.some(({ msgId: id2 }) => id2 === id1));
    if (addedFavs.length) {
      addedFavs.forEach((msg) => {
        const res = {
          fromUserId: msg.fromUserId,
          msgId: msg.msgId,
          favouriteStatus: 1
        };
        Store.dispatch(UpdateFavouriteStatus(res));
      });
    }
    const removedFavs = starredMessages.filter(
      ({ msgId: id1 }) => !favResult.data.some(({ msgId: id2 }) => id2 === id1)
    );
    if (removedFavs.length) {
      removedFavs.forEach((msg) => {
        const res = {
          fromUserId: msg.fromUserId,
          msgId: msg.msgId,
          favouriteStatus: 0
        };
        Store.dispatch(UpdateFavouriteStatus(res));
      });
    }
    Store.dispatch(StarredMessagesList(favResult.data));
  }
};

const handleMentionedMessage = async () => {
  const state = Store.getState();
  if(state.selectedMessageInfoReducer?.data?.msgId){
    Store.dispatch(messageInfoAction(state.selectedMessageInfoReducer?.data?.msgId, true));
    SDK.getGroupMsgInfo(state.groupsMemberListData.data.groupJid, state.selectedMessageInfoReducer.data.msgId);
  }
}

export async function login() {
  try {
    let featureData = {};
    if (getFromLocalStorageAndDecrypt("auth_user")) {
      let decryptResponse = getFromLocalStorageAndDecrypt("auth_user");
      const tokenResult = await SDK.getUserToken(decryptResponse.username, decryptResponse.password);
    if (tokenResult.statusCode === 200) {
      encryptAndStoreInLocalStorage("token", tokenResult.userToken);
    }

      await SDK.getUserProfile(formatUserIdToJid(decryptResponse.username));
      if (REACT_APP_CONTACT_SYNC) {
        await SDK.getFriendsList();
      } else {
        Store.dispatch(RosterPermissionAction(1));
      }
      const featureResponse = SDK.getAvailableFeatures();
      if (featureResponse.statusCode === 200) {
        featureData = featureResponse.data;
        Store.dispatch(FeatureEnableState(featureData));
        encryptAndStoreInLocalStorage("featureRestrictionFlags", featureData);
      }

      if (featureData.isGroupChatEnabled) {
        const groupListRes = await SDK.getGroupsList();
        if (groupListRes && groupListRes.statusCode === 200) {
          groupListRes.data.map(async (group) => {
            const groupJid = formatUserIdToJid(group.groupId, CHAT_TYPE_GROUP);
            const groupPartRes = await SDK.getGroupParticipants(groupJid);
            if (groupPartRes && groupPartRes.statusCode === 200) {
              setGroupParticipantsByGroupId(groupJid, groupPartRes.data.participants);
              setGroupParticipants(groupPartRes.data);
            }
          });
          Store.dispatch(GroupsDataAction(groupListRes.data));

          const { data = [] } = groupListRes
          data.forEach(item => {
            if (isActiveConversationUserOrGroup(item?.groupId) && item?.isAdminBlocked) {
              Store.dispatch(ActiveChatResetAction());
              toast.info("This group is no longer available")
              Store.dispatch(hideModal())
            }
          });
        }
      }

      const oldRecentChatData = getRecentChatData();
      const recentChatsRes = await SDK.getRecentChats();
      let recentChatArr = [];
      if (recentChatsRes && recentChatsRes.statusCode === 200) {
        recentChatArr = recentChatsRes.data;
        Store.dispatch(RecentChatAction(recentChatArr));
      }
      handleUserSettings();
      handleChatHistoryUpdate(recentChatArr, oldRecentChatData);
      handleArchivedChats();
      handleBlockMethods();
      handleFavouriteMessages();
      handleMentionedMessage();

    }
  } catch (error) {
    console.log("reconnect error :>> ", error);
  }
}

export function reconnect() {
  // Update connection status
  encryptAndStoreInLocalStorage("connection_status", CONNECTION_STATE_CONNECTING);
  setConnectionStatus(CONNECTION_STATE_CONNECTING);
  Store.dispatch(WebChatConnectionState(CONNECTION_STATE_CONNECTING));
}
