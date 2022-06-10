import uuidv4 from 'uuid/v4';
import { get as _get } from "lodash";
import SDK from '../Components/SDK';
import { getFavaouriteMsgObj } from '../Helpers/Chat/ChatHelper';
import { CALL_STAR_ORIGINAL_MESSAGE, CALL_STAR_ORIGINAL_MESSAGE_ROW_DATA, REMOVE_ALL_STARRED_MESSAGE, REMOVE_STARRED_MESSAGE_CLEAR_CHAT, REMOVE_STARRED_MESSAGE_DELETE_CHAT, STARRED_MESSAGEE_LIST, UPDATE_STARRED_MESSAGE_LIST } from "./Constants";
 
export const StarredMessagesList = (data) => {
 return {
   type: STARRED_MESSAGEE_LIST,
   payload: {
     id: uuidv4(),
     data
   }
 };
};
 
const startSdkCall = async (msgId = "") => {
 const msgResult = await SDK.getMessageById(msgId)
 if (msgResult && msgResult.statusCode === 200) {
   return getFavaouriteMsgObj(msgResult.data, msgResult.data.fromUserId);
 }
}
 
export function UpdateStarredMessages(payloadData) {
 return async (dispatch, getState) => {
   const { chatConversationHistory: { data } = {} } = getState();
   let originalMsg = {}
   if (payloadData.favouriteStatus === 1) {
     const { fromUserId, msgId } = payloadData;
     if (data[fromUserId]?.messages && Object.keys(data[fromUserId]?.messages).length > 0) {
       const msg = data[fromUserId]?.messages[msgId] || {};
       if (_get(msg, "msgId", "") !== "") {
         originalMsg =await getFavaouriteMsgObj(msg, fromUserId);
       } else {
         originalMsg =await startSdkCall(msgId)
       }
     } else {
       originalMsg =await startSdkCall(msgId)
     }
   }
   dispatch(UpdateStarredMessagesList(payloadData, originalMsg));
 }
}
 
export const UpdateStarredMessagesList = (data, originalMsg) => {
 return {
   type: UPDATE_STARRED_MESSAGE_LIST,
   payload: {
     id: uuidv4(),
     data,
     originalMsg
   }
 };
};
 
export const RemoveAllStarredMessages = (data) => {
 return {
   type: REMOVE_ALL_STARRED_MESSAGE,
   payload: {
     id: uuidv4(),
     data
   }
 };
};
 
export const RemoveStaredMessagesClearChat = (data) => {
 return {
   type: REMOVE_STARRED_MESSAGE_CLEAR_CHAT,
   payload: {
     id: uuidv4(),
     data
   }
 };
};
 
export const RemoveStaredMessagesDeleteChat = (data) => {
 return {
   type: REMOVE_STARRED_MESSAGE_DELETE_CHAT,
   payload: {
     id: uuidv4(),
     data
   }
 };
};
export const callOriginStrMsgAction = (data = {}) => {
 return {
   type: CALL_STAR_ORIGINAL_MESSAGE,
   payload: {
     id: uuidv4(),
     data
   }
 };
}
 
export const startRowMsgData = (data = {}) => {
 return {
   type: CALL_STAR_ORIGINAL_MESSAGE_ROW_DATA,
   payload: {
     id: uuidv4(),
     data
   }
 };
}