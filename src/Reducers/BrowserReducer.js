import { BROWSER_NOTIFY, BROWSER_TAB_VISIBLE_ACTIVITY, APP_ONLINE_STATUS, LOCAL_STROAGE_CHANGES } from '../Actions/Constants';

export function browserNotifyReducer(state = {}, action = {}) {
    if (action.type === BROWSER_NOTIFY) {
        return action.payload;
    }
    return state;
}

export function browserTabReducer(state = { isVisible: true }, action = {}) {
    if (action.type === BROWSER_TAB_VISIBLE_ACTIVITY) {
        return action.payload;
    }
    return state;
}

export function appOnlineStatusReducer(state = { isOnline: true }, action = {}) {
    if (action.type === APP_ONLINE_STATUS) {
        return action.payload;
    }
    return state;
}

const webLocalStorageSetting =  {
    isEnableTranslate : false,
    isEnableArchived:true,
}

export const webLocalStorageSettingReducer = (state = webLocalStorageSetting , action = {}) => {
switch (action.type) {
        case 'INITIAL_TRANSLATE_STAGE': {
            return {
                ...state,
                ...webLocalStorageSetting
            };
        }
        case LOCAL_STROAGE_CHANGES: {
            const {payload:{data:{ translate = false, isEnableArchived = true } = { } } = { } } = action;
            return {
                ...state,
                isEnableTranslate:translate,
                isEnableArchived:isEnableArchived
            };
        }
        default:
            return {
                ...state,
            };
    }
};

