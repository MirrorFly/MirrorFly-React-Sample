import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import AudioRecorder from '../../../../Components/WebChat/Common/AudioRecorder';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> AudioRecorder Test case <<<", () => {
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
                <AudioRecorder {...monckData} />
            </Provider>);
    });

    it('mediaDevices Handle', async () => {
        const mockMediaDevices = {
            getUserMedia: jest.fn().mockResolvedValueOnce({ active: false }),
        };
        Object.defineProperty(window.navigator, 'mediaDevices', {
            writable: true,
            value: mockMediaDevices,
        });
        const btn = wrapper.find("a").find(".recordAudio");
        btn.simulate("click");
    });
});
