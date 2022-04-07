import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import TypingStatus from '../../../../Components/WebChat/Common/TypingStatus';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> TypingStatus Test case <<<", () => {
    it('Mock has be created Users', () => {
        const monckData = {
            fromUserId: jest.fn(),
            chatType: "groupchat",
            jid: "",
            contactNames: "naveen"
        };
        const store = mockStore({
            typingData: {
                id: "",
                data: []
            },
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <TypingStatus {...monckData} />
            </Provider>);
    });
    it('Mock has be created Users', () => {
        const monckData = {
            fromUserId: jest.fn(),
            chatType: "chat",
            jid: "",
            contactNames: "naveen"
        };
        const store = mockStore({
            typingData: {
                id: "",
                data: []
            },
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <TypingStatus {...monckData} />
            </Provider>);
    });
});
