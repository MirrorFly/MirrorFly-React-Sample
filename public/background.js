/**
* Listens for the app launching then creates the window
*/
let ba = chrome.action;


// Function to open the chrome extension into new chrome window
let windowNotOpenTitle = 'Open popup window';
let windowIsOpenTitle = 'Popup window is already open. Click to focus popup.';
let popupWindowId = false; //popupWindowId can be true, false, or the popup's window Id.
let windowStatus = true;
chrome.action.onClicked.addListener(function () {
   let width= 1100;
   let height= 650;
   if(popupWindowId === false) {
       popupWindowId = true; //Prevent user pressing the button multiple times.
       chrome.action.setTitle({title:windowIsOpenTitle});
       chrome.windows.create({
           'url': 'https://web.mirrorfly.com/',
           'type': 'panel',
           'width': width,
           'height': height,
           // 'left': (screen.width/2) - (width/2),
           // 'top': (screen.height/2) - (height/2),
           'focused': true,
       },function(win){
           popupWindowId = win.id;
       });
     
   } else if(typeof popupWindowId === 'number'){
       let stateValue = (windowStatus) ? "normal" : "minimized";
       let updateInfo = {state: stateValue, focused:true};
       //The window is open, and the user clicked the button., Focus the window.
       chrome.windows.update(popupWindowId,  updateInfo);
       windowStatus = !windowStatus;
    }
 });
 
 
 chrome.windows.onRemoved.addListener(function (winId){
    if(popupWindowId === winId){
      chrome.action.setTitle({title:windowNotOpenTitle});
        popupWindowId = false;
    }
 });
 
 
 chrome.runtime.onMessage.addListener(  
  function(request, sender, sendResponse) {
    setUnread(request.unreadMessageCount);
    sendResponse({farewell: "New chat : Mirrorfly"});
 });
 
 
 
 
 // Function to show the unread message count in the chrome extension icon
 function setUnread(unreadMessageCount) {
 if(unreadMessageCount > 0) {
  chrome.action.setBadgeBackgroundColor({color: "green"});
  chrome.action.setBadgeText({text: '' + unreadMessageCount });
 } else {
  chrome.action.setBadgeText({'text': ''});
 }
 }
 
 
 
 
 
