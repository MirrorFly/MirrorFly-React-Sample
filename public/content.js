
  window.addEventListener("storage", function () {
       let msgCount = (localStorage.getItem('unreadMessageCount')) ? localStorage.getItem('unreadMessageCount') : "";
       let unreadMessageCount = msgCount ? msgCount : '0';
        chrome.runtime.sendMessage( 
            {
                
                 unreadMessageCount: unreadMessageCount
            },
            function(response) {}
        );
    

},false)
 