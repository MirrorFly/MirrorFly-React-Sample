import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import WebChatPopup from '../../../../Components/WebChat/Authentication/WebChatPopup';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> WebChatPopup Test case <<<", () => {
    it('Mock has be created Users', () => {
        const monckData = {
            logoutStatus: jest.fn(),
            emojiState: true
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <WebChatPopup {...monckData} />
            </Provider>);
    });

    it('cancel', () => {
        wrapper.find('button[data-id="jesthandleLogoutCancel"]').simulate('click');
    });

    it('logOut', () => {
        wrapper.find('button[data-id="jesthandleLogout"]').simulate('click');
    });
});
