import { UNREAD_MESSAGE_UPDATE, UNREAD_MESSAGE_DELETE, RESET_UNREAD_COUNT, UPDATE_MUTE_RECENT_CHAT, CLEAR_ALL_CHAT } from '../Actions/Constants';

const initialState = {
    id:null,
    activeUser: {},
    unreadDataObj: {}
}

const updateCount = (unreadDataObj, currentData) => {
    const existUser = unreadDataObj[currentData.fromUserId];
    const currentDataCount = currentData.count;
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
    if(unreadDataObj[currentData.fromUserId]){
        delete unreadDataObj[currentData.fromUserId];
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
