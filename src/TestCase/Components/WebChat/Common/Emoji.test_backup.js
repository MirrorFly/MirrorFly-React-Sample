import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import { Emoji } from '../../../../Components/WebChat/Common/Emoji';
import { Picker } from 'emoji-mart';

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
                <Emoji {...monckData} />
            </Provider>);
    });

    it("Picker an emonji", () => {
        const onEnter = wrapper.find(Picker).first();
        onEnter.props().onSelect();
    });

});
