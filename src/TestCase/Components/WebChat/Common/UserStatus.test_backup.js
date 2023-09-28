import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import UserStatus from '../../../../Components/WebChat/Common/UserStatus';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> Emoji Test case <<<", () => {
    it('Mock has be created Users', () => {
        const monckData = {
            onEmojiClick: jest.fn(),
            emojiState: true
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <UserStatus {...monckData} />
            </Provider>);
    });

    it('blocked user', () => {
        const monckData = {
            blocked: true
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <UserStatus {...monckData} />
            </Provider>);
    });

    it('blocked user', () => {
        const monckData = {
            blocked: undefined,
            userId:"123"
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <UserStatus {...monckData} />
            </Provider>);
    });
});
