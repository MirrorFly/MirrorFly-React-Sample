import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import ProfileImage from '../../../../Components/WebChat/Common/ProfileImage';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> ProfileImage Test case <<<", () => {
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
                <ProfileImage {...monckData} />
            </Provider>);
    });

});
