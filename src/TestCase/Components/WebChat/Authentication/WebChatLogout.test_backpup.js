import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import WebChatLogout from '../../../../Components/WebChat/Authentication/WebChatLogout';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> WebChatLogout Test case <<<", () => {
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
                <WebChatLogout {...monckData} />
            </Provider>);
    });

    it('logOut', () => {
        wrapper.find('li[data-id="jesthandleLogoutStatus"]').simulate('click');
    });

    it('logOut negative', () => {
        wrapper.find('li[data-id="jesthandleLogoutStatus"]').simulate('click', undefined);
    });

});
