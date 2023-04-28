import Store from "../Store";
import { appOnlineStatusAction } from '../Actions/BrowserAction';
import { WebChatConnectionState } from "../Actions/ConnectionState";
import { CONNECTION_STATE_DISCONNECTED } from "./Chat/Constant";
import { setConnectionStatus } from "../Components/WebChat/Common/FileUploadValidation";
import { encryptAndStoreInLocalStorage } from "../Components/WebChat/WebChatEncryptDecrypt";

const isOnline = () => {
    setTimeout(() => {
        Store.dispatch(appOnlineStatusAction(true));
    }, 1500);
}
const isOffline = () => {
    Store.dispatch(appOnlineStatusAction(false));
    // Update connection status
    encryptAndStoreInLocalStorage("connection_status", CONNECTION_STATE_DISCONNECTED);
    setConnectionStatus(CONNECTION_STATE_DISCONNECTED);
    Store.dispatch(WebChatConnectionState(CONNECTION_STATE_DISCONNECTED));
}

// Register window event listener
export const registerWindowEvent = () => {

    if (window.addEventListener) {
        window.addEventListener("online", ()=> isOnline(), false);
        window.addEventListener("offline", ()=> isOffline(), false);
    }
    else {
        document.body.ononline = isOnline;
        document.body.onoffline = isOffline;
    }
}
