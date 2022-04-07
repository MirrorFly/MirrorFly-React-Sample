import SDK from "../../SDK";
import { decryption } from "../../WebChat/WebChatEncryptDecrypt";
import { ReconnectRecentChatAction } from "../../../Actions/RecentChatActions";
import Store from "../../../Store";
import { formatToArrayofJid, setContactWhoBleckedMe } from "../../../Helpers/Chat/BlockContact";
import { blockedContactAction } from "../../../Actions/BlockAction";
import { encryption } from "../WebChatEncryptDecrypt";
import { GroupsDataAction } from "../../../Actions/GroupsAction";
import { isAppOnline } from "../../../Helpers/Utility";
import { setConnectionStatus } from "../Common/FileUploadValidation";
import { CONNECTION_STATE_CONNECTING } from "../../../Helpers/Chat/Constant";
import { WebChatConnectionState } from "../../../Actions/ConnectionState";
import {
  getAllStarredMessages,
  getLastMsgFromHistoryById,
  isActiveConversationUserOrGroup,
  isGroupChat
} from "../../../Helpers/Chat/ChatHelper";
import { getIdFromJid, formatUserIdToJid, isLocalUser } from "../../../Helpers/Chat/User";
import { RECONNECT_GET_CHAT_LIMIT } from "../../../Helpers/Constants";
import { ChatMessageHistoryDataAction, UpdateFavouriteStatus } from "../../../Actions/ChatHistory";
import { StarredMessagesList } from "../../../Actions/StarredAction";
import { chatSeenPendingMsg } from "../../../Actions/SingleChatMessageActions";

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

const getAndUpdateChatMessages = async (rowId, chatId, chatType) => {
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
      Store.dispatch(ChatMessageHistoryDataAction(chatMessageRes));
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

const handleChatHistoryUpdate = (recentChatArr) => {
  const { chatConversationHistory: { data } = {} } = Store.getState();
  const chatHistoryIds = Object.keys(data);
  const recentChatArrNew = recentChatArr.reverse();

  for (let i = 0; i < recentChatArrNew.length; i++) {
    const recent = recentChatArrNew[i];
    const { fromUserId: chatId, msgId: recentMsgId, chatType } = recent;

    if (chatHistoryIds.includes(chatId)) {
      const { msgId: lastMsgId, rowId } = getLastMsgFromHistoryById(chatId);

      if (recentMsgId !== lastMsgId) {
        // When there is no message, the position fetching should be 'UP'
        // Because no message in current conversation screen. So we should
        // get the recent messages only. Otherwise 'DOWN'

        getAndUpdateChatMessages(rowId, chatId, chatType);
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
    if (localStorage.getItem("auth_user")) {
      let decryptResponse = decryption("auth_user");

      const loginResult = await SDK.login(decryptResponse.username, decryptResponse.password, true);
      console.log("Reconnect loginResult :>> ", loginResult);
      if (loginResult.statusCode === 200) {
        await SDK.getUserProfile(formatUserIdToJid(decryptResponse.username));
        await SDK.getFriendsList();

        const groupListRes = await SDK.getGroupsList();
        if (groupListRes && groupListRes.statusCode === 200) {
          encryption("groupslist_data", groupListRes.data);
          Store.dispatch(GroupsDataAction(groupListRes.data));
        }

        const recentChatsRes = await SDK.getRecentChats();
        let recentChatArr = [];
        if (recentChatsRes && recentChatsRes.statusCode === 200) {
          recentChatArr = recentChatsRes.data;
          Store.dispatch(ReconnectRecentChatAction(recentChatsRes.data, true));
        }

        handleChatHistoryUpdate(recentChatArr);
        handleBlockMethods();
        handleFavouriteMessages();
      }
    }
  } catch (error) {
    console.log("reconnect error :>> ", error);
  }
}

export function reconnect() {
  // Update connection status
  localStorage.setItem("connection_status", CONNECTION_STATE_CONNECTING);
  setConnectionStatus(CONNECTION_STATE_CONNECTING);
  Store.dispatch(WebChatConnectionState(CONNECTION_STATE_CONNECTING));
  isAppOnline() && login();
}
