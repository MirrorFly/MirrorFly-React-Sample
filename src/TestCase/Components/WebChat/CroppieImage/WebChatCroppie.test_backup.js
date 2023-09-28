import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import WebChatCroppie from '../../../../Components/WebChat/CroppieImage/WebChatCroppie';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> WebChatCroppie Test case <<<", () => {
    it('Mock has be created Users props undefined', () => {
        const monckData = undefined
        const store = mockStore(undefined);
        wrapper = mount(
            <Provider store={store}>
                <WebChatCroppie {...monckData} />
            </Provider>);
    });

    it('Mock has be created Users props undefined', () => {
        const monckData = {
            closeDropDown: jest.fn(),
            loader: false,
            cameraPopup: true,
            closePopUp: jest.fn(),
        }
        const store = mockStore(undefined);
        wrapper = mount(
            <Provider store={store}>
                <WebChatCroppie {...monckData} />
            </Provider>);
    });

    it('jestfileChangedHandler click', () => {
        wrapper.find('input[data-jest-id="jestfileChangedHandler"]').simulate('click', { name: "naveen" });
    });

    it('jestfileChangedHandler change', () => {
        wrapper.find('input[data-jest-id="jestfileChangedHandler"]').simulate('change', { name: "naveen" });
    });

    it('jestfileChangedHandler change', () => {
        wrapper.find('input[data-jest-id="jestfileChangedHandler"]').simulate('change', { name: "" });
    });

    it('jesthandleProfileCameraClose click', () => {
        wrapper.find('i[data-jest-id="jesthandleProfileCameraClose"]').simulate('click');
    });

});
