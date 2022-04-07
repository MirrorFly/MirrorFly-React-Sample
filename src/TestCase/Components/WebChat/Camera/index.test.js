import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import Camera from '../../../../Components/WebChat/Camera';
import TakeCameraPicture from '../../../../Components/WebChat/Camera/TakeCameraPicture';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper, subComponent;
describe(">>> Camera Test case <<<", () => {
    it('Mock has be created Users', () => {
        const monckData = {
            onClickClose: jest.fn(),
            cropEnabled: jest.fn(),
            stopCameraPermissionTracks: jest.fn(),
            emojiState: true
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <Camera {...monckData} />
            </Provider>);
    });
    it('TakeCameraPicture find permission denied', () => {
        const dataFined = wrapper.find(TakeCameraPicture).first()
        dataFined.props().onCameraCheck({ name: "NotAllowedError" });
    });

    it('TakeCameraPicture find permission denied', () => {
        const dataFined = wrapper.find(TakeCameraPicture).first()
        dataFined.props().onCameraCheck({ name: "NotFoundError" });
    });

    it('setWebcamImage undefined check', () => {
        const dataFined = wrapper.find(TakeCameraPicture).first()
        dataFined.props().setWebcamImage(undefined);
    });

    it('setWebcamImage', () => {
        const dataFined = wrapper.find(TakeCameraPicture).first()
        dataFined.props().setWebcamImage({ name: "NotFoundError" });
    });

    it('setWebcamImage', () => {
        const dataFined = wrapper.find(TakeCameraPicture).first()
        dataFined.props().setWebcamImage(undefined);
    });

    it('setWebcamImage negative size', () => {
        const dataFined = wrapper.find(TakeCameraPicture).first()
        dataFined.props().setWebcamImage({ size: -10 });
    });

    it('setWebcamImage image undefined size pass', () => {
        const dataFined = wrapper.find(TakeCameraPicture).first()
        dataFined.props().setWebcamImage({ size: undefined });
    });

    it('setWebcamImage image null size pass', () => {
        const dataFined = wrapper.find(TakeCameraPicture).first()
        dataFined.props().setWebcamImage({ size: null });
    });

    it('setWebcamImage image null size pass', () => {
        Object.defineProperty(global, 'FileReader', {
            writable: true,
            value: jest.fn().mockImplementation(() => ({
                target: { result: '' },
                readAsDataURL: jest.fn(),
                onLoad: jest.fn()
            })),
        })
        const dataFined = wrapper.find(TakeCameraPicture).first()
        dataFined.props().setWebcamImage({ size: 1024 });
    });

    it('setWebcamImage cropEnabled undefined', () => {
        const dataFined = wrapper.find(TakeCameraPicture).first()
        dataFined.props().cropEnabled(undefined);
    });

    it('setWebcamImage handleCameraShow undefined', () => {
        const dataFined = wrapper.find(TakeCameraPicture).first()
        dataFined.props().handleCameraShow(undefined);
    });

    it('setWebcamImage handleCameraShow null', () => {
        const dataFined = wrapper.find(TakeCameraPicture).first()
        dataFined.props().handleCameraShow(null);
    });

    it('setWebcamImage handleCameraShow', () => {
        const dataFined = wrapper.find(TakeCameraPicture).first()
        dataFined.props().handleCameraShow();
    });

    it('setWebcamImage handleCameraShow null', () => {
        const dataFined = wrapper.find(TakeCameraPicture).first()
        dataFined.props().handleCameraPopupClose(null);
    });

    it('setWebcamImage handleCameraShow undefined', () => {
        const dataFined = wrapper.find(TakeCameraPicture).first()
        dataFined.props().handleCameraPopupClose(undefined);
    });

    it('setWebcamImage handleCameraShow undefined', () => {
        const dataFined = wrapper.find(TakeCameraPicture).first()
        dataFined.props().handleCameraPopupClose();
    });

    it('Mock has be created without cropEnabled', () => {
        const monckData = {
            onClickClose: jest.fn(),
            onSuccess:jest.fn(),
            stopCameraPermissionTracks: jest.fn(),
            emojiState: true
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <Camera {...monckData} />
            </Provider>);
    });

    it('setWebcamImage handleCameraShow undefined', () => {
        const dataFined = wrapper.find(TakeCameraPicture).first()
        dataFined.props().handleCropImage(undefined);
    });

    it('setWebcamImage handleCameraShow null', () => {
        const dataFined = wrapper.find(TakeCameraPicture).first()
        dataFined.props().handleCropImage(null);
    });

    it('setWebcamImage handleCameraShow null', () => {
        const dataFined = wrapper.find(TakeCameraPicture).first()
        dataFined.props().handleCropImage("data");
    });

});
