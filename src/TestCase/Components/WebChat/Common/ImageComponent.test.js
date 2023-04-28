import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import ImageComponent from '../../../../Components/WebChat/Common/ImageComponent';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> ImageComponent Test case <<<", () => {
    it('Mock has be created empty value', () => {
        const monckData = {
            userToken: "",
            imageToken: "",
            blocked: false,
            chatType: "chat",
            temporary: true,
            getImageUrl: "",
            onclickHandler: jest.fn(),
            imageType: "profileimages",
            emojiState: true
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <ImageComponent {...monckData} />
            </Provider>);
    });

    it('Mock has be created blocked value chage', () => {
        const monckData = {
            userToken: "",
            imageToken: "1vt7xn1cmb1633434630115XtS3RCzekyoBbteb3tAv.jpeg",
            blocked: false,
            chatType: "chat",
            temporary: true,
            getImageUrl: "",
            onclickHandler: jest.fn(),
            imageType: "profileimages",
            emojiState: true
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <ImageComponent {...monckData} />
            </Provider>);
    });

    it('Mock has be created blobCheck', () => {
        const monckData = {
            userToken: "http://1vt7xn1cmb1633434630115XtS3RCzekyoBbteb3tAv.jpeg",
            imageToken: "blob:https://fiddle.jshell.net/e53ac4a0-ce77-47e8-8971-0d12e2838969",
            blocked: false,
            chatType: "chat",
            temporary: true,
            getImageUrl: "",
            onclickHandler: jest.fn(),
            imageType: "profileimages",
            emojiState: true
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <ImageComponent {...monckData} />
            </Provider>);
    });

    it('Mock has be created temporary is true', () => {
        const monckData = {
            userToken: "http://1vt7xn1cmb1633434630115XtS3RCzekyoBbteb3tAv.jpeg",
            imageToken: "",
            blocked: false,
            chatType: "chat",
            temporary: true,
            getImageUrl: "",
            onclickHandler: jest.fn(),
            imageType: "profileimages",
            emojiState: true
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <ImageComponent {...monckData} />
            </Provider>);
    });
    
    it('imageRender onload', () => {
        wrapper.find('img[data-jest-id="jestImageComponent"]').simulate('load', { preventDefault: jest.fn(), target: { style: { backgroundImage: "green" } } });
    });

    it('imageRender onload', () => {
        wrapper.find('img[data-jest-id="jestImageComponent"]').simulate('load', { preventDefault: jest.fn(), target: { style: { backgroundImage: "green" } } });
    });

    it('imageRender onerror', () => {
        wrapper.find('img[data-jest-id="jestImageComponent"]').simulate('error', { preventDefault: jest.fn(), target: { src: "" } });
    });

});
