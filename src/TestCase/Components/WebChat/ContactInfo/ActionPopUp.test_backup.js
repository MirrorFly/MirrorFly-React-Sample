import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import ActionPopUp from '../../../../Components/WebChat/ContactInfo/ActionPopUp';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> ActionPopUp Test case <<<", () => {

    it('Mock has be created Users modalProps undefined', () => {
        const monckData = {
            logoutStatus: jest.fn(),
            modalProps: undefined
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <ActionPopUp {...monckData} />
            </Provider>);
    });

    it('Mock has be created Users modalProps undefined', () => {
        const monckData = {
            logoutStatus: jest.fn(),
            modalProps: {
                action: undefined,
            }
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <ActionPopUp {...monckData} />
            </Provider>);
    });


    it('Mock has be created Users ExitGroup', () => {
        const monckData = {
            logoutStatus: jest.fn(),
            modalProps: {
                action: "ExitGroup",
            }
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <ActionPopUp {...monckData} />
            </Provider>);
    });

    it('Mock has be created Users props undefined', () => {
        const monckData = undefined;
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <ActionPopUp {...monckData} />
            </Provider>);
    });

    it('Mock has be created Users props undefined', () => {
        const monckData = {
            logoutStatus: jest.fn(),
            modalProps: {
                action: "ExitGroup",
            }
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <ActionPopUp {...monckData} />
            </Provider>);
    });

    it('labelToDisplay click', () => {
        wrapper.find('button[data-jest-id="jesthandleAction"]').simulate('click');
    });

    it('Mock has be created Users groupMakeAdmin', () => {
        const monckData = {
            logoutStatus: jest.fn(),
            modalProps: {
                action: "groupMakeAdmin",
            }
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <ActionPopUp {...monckData} />
            </Provider>);
    });

    it('labelToDisplay click', () => {
        wrapper.find('button[data-jest-id="jesthandleAction"]').simulate('click');
    });

    it('Mock has be created Users DeleteGroup', () => {
        const monckData = {
            logoutStatus: jest.fn(),
            modalProps: {
                action: "DeleteGroup",
            }
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <ActionPopUp {...monckData} />
            </Provider>);
    });
    it('Mock has be created Users default', () => {
        const monckData = {
            logoutStatus: jest.fn(),
            modalProps: {
                action: "default",
            }
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <ActionPopUp {...monckData} />
            </Provider>);
    });

    it('labelToDisplay click', () => {
        wrapper.find('button[data-jest-id="jesthandleAction"]').simulate('click');
    });
});
