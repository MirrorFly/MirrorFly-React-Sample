import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import ClearDeleteOption from '../../../../Components/WebChat/ContactInfo/ClearDeleteOption';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> ClearDeleteOption Test case <<<", () => {

    it('Mock has be created Users modalProps undefined', () => {
        const monckData = {
            logoutStatus: jest.fn(),
            isAdmin: true,
            ClearPopupAction: jest.fn(),
            deletePopupAction: jest.fn(),
            dispatchExitAction: jest.fn(),
            handleNewParticipants: jest.fn(),
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {},
            featureStateData: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <ClearDeleteOption {...monckData} />
            </Provider>);
    });

    it('Mock has be created Users participants', () => {
        const monckData = {
            participants: ["1", "3"],
            isAdmin: true,
            ClearPopupAction: jest.fn(),
            deletePopupAction: jest.fn(),
            dispatchExitAction: jest.fn(),
            handleNewParticipants: jest.fn(),
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {},
            featureStateData: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <ClearDeleteOption {...monckData} />
            </Provider>);
    });
});
