import Store from '../../Store';
import { browserTabAction } from '../../Actions/BrowserAction';

const browserTab = {
    isTabVisible: true,
    updateTabVisible: (isTabVisible) => {
        browserTab.isTabVisible = isTabVisible;
        Store.dispatch(browserTabAction(browserTab.isTabVisible));
    },
    init: () => {
        Store.dispatch(browserTabAction(browserTab.isTabVisible));
        document.addEventListener("visibilitychange", function() {
            browserTab.updateTabVisible(!document.hidden);
        }, false);

        document.addEventListener('focus', function() {
            browserTab.updateTabVisible(true);
        }, false);

        document.addEventListener('blur', function() {
        }, false);

        window.addEventListener('focus', function() {
            browserTab.updateTabVisible(true);
        }, false);

        window.addEventListener('blur', function() {
        }, false);

        // pagehide - event listener for SAFARI browser.
        // Need to check the working process this event & then implement
        // logic for send notification
        // window.addEventListener("pagehide", event => {
        //     console.log('pagehide --- ', event.persisted);
        //     if (event.persisted) {
        //       /* the page isn't being discarded, so it can be reused later */
        //     }
        // }, false);
    },
    isVisible: () => {
        return Store.getState()?.browserTabData?.isVisible
    }
}

export default browserTab;
