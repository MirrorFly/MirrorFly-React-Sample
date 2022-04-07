import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { ls } from './Helpers/LocalStorage';
import Loader from './Components/Layouts/Loader';
import SDK from './Components/SDK'
import "./assets/scss/common.scss";
import { getLocalUserDetails } from './Helpers/Chat/User';

window.addEventListener("DOMContentLoaded", function() {
    ls.removeItem("new_recent_chat_data");
 });
window.onbeforeunload = function() {
    sessionStorage.removeItem("isLogout");
    const  callConnectionData = JSON.parse(localStorage.getItem('call_connection_status'))
    if(callConnectionData && callConnectionData.from){
      let vcardData = getLocalUserDetails();
      let userJid = callConnectionData.userJid ? callConnectionData.userJid : callConnectionData.from;
      userJid = userJid.includes("@") ? userJid.split('@')[0] : userJid;
      if (userJid === vcardData.fromUser){
        console.log("call data ending call in the browser refresh");
        SDK.endCall();
      }
    }
    localStorage.removeItem('roomName');
    localStorage.removeItem('callType');
    localStorage.removeItem('call_connection_status');
    localStorage.removeItem('connecting');
    localStorage.setItem('callingComponent',false);
  };

let ProviderComponent = React.lazy(() => import('./Provider/ProviderComponent'));
ReactDOM.render(<Suspense fallback={<Loader />}><ProviderComponent /></Suspense>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
