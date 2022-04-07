import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import ProgressLoader from '../../../../Components/WebChat/Conversation/ProgressLoader';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> ProgressLoader Test case <<<", () => {

    it('Mock has be created Users modalProps undefined', () => {
        const monckData = undefined;
        const store = mockStore({
            appOnlineStatus: {
                isOnline: true
            },
        });
        wrapper = mount(
            <Provider store={store}>
                <ProgressLoader {...monckData} />
            </Provider>);
    });

    it('Mock has be created Users modalProps', () => {
        const monckData = {
            uploadStatus: 3,
            msgId: "",
            file_url: "",
            isSender: true,
            imgFileDownloadOnclick: jest.fn()
        };
        const store = mockStore({
            appOnlineStatus: {
                isOnline: true
            },
        });
        wrapper = mount(
            <Provider store={store}>
                <ProgressLoader {...monckData} />
            </Provider>);
    });

    it('div click', () => {
        wrapper.find('div[data-jest-id="jesthandleMediaClick"]').simulate('click');
    });

    it('Mock has be created Users modalProps undefined', () => {
        const monckData = {
            uploadStatus: 0,
            msgId: "",
            file_url: "",
            isSender: false,
            imgFileDownloadOnclick: jest.fn()
        };
        const store = mockStore({
            appOnlineStatus: {
                isOnline: true
            },
        });
        wrapper = mount(
            <Provider store={store}>
                <ProgressLoader {...monckData} />
            </Provider>);
    });

    it('div click', () => {
        wrapper.find('div[data-jest-id="jestcancelMediaUpload"]').simulate('click');
    });

    it('Mock has be created Users modalProps undefined', () => {
        const monckData = {
            uploadStatus: 8,
            msgId: "",
            file_url: "",
            isSender: false,
            imgFileDownloadOnclick: jest.fn()
        };
        const store = mockStore({
            appOnlineStatus: {
                isOnline: true
            },
        });
        wrapper = mount(
            <Provider store={store}>
                <ProgressLoader {...monckData} />
            </Provider>);
    });


    it('div click', () => {
        wrapper.find('div[data-jest-id="jestcancelMediaUpload"]').simulate('click');
    });

    it('Mock has be created Users modalProps undefined', () => {
        const monckData = {
            uploadStatus: 4,
            msgId: "",
            file_url: "",
            isSender: false,
            imgFileDownloadOnclick: jest.fn()
        };
        const store = mockStore({
            appOnlineStatus: {
                isOnline: true
            },
        });
        wrapper = mount(
            <Provider store={store}>
                <ProgressLoader {...monckData} />
            </Provider>);
    });

});
