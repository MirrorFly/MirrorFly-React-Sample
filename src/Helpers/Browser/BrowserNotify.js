import Push from 'push.js';
import Store from '../../Store';
import { browserNotifyAction } from '../../Actions/BrowserAction';
import IndexedDb from '../IndexedDb';
import { getAvatarImage, groupAvatar } from '../../Components/WebChat/Common/Avatarbase64';
import { getGroupData } from '../Chat/Group';
import { getCallDisplayDetailsForOnetoManyCall } from '../Call/Call';
import { getUserDetails } from '../Chat/User';
import { shouldHideNotification } from '../Utility';
import {getFromLocalStorageAndDecrypt} from '../../Components/WebChat/WebChatEncryptDecrypt';

const getGroupDetails = (groupId) => {
    let rosterData = {};
    let group = getGroupData(groupId);
    rosterData.displayName = group.groupName;
    rosterData.image = group.groupImage;
    rosterData.thumbImage = group.thumbImage;
    rosterData.jid = group.groupId;
    rosterData.chatType = "groupchat";
    return rosterData;
}

const browserNotify = {
    timeOut: 8000,
    isPageHidden: false,
    init: function(){
        Push.Permission.request(() => {}, () => {});
        document.addEventListener(
            "visibilitychange",
            () => {
              browserNotify.isPageHidden = document.hidden;
            },
            false
          );
    },
    requestPermission: function(){
        Push.Permission.request(() => {},() => {}); 
    },
    hasPermission: function(){
        const webSettings = getFromLocalStorageAndDecrypt('websettings')
        let parseredWebSettings = webSettings ? JSON.parse(webSettings) : {}
        const { Notifications = true } = parseredWebSettings;
        return Notifications && Push.Permission.has();
    },
    hasPermissionForCall: function(){
        const browserTab = Store.getState().browserTabData;
        return !browserTab.isVisible && browserNotify.hasPermission();
    },
    sendCallNotification: function(callDetailObj){
        if(!browserNotify.hasPermissionForCall()) return;
        let rosterData = {};
        let user = "";
        let displayName = "";
        if(callDetailObj.callMode === "onetoone"){
            user = callDetailObj.to;
            rosterData = getUserDetails(user);
            displayName = rosterData.displayName;
        } else if(callDetailObj.callMode === "onetomany"){
            if(callDetailObj.groupId !== null && callDetailObj.groupId !== undefined){
                user = callDetailObj.groupId.includes("@") ? callDetailObj.groupId.split('@')[0] : callDetailObj.groupId
                rosterData = getGroupDetails(user);
                displayName = rosterData.displayName;
            } else {
                let userList = callDetailObj.userList.split(",");
                rosterData = getCallDisplayDetailsForOnetoManyCall(userList);
                displayName = rosterData.displayName;                
            }
        }
        if(!rosterData) return;
        let title = null;
        let pageName = null;
        const isGroupCall = callDetailObj.callMode === 'onetomany';

        if(callDetailObj.status === "calling"){
            pageName = 'calleescreen';
            title = `Incoming ${isGroupCall ? 'group' : ''} ${callDetailObj.callType} call`;
            if (shouldHideNotification() && browserNotify.isPageHidden) {
                displayName = "New Incoming Call";
            }
        }
        else if(callDetailObj.status === "ended"){
            pageName = 'calllog';
            title = `You missed ${!isGroupCall && callDetailObj.callType === "audio" ? "an" : "a" }${isGroupCall ? ' group' : ''} ${callDetailObj.callType} call`;
            if (shouldHideNotification() && browserNotify.isPageHidden) {
                displayName = "New Missed Call";
            }
        }

        if(!title) return;

        let notifyBody = {
            body: displayName,
            onClick: function(){
                // Reset the browser notify store
                Store.dispatch(browserNotifyAction());
                Store.dispatch(browserNotifyAction(pageName));
                window.focus();
                this.close();
            }
        }

        if(rosterData.image){
            let image = (rosterData.thumbImage && rosterData.thumbImage !== "") ? rosterData.thumbImage : rosterData.image;
            const localDb = new IndexedDb();
            if(Array.isArray(image)){
                image = image[0];
            }
            localDb.getImageByKey(image, 'profileimages').then(blob => {
                const blobUrl = window.URL.createObjectURL(blob);
                browserNotify.sendNotification(title, {...notifyBody, icon: blobUrl});
            }).catch(err => {
                const avatarImage = callDetailObj.callMode === 'onetomany' ? getAvatarImage : groupAvatar
                browserNotify.sendNotification(title, {...notifyBody, icon: avatarImage});
            })
            return;
        }

        browserNotify.sendNotification(title, notifyBody);
    },
    sendNotification: function(title, bodyObj = {}){
        if(!title) return;
        const webSettings = getFromLocalStorageAndDecrypt('websettings')
        let parseredWebSettings = webSettings ? JSON.parse(webSettings) : {}
        const { Sound = false } = parseredWebSettings;
        bodyObj = {...bodyObj, timeout: browserNotify.timeOut, silent:Sound};
        Push.create(title, bodyObj);
    }
}

export default browserNotify;
