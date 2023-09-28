import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import VideoPlayer from '../../../../Components/WebChat/Conversation/VideoPlayer';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> VideoPlayer Test case <<<", () => {

    it('Mock has be created Users props undefined', () => {
        const monckData = undefined;
        const store = mockStore({
            appOnlineStatus: {
                isOnline: true
            },
        });
        wrapper = mount(
            <Provider store={store}>
                <VideoPlayer {...monckData} />
            </Provider>);
    });

    it('Mock has be created Users props undefined', () => {
        const monckData = {
            fileType: "audio",
            msgId:"12345"

        };
        const store = mockStore({
            appOnlineStatus: {
                isOnline: true
            },
        });
        wrapper = mount(
            <Provider store={store}>
                <VideoPlayer {...monckData} />
            </Provider>);
    });
});
