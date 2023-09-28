import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import WebChatContactInfoMedia from '../../../../Components/WebChat/ContactInfo/WebChatContactInfoMedia';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> ShowMediaInDetailPopup Test case <<<", () => {
   
    it('Mock has be props undefined', () => {
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <WebChatContactInfoMedia {...undefined} />
            </Provider>);
    });

    it('Mock has be created Users', () => {
        const monckData = {
            chatType: "chat"
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <WebChatContactInfoMedia {...monckData} />
            </Provider>);
    });

    it('Mock has be created Users', () => {
        const monckData = {
            chatType: "chat"
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <WebChatContactInfoMedia {...monckData} />
            </Provider>);
    });


});
