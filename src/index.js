import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import * as serviceWorker from './serviceWorker';
import Loader from './Components/Layouts/Loader';
import SDK from './Components/SDK'
import "./assets/scss/common.scss";
import { getLocalUserDetails } from './Helpers/Chat/User';
import { deleteItemFromLocalStorage, deleteItemFromSessionStorage, encryptAndStoreInLocalStorage, getFromLocalStorageAndDecrypt, getFromSessionStorageAndDecrypt } from './Components/WebChat/WebChatEncryptDecrypt';

window.addEventListener("DOMContentLoaded", function() {
  deleteItemFromLocalStorage("new_recent_chat_data");
 });
window.onbeforeunload = function() {
  deleteItemFromSessionStorage("isLogout");
    if (getFromLocalStorageAndDecrypt("sessionId") === getFromSessionStorageAndDecrypt("sessionId")) {
      const  callConnectionData = JSON.parse(getFromLocalStorageAndDecrypt('call_connection_status'))
      if(callConnectionData && callConnectionData.from){
        let vcardData = getLocalUserDetails();
        let userJid = callConnectionData.userJid ? callConnectionData.userJid : callConnectionData.from;
        userJid = userJid.includes("@") ? userJid.split('@')[0] : userJid;
        if (userJid === vcardData.fromUser){
          console.log("call data ending call in the browser refresh");
          SDK.endCall();
        }
      }
      deleteItemFromLocalStorage('roomName');
      deleteItemFromLocalStorage('callType');
      deleteItemFromLocalStorage('call_connection_status');
      deleteItemFromLocalStorage('inviteStatus');
      deleteItemFromLocalStorage('connecting');
      encryptAndStoreInLocalStorage('callingComponent',false);
    }

};

let ProviderComponent = React.lazy(() => import('./Provider/ProviderComponent'));
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Suspense fallback={<Loader />}><ProviderComponent /></Suspense>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
