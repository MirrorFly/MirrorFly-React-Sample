import { UNREAD_MESSAGE_UPDATE, UNREAD_MESSAGE_DELETE, RESET_UNREAD_COUNT, UPDATE_MUTE_RECENT_CHAT, CLEAR_ALL_CHAT, REDUCE_UNREAD_MESSAGE_COUNT, UNREAD_USER_OBJ, GROUP_NOTIFICATION_MSG_COUNT } from '../Actions/Constants';

const initialState = {
    id:null,
    activeUser: {},
    unreadDataObj: {}
}
const initialUnreadUserObj = {}
const initialGroupNotificationCount = {}
let msgCount = 0
const updateCount = (unreadDataObj, currentData) => {
    const existUser = unreadDataObj[currentData.fromUserId];
    const currentDataCount = currentData.count;
   if(currentDataCount){
    msgCount += currentDataCount 
   }
   else{
       msgCount = msgCount + 1 
       }
        
    localStorage.setItem("unreadMessageCount",msgCount)
    if(!existUser){
        unreadDataObj[currentData.fromUserId] = {
            count: currentDataCount || 1
        };
    } else if (currentData.isRefresh) {
        unreadDataObj[currentData.fromUserId] = {
            ...existUser, 
            count: existUser.count
        };
    }
    else{
        const count =  currentDataCount ? currentDataCount + existUser.count : existUser.count;
        unreadDataObj[currentData.fromUserId] = {...existUser, count: count + 1};
    }
    return unreadDataObj;
}

const deleteCount = (unreadDataObj, currentData) => {
    const existUser = unreadDataObj[currentData.fromUserId];
    if(unreadDataObj[currentData.fromUserId]){
        delete unreadDataObj[currentData.fromUserId];
        msgCount = msgCount - existUser.count
        localStorage.setItem("unreadMessageCount",msgCount)
    }
    return unreadDataObj;
}

const reduceUnreadCount = (unreadDataObj, currentData) =>{
    const userId = currentData.fromUserId;
    const newCount = currentData.count;
    if (unreadDataObj[userId]) {
        unreadDataObj[userId].count = newCount;
    } else {
        unreadDataObj[userId] = { count: newCount };
    }
  return unreadDataObj;
}


export function UnreadCountReducer(state = {...initialState}, action = {}) {
    const { payload } = action
    switch (action.type) {
        case UNREAD_MESSAGE_UPDATE:
            return {
                ...state,
                id: payload.id,
                unreadDataObj: updateCount(state.unreadDataObj, payload.data)
            }
        case UNREAD_MESSAGE_DELETE:
            return {
                ...state,
                id: payload.id,
                activeUser: payload.data,
                unreadDataObj: deleteCount(state.unreadDataObj, payload.data)
            }
        case REDUCE_UNREAD_MESSAGE_COUNT:
            return {
                    ...state,
                    id: payload.id,
                    unreadDataObj: reduceUnreadCount(state.unreadDataObj, payload.data)
            }      
        case RESET_UNREAD_COUNT:
            return {
                id:null,
                activeUser: {},
                unreadDataObj: {}
            }
        case UPDATE_MUTE_RECENT_CHAT:
            return {
                ...state
            }
        case CLEAR_ALL_CHAT:
            return {
                 ...state,
                 id: payload.fromUserId,
                 unreadDataObj: {}
            }
      
        default:
            return state;
    }
}

export function UnreadUserObjReducer(state = {...initialUnreadUserObj}, action = {}) { 
    const {type, payload } = action;
    if (type === UNREAD_USER_OBJ) {
        const { fromUserId, count } = payload.data;
        return {
            ...state,
            [fromUserId]: {
                ...state[fromUserId], 
                apiOriginalCount: payload.data.apiOriginalCount || state[fromUserId]?.apiOriginalCount || 0,
                fetchDirection: payload.data.fetchDirection || state[fromUserId]?.fetchDirection || "up",
                unreadRealTimeMsgCount: payload.data.unreadRealTimeMsgCount || state[fromUserId]?.unreadRealTimeMsgCount || 0,
                count: count, 
                fromUserId: fromUserId,
                unreadMsgId: state[fromUserId]?.unreadMsgId || payload.data.unreadMsgId || "",
                fetchLastMsgId: payload.data.fetchLastMsgId || state[fromUserId]?.fetchLastMsgId || "",
                chatJid: state[fromUserId]?.chatJid || payload.data.chatJid || "",
                fullyViewedChat: payload.data.fullyViewedChat || state[fromUserId]?.fullyViewedChat || false,
                fullyScrolled: payload.data.fullyScrolled || state[fromUserId]?.fullyScrolled || false,
                intialChatFetching: payload.data.intialChatFetching || state[fromUserId]?.intialChatFetching || true,
                msgFetchedSet:  payload.data.msgFetchedSet || state[fromUserId]?.msgFetchedSet || 0,
            }
        };
    }
    return state;
}

export function groupNotificationMsgCountReducer(state = {...initialGroupNotificationCount}, action = {}) {
    const { type, payload } = action;
    if (type == GROUP_NOTIFICATION_MSG_COUNT) {
        const { fromUserId, setNumber, notificationCount } = payload.data;
        return {
            ...state,
            [fromUserId]: {
                ...state[fromUserId],
                [setNumber]: notificationCount || state[fromUserId]?.[setNumber] || 0
            }
        };
    }
    return state;
}

