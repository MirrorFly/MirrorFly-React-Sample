import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import CapturePicture from '../../../../Components/WebChat/Camera/CapturePicture';
import WebChatCamera from '../../../../Components/WebChat/WebChatVCard/WebChatCamera';
import WebChatEmoji from '../../../../Components/WebChat/WebChatEmoji';
import ContentEditable from '../../../../Components/WebChat/Conversation/Templates/Common/ContentEditable';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> TakeCameraPicture Test case <<<", () => {
    it('Mock has be created Users', () => {
        const monckData = {
            photoTaken: false,
            loader: false,
            imgSrc: false,
            onCameraCheck: jest.fn(),
            handleCropImage: jest.fn(),
            setWebcamImage: jest.fn(),
            cropEnabled: jest.fn(),
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <CapturePicture {...monckData} />
            </Provider>);
    });

    it('WebChatCamera sendFile', () => {
        const dataFined = wrapper.find(WebChatCamera).first()
        dataFined.props().sendFile();
    });

    it('WebChatCamera onCameraCheck', () => {
        const dataFined = wrapper.find(WebChatCamera).first()
        dataFined.props().onCameraCheck();
    });

    it('Mock has be created Users photoTaken true and loader false', () => {
        const monckData = {
            loader: true,
            imgSrc: false,
            photoTaken: true,
            cropEnabled: jest.fn(),
            onCameraCheck: jest.fn(),
            setWebcamImage: jest.fn(),
            handleCropImage: jest.fn(),
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <CapturePicture {...monckData} />
            </Provider>);
    });


    it('Mock has be created Users photoTaken true and loader false', () => {
        const monckData = {
            loader: false,
            imgSrc: false,
            photoTaken: true,
            cropEnabled: jest.fn(),
            onCameraCheck: jest.fn(),
            setWebcamImage: jest.fn(),
            handleCropImage: jest.fn(),
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <CapturePicture {...monckData} />
            </Provider>);
    });

    it('TakeCameraPicture find setMessage handle', () => {
        wrapper.find('i[data-id="jestsetMessage"]').simulate('click');
    });

    it('setWebcamImage negative size', () => {
        const dataFined = wrapper.find(WebChatEmoji).first()
        dataFined.props().onEmojiClick();
    });

    it('ContentEditable undefined check', () => {
        const dataFined = wrapper.find(ContentEditable).first()
        dataFined.props().handleMessage({ target: { value: undefined } });
    });

    it('ContentEditable null check', () => {
        const dataFined = wrapper.find(ContentEditable).first()
        dataFined.props().handleMessage({ target: { value: undefined } });
    });

    it('setWebcamImage negative size', () => {
        const dataFined = wrapper.find(ContentEditable).first()
        dataFined.props().handleMessage({ target: { value: "12345667677" } });
    });
    it('setWebcamImage  size', () => {
        const dataFined = wrapper.find(ContentEditable).first()
        dataFined.props().onKeyDownListner({ preventDefault: jest.fn(), which: 13, target: { value: "12345667677" } });
    });

    it('setWebcamImage negative size', () => {
        const dataFined = wrapper.find(ContentEditable).first()
        dataFined.props().onKeyDownListner({ preventDefault: jest.fn(), which: -1, target: { value: "12345667677" } });
    });

    it('setSelectedText click props', () => {
        const dataFined = wrapper.find(ContentEditable).first()
        dataFined.props().setSelectedText({ preventDefault: jest.fn(), which: -1, target: { value: "12345667677" } });
    });

    it('onInputListener click props', () => {
        const dataFined = wrapper.find(ContentEditable).first()
        dataFined.props().onInputListener({ preventDefault: jest.fn(), which: -1, target: { value: "12345667677" } });
    });

    it('handleOnFocus click props', () => {
        const dataFined = wrapper.find(ContentEditable).first()
        dataFined.props().handleOnFocus({ preventDefault: jest.fn(), which: -1, target: { value: "12345667677" } });
    });

});
