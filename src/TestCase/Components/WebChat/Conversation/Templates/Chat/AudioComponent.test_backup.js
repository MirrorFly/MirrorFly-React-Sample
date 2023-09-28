import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import AudioPlayer from 'react-h5-audio-player';
import configureMockStore from 'redux-mock-store';
import AudioComponent from '../../../../../../Components/WebChat/Conversation/Templates/Chat/AudioComponent';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe("AudioComponent Test cover", () => {

    it('Mock has be created props undefined', () => {
        const monckData = undefined;
        const store = mockStore({

        });
        wrapper = mount(
            <Provider store={store}>
                <AudioComponent {...monckData} />
            </Provider>);
    });

    it('Mock has be created props undefined', () => {
        const monckData = {
            pageType: "starPage",
            messageObject: {},
            uploadStatus: 2,
            mediaUrl: "",
            audioFileDownloadOnclick: jest.fn(),
        };
        const store = mockStore({

        });
        wrapper = mount(
            <Provider store={store}>
                <AudioComponent {...monckData} />
            </Provider>);
    });

    it('wrapper AudioPlayer onPlayError', () => {
        const wrapAudioComponet = wrapper.find(AudioPlayer).first();
        wrapAudioComponet.props().onPlayError();
    });

    it('wrapper AudioPlayer onEnded', () => {
        const wrapAudioComponet = wrapper.find(AudioPlayer).first();
        wrapAudioComponet.props().onEnded({ target: { play: jest.fn() } });
    });

    it('wrapper AudioPlayer onPause', () => {
        const wrapAudioComponet = wrapper.find(AudioPlayer).first();
        wrapAudioComponet.props().onPause();
    });

    it('wrapper AudioPlayer onPlay', () => {
        const wrapAudioComponet = wrapper.find(AudioPlayer).first();
        wrapAudioComponet.props().onPlay();
    });

    it('wrapper AudioPlayer onSeeking', () => {
        const wrapAudioComponet = wrapper.find(AudioPlayer).first();
        wrapAudioComponet.props().onSeeking();
    });

});
