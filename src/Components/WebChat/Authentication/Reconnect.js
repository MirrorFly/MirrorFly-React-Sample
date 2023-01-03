import SDK from "../../SDK";
import { getFromLocalStorageAndDecrypt, encryptAndStoreInLocalStorage} from "../../WebChat/WebChatEncryptDecrypt";
import { ReconnectRecentChatAction } from "../../../Actions/RecentChatActions";
import Store from "../../../Store";
import { formatToArrayofJid, setContactWhoBleckedMe } from "../../../Helpers/Chat/BlockContact";
import { blockedContactAction } from "../../../Actions/BlockAction";
import { GroupsDataAction } from "../../../Actions/GroupsAction";
import { isAppOnline, logout } from "../../../Helpers/Utility";
import { setConnectionStatus } from "../Common/FileUploadValidation";
import { CONNECTION_STATE_CONNECTING } from "../../../Helpers/Chat/Constant";
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
import { RECONNECT_GET_CHAT_LIMIT } from "../../../Helpers/Constants";
import { ChatMessageHistoryDataAction, UpdateFavouriteStatus } from "../../../Actions/ChatHistory";
import { StarredMessagesList } from "../../../Actions/StarredAction";
import { chatSeenPendingMsg } from "../../../Actions/SingleChatMessageActions";
import { adminBlockStatusUpdate } from "../../../Actions/AdminBlockAction";
import { toast } from 'react-toastify';
import { ActiveChatResetAction } from "../../../Actions/RecentChatActions"
import { hideModal } from '../../../Actions/PopUp';

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
  let position = rowId ? "down" : "up";
  const chatMessageRes = await SDK.getChatMessages(
    formatUserIdToJid(chatId, chatType),
    position,
    rowId,
    RECONNECT_GET_CHAT_LIMIT,
    false
  );

  if (chatMessageRes && chatMessageRes.statusCode === 200) {
    chatMessageRes.chatType = chatType;
    delete chatMessageRes.statusCode;
    delete chatMessageRes.message;
    if (chatId === getIdFromJid(chatMessageRes.userJid || chatMessageRes.groupJid)) {
      Store.dispatch(ChatMessageHistoryDataAction(chatMessageRes,true));
      const groupId = isGroupChat(chatType) ? chatId : "";
      chatMessageRes.data.map((el) => {
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

  for (let i = 0; i < recentChatArrNew.length; i++) {
    const newRecentChat = recentChatArrNew[i];
    const { fromUserId: chatId, msgId: recentMsgId, chatType } = newRecentChat;
    const oldRecentChat = oldRecentChatObj[chatId];

    if (chatHistoryIds.includes(chatId)) {
      const { msgId: lastMsgId, rowId } = getLastMsgFromHistoryById(chatId);
      const isRefreshNeeded = checkIfConversationRefreshNeeded(newRecentChat, oldRecentChat);

      // If Message Status Changed - Refresh Conversation History
      if (isRefreshNeeded) {
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
      addedFavs.map((msg) => {
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
      removedFavs.map((msg) => {
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

export async function login() {
  try {
    if (getFromLocalStorageAndDecrypt("auth_user")) {
      let decryptResponse = getFromLocalStorageAndDecrypt("auth_user");

      const loginResult = await SDK.connect(decryptResponse.username, decryptResponse.password, true);
      console.log("Reconnect loginResult :>> ", loginResult);
      if (loginResult.statusCode === 200) {
        await SDK.getUserProfile(formatUserIdToJid(decryptResponse.username));
        // await SDK.getFriendsList();
        const groupListRes = await SDK.getGroupsList();
        if (groupListRes && groupListRes.statusCode === 200) {
          Store.dispatch(GroupsDataAction(groupListRes.data));
        }
      const { data = [] } = groupListRes 
        data.map(item=>{
          if( isActiveConversationUserOrGroup(item?.groupId) && item?.isAdminBlocked){
            Store.dispatch(ActiveChatResetAction());
            toast.info("This group is no longer available")
            Store.dispatch(hideModal())
          }  
        }
        )
        
        const oldRecentChatData = getRecentChatData();
        const recentChatsRes = await SDK.getRecentChats();
        let recentChatArr = [];
        if (recentChatsRes && recentChatsRes.statusCode === 200) {
          recentChatArr = recentChatsRes.data;
          Store.dispatch(ReconnectRecentChatAction(recentChatsRes.data, true));
        }

        handleUserSettings();
        handleChatHistoryUpdate(recentChatArr, oldRecentChatData);
        handleArchivedChats();
        handleBlockMethods();
        handleFavouriteMessages();
      } else if (loginResult.statusCode === 403) {
        Store.dispatch(adminBlockStatusUpdate({
          toUserId: decryptResponse.username,
          isAdminBlocked: true
        }));
        logout("block");
        return
      }
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
  isAppOnline() && login();
}
