import { BROWSER_NOTIFY, BROWSER_TAB_VISIBLE_ACTIVITY, APP_ONLINE_STATUS, LOCAL_STROAGE_CHANGES } from './Constants';

export const browserNotifyAction = (pageName) => {
    return {
        type: BROWSER_NOTIFY,
        payload:{
            pageName
        }
    }
}

/**
 * Hanlde the browser tab activities
 * @param {Bool} isVisible
 */
export const browserTabAction = (isVisible) => {
    return {
        type: BROWSER_TAB_VISIBLE_ACTIVITY,
        payload:{
            isVisible
        }
    }
}

/**
 * Hanlde the internet status
 * @param {Bool} isOnline
 */
export const appOnlineStatusAction = (isOnline) => {
    return {
        type: APP_ONLINE_STATUS,
        payload:{
            isOnline
        }
    }
}

export const webSettingLocalAction = (data) => {
    return {
        type: LOCAL_STROAGE_CHANGES,
        payload:{
            data
        }
    }
}

